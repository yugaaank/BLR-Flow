import React, { useState, useEffect, useMemo } from 'react';
import { api } from "../services/api";
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin, Activity, AlertCircle, ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CASCADE_REASONS = [
  "Spillover",
  "Signal Blocked",
  "Chokepoint",
  "Lane Blocked"
];

function MapLimits() {
  const { controls, camera } = useThree();
  useFrame(() => {
    if (controls && camera) {
      // Calculate visible bounds based on current camera distance (Z) and FOV
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      
      // The map plane is 40x40 (from -20 to 20 on both axes)
      // Allow a small margin but stop before the edge is visible
      const maxCameraY = Math.max(0, 20 - visibleHeight / 2 - 0.5);
      const maxCameraX = Math.max(0, 20 - visibleWidth / 2 - 0.5);
      
      const minX = -maxCameraX;
      const maxX = maxCameraX;
      const minY = -maxCameraY;
      const maxY = maxCameraY;

      controls.target.x = THREE.MathUtils.clamp(controls.target.x, minX, maxX);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, minY, maxY);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);
    }
  });
  return null;
}

function MapBackground() {
  const texture = useLoader(THREE.TextureLoader, '/bangalore_osm_light.png');
  return (
    <mesh position={[0, 0, -0.5]}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function EventGroup({ event, positions, nodeMap, formattedEdges, isComplete }) {
  const { id, violatedJunction, cascadeJunctions, isDispatched, progress, score, type } = event;
  
  const edgesToRender = useMemo(() => {
    if (!cascadeJunctions || cascadeJunctions.length < 2) return [];
    const validEdges = [];
    const cascadeIds = cascadeJunctions.map(name => nodeMap[name]);
    
    formattedEdges.forEach(e => {
      if (cascadeIds.includes(e.source) && cascadeIds.includes(e.target)) {
        validEdges.push(e);
      }
    });

    return validEdges.map((edge, i) => {
      const fromPos = positions[edge.source];
      const toPos = positions[edge.target];
      if (!fromPos || !toPos) return null;
      
      const sName = Object.keys(nodeMap).find(k => nodeMap[k] === edge.source);
      const tName = Object.keys(nodeMap).find(k => nodeMap[k] === edge.target);
      const sIdx = cascadeJunctions.indexOf(sName);
      const tIdx = cascadeJunctions.indexOf(tName);
      const maxIdx = Math.max(sIdx, tIdx);
      
      const threshold = (maxIdx / Math.max(1, cascadeJunctions.length)) * 0.5;
      if (progress < threshold) return null;

      return (
        <Line 
          key={`edge-${id}-${i}`} 
          points={[fromPos, toPos]} 
          color={isDispatched ? "#059669" : "#dc2626"} 
          lineWidth={isDispatched ? 4 : 3} 
        />
      );
    });
  }, [formattedEdges, cascadeJunctions, positions, nodeMap, progress, isDispatched, id]);

  const nodesToRender = useMemo(() => {
    const nodesList = [];
    
    if (violatedJunction && positions[nodeMap[violatedJunction]]) {
      nodesList.push({
        name: violatedJunction,
        isSource: true,
        pos: positions[nodeMap[violatedJunction]],
        show: true
      });
    }

    (cascadeJunctions || []).forEach((cName, idx) => {
      if (cName === violatedJunction) return;
      const threshold = (idx / Math.max(1, cascadeJunctions.length)) * 0.5;
      if (progress > threshold && positions[nodeMap[cName]]) {
        nodesList.push({
          name: cName,
          isSource: false,
          pos: positions[nodeMap[cName]],
          show: true,
          reason: CASCADE_REASONS[idx % CASCADE_REASONS.length]
        });
      }
    });

    return nodesList.map((n, i) => (
      <group key={`node-${id}-${i}`} position={n.pos}>
        <mesh>
          <sphereGeometry args={[n.isSource ? 0.5 : 0.4, 16, 16]} />
          <meshBasicMaterial color={n.isSource ? "#dc2626" : (isDispatched ? "#059669" : "#dc2626")} />
        </mesh>
        
        {!isComplete && (
          <Html distanceFactor={25} center zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center mt-4 pointer-events-none">
              <div className="bg-slate-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 whitespace-nowrap uppercase tracking-wider shadow-sm">
                {n.name}
              </div>
            {n.isSource && (
              <div className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 whitespace-nowrap font-bold tracking-widest uppercase shadow-sm">
                {type.replace(/_/g, ' ')}
              </div>
            )}
            {!n.isSource && isDispatched && (
              <div className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 mt-0.5 whitespace-nowrap font-medium tracking-wide">
                UNIT DISPATCHED
              </div>
            )}
            {!n.isSource && !isDispatched && n.reason && (
              <div className="text-[8px] bg-gray-800 text-white px-1.5 py-0.5 mt-0.5 whitespace-nowrap font-medium tracking-wide">
                {n.reason}
              </div>
            )}
          </div>
        </Html>
        )}
      </group>
    ));
  }, [violatedJunction, cascadeJunctions, positions, nodeMap, progress, isDispatched, id, type]);

  return (
    <group>
      {edgesToRender}
      {nodesToRender}
    </group>
  );
}

function LiveGraph({ graphData, activeEvents, isComplete }) {
  const { nodes, edges } = graphData;

  const { positions, nodeMap } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { positions: {}, nodeMap: {} };
    const map = {};
    const pos = {};
    const mapSize = 40; 
    const Z = 12;
    const n = Math.pow(2, Z);
    const X_START = 2929;
    const Y_START = 1898;
    const SPAN = 3;

    nodes.forEach(node => {
      map[node.name] = node.id;
      const x_float = (node.longitude + 180.0) / 360.0 * n;
      const lat_rad = node.latitude * Math.PI / 180;
      const y_float = (1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n;
      const px = ((x_float - X_START) / SPAN - 0.5) * mapSize;
      const py = -((y_float - Y_START) / SPAN - 0.5) * mapSize;
      pos[node.id] = new THREE.Vector3(px, py, 0); 
    });
    return { positions: pos, nodeMap: map };
  }, [nodes]);

  const formattedEdges = useMemo(() => {
    if (!edges) return [];
    return edges.map(e => ({
      source: typeof e.source === 'string' ? nodeMap[e.source] : e.source,
      target: typeof e.target === 'string' ? nodeMap[e.target] : e.target,
    }));
  }, [edges, nodeMap]);

  if (!nodes || nodes.length === 0) return null;

  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <React.Suspense fallback={null}>
        <MapBackground />
      </React.Suspense>
      {activeEvents.map(ev => (
        <EventGroup 
          key={ev.id} 
          event={ev} 
          positions={positions} 
          nodeMap={nodeMap} 
          formattedEdges={formattedEdges} 
          isComplete={isComplete}
        />
      ))}
      <OrbitControls 
        makeDefault
        enableDamping={true} 
        dampingFactor={0.05}
        minDistance={2} 
        maxDistance={20} 
        enableRotate={false}
        screenSpacePanning={true}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
      <MapLimits />
    </Canvas>
  );
}

export default function LiveDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [activeEvents, setActiveEvents] = useState([]);
  const activeEventsRef = React.useRef([]);
  const [unseenData, setUnseenData] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Simulation Timer & Stats
  const [isStarted, setIsStarted] = useState(false);
  const [inputDuration, setInputDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({
    totalViolations: 0,
    predictedCascades: 0,
    prevented: 0,
    gridlocks: 0,
    lastHour: null,
    simulatedDays: 1
  });
  
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      now.setFullYear(2025);
      now.setMonth(7); // August
      now.setDate(20);
      now.setHours(9, 0, 0, 0);
      setCurrentTimeStr(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
    };
    updateTime();
  }, []);

  useEffect(() => {
    api.getNetworkGraph().then(data => setGraphData(data));
    api.getUnseenEvents().then(data => setUnseenData(data));
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!isStarted || !graphData.nodes || graphData.nodes.length === 0 || unseenData.length === 0 || isComplete) return;
    
    let queue = [...unseenData];

    const interval = setInterval(async () => {
      if (queue.length === 0) {
        queue = [...unseenData];
      }
      
      const realEvent = queue.shift();
      
      try {
        const result = await api.submitViolation({
          latitude: realEvent.latitude,
          longitude: realEvent.longitude,
          time: realEvent.time, 
          violation_type: realEvent.violation_type
        });

        const cleanType = realEvent.violation_type.replace(/[[\]"]/g, '');
        const actualJunction = (result.cascade_junctions && result.cascade_junctions.length > 0) 
          ? result.cascade_junctions[0] 
          : realEvent.junction_name;

        const newEvent = {
          id: Date.now().toString() + Math.random(),
          violatedJunction: actualJunction,
          cascadeJunctions: result.cascade_junctions || [actualJunction],
          score: result.impact_score,
          type: cleanType,
          progress: 0,
          isDispatched: false,
          isGridlockLogged: false,
          policeBusy: Math.random() < 0.3,
          createdAt: Date.now()
        };

        activeEventsRef.current = [...activeEventsRef.current, newEvent];
        setActiveEvents(activeEventsRef.current);
        
        setStats(s => {
          let newSimulatedDays = s.simulatedDays;
          if (s.lastHour !== null && realEvent.time < s.lastHour) {
            newSimulatedDays += 1;
          }
          return {
            ...s,
            totalViolations: s.totalViolations + 1,
            lastHour: realEvent.time,
            simulatedDays: newSimulatedDays
          };
        });

      } catch (err) {
        console.error("Simulation error", err);
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, [graphData, unseenData, isComplete, isStarted]);

  // Update Progress & Dispatch Logic Loop
  useEffect(() => {
    if (!isStarted || isComplete) return;
    const aiMode = true;

    const ticker = setInterval(() => {
      const now = Date.now();
      let preventsToAdd = 0;
      let gridsToAdd = 0;
      const newLogs = [];

      const nextEvents = activeEventsRef.current.map(ev => {
        const elapsed = (now - ev.createdAt) / 1000;
        let newProgress = Math.min(elapsed / 2, 1);
        
        let newDispatched = ev.isDispatched;
        let newGridlockLogged = ev.isGridlockLogged;
        
        if (elapsed > 2.5) {
          if (ev.score > 75 && aiMode && !newDispatched && !ev.policeBusy) {
            newDispatched = true;
            preventsToAdd++;
            newLogs.push({
              id: ev.id + '-dispatch',
              time: new Date().toLocaleTimeString(),
              msg: `Unit dispatched to ${ev.violatedJunction}`,
              score: ev.score,
              type: 'dispatch'
            });
          } else if (!newDispatched && !newGridlockLogged) {
            newGridlockLogged = true;
            gridsToAdd++;
            newLogs.push({
              id: ev.id + '-gridlock',
              time: new Date().toLocaleTimeString(),
              msg: `Cascade observed at ${ev.violatedJunction}`,
              score: ev.score,
              type: 'gridlock'
            });
          }
        }

        return { ...ev, progress: newProgress, isDispatched: newDispatched, isGridlockLogged: newGridlockLogged };
      }).filter(ev => {
        return (now - ev.createdAt) / 1000 < 12;
      });

      // Update ref and state once
      activeEventsRef.current = nextEvents;
      setActiveEvents(nextEvents);

      // Safe side-effects outside of state updater
      if (preventsToAdd > 0 || gridsToAdd > 0) {
        setStats(s => ({
          ...s,
          predictedCascades: s.predictedCascades + preventsToAdd + gridsToAdd,
          prevented: s.prevented + preventsToAdd,
          gridlocks: s.gridlocks + gridsToAdd
        }));
      }
      
      if (newLogs.length > 0) {
        setLogs(prevLogs => [...newLogs.reverse(), ...prevLogs].slice(0, 50));
      }
    }, 100);

    return () => clearInterval(ticker);
  }, [isStarted, isComplete]);

  // Master Timer Loop
  useEffect(() => {
    if (!isStarted || isComplete) return;
    if (timeLeft <= 0) {
      setIsComplete(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isComplete]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLoadingData = !graphData.nodes || graphData.nodes.length === 0 || unseenData.length === 0;

  return (
    <div className="h-screen w-full bg-white flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="h-14 w-full border-b border-slate-200 px-6 flex justify-between items-center shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-slate-900 flex items-center justify-center">
            <Activity className="text-white w-3 h-3" />
          </div>
          <h1 className="font-display font-bold text-sm tracking-widest uppercase text-slate-900">BLR Flow</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">{currentTimeStr}</div>
          {isStarted && !isComplete && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-mono font-bold text-slate-700">T-MINUS {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Shell Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar: Context / Details */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 shrink-0 flex flex-col relative z-10 overflow-hidden">
          <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider mb-2 text-slate-900">Operations</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Real-time intersection monitoring & automated dispatch for high-risk cascading blockages.
            </p>

            <div className="border-l-2 border-slate-300 pl-4 space-y-4 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500"></div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-widest">High-Risk Incident</div>
                </div>
                <div className="text-xs text-slate-500 ml-4">Probability &gt; 75%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500"></div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-widest">Unit Dispatched</div>
                </div>
                <div className="text-xs text-slate-500 ml-4">Intervention deployed</div>
              </div>
            </div>

            {/* Live Telemetry Section */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-2">Telemetry</h3>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Days Run</div>
                  <div className="font-mono text-3xl text-slate-900">{stats.simulatedDays}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Violations</div>
                  <div className="font-mono text-3xl text-slate-900">{stats.totalViolations}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Prevented</div>
                  <div className="font-mono text-3xl text-emerald-600">{stats.prevented}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Gridlocks</div>
                  <div className="font-mono text-3xl text-red-600">{stats.gridlocks}</div>
                </div>
              </div>

              {/* Success Rate Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success Rate</div>
                  <div className="text-sm font-mono font-bold text-slate-900">
                    {stats.predictedCascades > 0 ? Math.round((stats.prevented / stats.predictedCascades) * 100) : 0}%
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-500 ease-out" 
                    style={{ width: `${stats.predictedCascades > 0 ? (stats.prevented / stats.predictedCascades) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Footer / System Status */}
            <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 ${isStarted && !isComplete ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                   {isStarted && !isComplete ? 'Active' : 'Idle'}
                 </span>
               </div>
               <div className="text-[10px] font-mono font-bold text-slate-400">v1.3.0</div>
            </div>

          </div>
        </div>

        {/* Center: 3D Map Area */}
        <div className="flex-1 relative bg-slate-100 z-0 border-r border-slate-200">
          <div className="absolute inset-0">
            <LiveGraph graphData={graphData} activeEvents={activeEvents} isComplete={isComplete} />
          </div>
        </div>

        {/* Right Sidebar: Event Feeds */}
        <div className="w-96 bg-white shrink-0 flex flex-col relative z-10">
          
          {isComplete && (
            <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
               <div className="flex items-center gap-3 mb-4">
                 <CheckCircle2 size={20} className="text-slate-900" />
                 <h2 className="font-display text-base font-bold text-slate-900 uppercase tracking-widest">Trial Concluded</h2>
               </div>
               
               <div className="mb-6 text-sm text-slate-600 leading-relaxed">
                  Neutralized <strong className="text-slate-900 font-bold">{stats.prevented}</strong> cascading gridlocks out of {stats.predictedCascades} identified high-risk violations.
               </div>

               <button 
                 onClick={() => window.location.reload()} 
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 transition-colors"
               >
                 Restart Simulation
               </button>
            </div>
          )}

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Missed / Gridlock Feed */}
            <div className="flex flex-col flex-1 min-h-0 border-b border-slate-200">
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500"></div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Missed Gridlocks</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-500">{stats.gridlocks}</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {logs.filter(l => l.type === 'gridlock').map((log, i) => (
                  <div key={log.id} className="px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="text-sm font-medium text-slate-900">{log.msg}</div>
                      <div className="text-xs text-slate-400 font-mono">{log.time}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">Impact: <span className="text-red-600 font-bold">{Math.round(log.score)}</span></div>
                  </div>
                ))}
                {logs.filter(l => l.type === 'gridlock').length === 0 && (
                  <div className="p-6 text-sm text-slate-400 font-medium">No missed events.</div>
                )}
              </div>
            </div>

            {/* Prevented / Dispatch Feed */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Prevented Cascades</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-500">{stats.prevented}</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {logs.filter(l => l.type === 'dispatch').map((log, i) => (
                  <div key={log.id} className="px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="text-sm font-medium text-slate-900">{log.msg}</div>
                      <div className="text-xs text-slate-400 font-mono">{log.time}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">Impact: <span className="text-emerald-600 font-bold">{Math.round(log.score)}</span></div>
                  </div>
                ))}
                {logs.filter(l => l.type === 'dispatch').length === 0 && (
                  <div className="p-6 text-sm text-slate-400 font-medium">Monitoring grid...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* START MODAL */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-slate-200 p-8 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2">Simulation Setup</h2>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Define the duration of the trial in seconds. The system will process historical telemetry chronologically.
            </p>
            
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2">Duration (Seconds)</label>
              <input 
                type="number" 
                value={inputDuration} 
                onChange={(e) => setInputDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 px-4 py-3 text-base font-mono text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                min="10"
                max="600"
              />
            </div>

            <button 
              onClick={() => { if (!isLoadingData) { setTimeLeft(inputDuration); setIsStarted(true); } }}
              disabled={isLoadingData}
              className={`w-full font-bold text-[11px] uppercase tracking-widest py-4 px-4 transition-colors ${isLoadingData ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {isLoadingData ? 'Connecting to Grid...' : 'Start Trial'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
