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
    if (controls) {
      const minX = -2;
      const maxX = 10;
      const limitY = 10;
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, minX, maxX);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, -limitY, limitY);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, -limitY, limitY);
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
            <div className="flex flex-col items-center mt-5 pointer-events-none">
              <div className="bg-white border border-gray-300 text-gray-800 text-[9px] font-semibold px-2 py-0.5 whitespace-nowrap shadow-sm">
                {n.name}
              </div>
            {n.isSource && (
              <div className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 mt-0.5 whitespace-nowrap font-medium tracking-wide">
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

        setActiveEvents(prev => [...prev, newEvent]);
        
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
      setActiveEvents(prev => {
        return prev.map(ev => {
          const elapsed = (now - ev.createdAt) / 1000;
          let newProgress = elapsed / 2;
          if (newProgress > 1) newProgress = 1;
          
          let newDispatched = ev.isDispatched;
          let newGridlockLogged = ev.isGridlockLogged;
          
          if (elapsed > 2.5) {
            if (ev.score > 75 && aiMode && !newDispatched && !ev.policeBusy) {
              newDispatched = true;
              setStats(s => ({ ...s, predictedCascades: s.predictedCascades + 1, prevented: s.prevented + 1 }));
              setLogs(logs => [{
                id: ev.id + '-dispatch',
                time: new Date().toLocaleTimeString(),
                msg: `Unit dispatched to ${ev.violatedJunction}`,
                score: ev.score,
                type: 'dispatch'
              }, ...logs].slice(0, 50));
            } else if (!newDispatched && !newGridlockLogged) {
              newGridlockLogged = true;
              setStats(s => ({ ...s, predictedCascades: s.predictedCascades + 1, gridlocks: s.gridlocks + 1 }));
              setLogs(logs => [{
                id: ev.id + '-gridlock',
                time: new Date().toLocaleTimeString(),
                msg: `Cascade observed at ${ev.violatedJunction}`,
                score: ev.score,
                type: 'gridlock'
              }, ...logs].slice(0, 50));
            }
          }

          return { ...ev, progress: newProgress, isDispatched: newDispatched, isGridlockLogged: newGridlockLogged };
        }).filter(ev => {
          if (ev.isDispatched) {
            return (now - ev.createdAt) / 1000 < 12;
          }
          return (now - ev.createdAt) / 1000 < 12; // Both keep them visible for 12 seconds
        });
      });
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

  return (
    <div className="h-screen w-full bg-[#fcfcfc] relative overflow-hidden font-sans text-gray-900">
      
      {/* 3D Map Area */}
      <div className="absolute inset-0 z-0">
        <LiveGraph graphData={graphData} activeEvents={activeEvents} isComplete={isComplete} />
      </div>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full z-10 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold tracking-tight text-lg text-gray-900">BLR - Flow</h1>
          <div className="h-4 w-px bg-gray-300"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">{currentTimeStr}</div>
          {isStarted && !isComplete && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 text-sm font-semibold rounded border border-blue-200">
              {formatTime(timeLeft)} Remaining
            </div>
          )}
        </div>
      </div>

      {/* Main Container - Adjusted for Top Bar */}
      <div className="absolute top-16 left-6 right-6 bottom-6 z-10 flex gap-6 pointer-events-none">
        
        {/* Left Column: Context / Details */}
        <div className="w-[360px] flex flex-col pointer-events-auto">
          <div className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col rounded">
            <h2 className="text-xl font-semibold tracking-tight mb-2 text-gray-900">Predictive Dispatch Console</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">
              Monitors real-time intersections and calculates cascade probability. Operations automatically dispatches units to high-risk blockages.
            </p>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">High-Risk Incident</div>
                  <div className="text-xs text-gray-500 mt-0.5">Cascade probability &gt; 75%</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Unit Dispatched</div>
                  <div className="text-xs text-gray-500 mt-0.5">Cascade prevented manually</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Column: Event Feeds */}
        <div className="w-[380px] flex flex-col gap-4 pointer-events-auto">
          
          {/* Missed / Gridlock Feed */}
          <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-1/2 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="font-semibold text-sm text-gray-900">Gridlocks (Missed)</span>
              </div>
              <div className="text-sm font-medium text-gray-600">{stats.gridlocks}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white custom-scrollbar">
              {logs.filter(l => l.type === 'gridlock').map((log, i) => (
                <div key={i} className="p-3 bg-white border border-gray-100 hover:bg-gray-50 transition-colors rounded-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-xs font-medium text-gray-900">{log.msg}</div>
                    <div className="text-[10px] text-gray-400 font-medium ml-2">{log.time}</div>
                  </div>
                  <div className="text-xs text-red-600 font-medium">Impact Score: {Math.round(log.score)}</div>
                </div>
              ))}
              {logs.filter(l => l.type === 'gridlock').length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No missed events
                </div>
              )}
            </div>
          </div>

          {/* Prevented / Dispatch Feed */}
          <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-1/2 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="font-semibold text-sm text-gray-900">Prevented Cascades</span>
              </div>
              <div className="text-sm font-medium text-gray-600">{stats.prevented}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white custom-scrollbar">
              {logs.filter(l => l.type === 'dispatch').map((log, i) => (
                <div key={i} className="p-3 bg-white border border-gray-100 hover:bg-gray-50 transition-colors rounded-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-xs font-medium text-gray-900">{log.msg}</div>
                    <div className="text-[10px] text-gray-400 font-medium ml-2">{log.time}</div>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">Impact Score: {Math.round(log.score)}</div>
                </div>
              ))}
              {logs.filter(l => l.type === 'dispatch').length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No dispatches yet
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* START MODAL */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white shadow-xl max-w-md w-full border border-gray-200 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Simulation Setup</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">
              Define the duration of the trial in seconds. The simulation processes historical records chronologically.
            </p>
            
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Duration (Seconds)</label>
              <input 
                type="number" 
                value={inputDuration} 
                onChange={(e) => setInputDuration(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded p-3 text-lg font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                min="10"
                max="600"
              />
            </div>

            <button 
              onClick={() => { setTimeLeft(inputDuration); setIsStarted(true); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Trial
            </button>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL */}
      {isComplete && (
        <div className="absolute inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white shadow-xl max-w-2xl w-full border border-gray-200 p-10 rounded-xl">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Trial Concluded</h2>
                <p className="text-gray-500 text-sm font-medium">Simulation ran for {inputDuration} seconds</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-6 mb-10">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Days Computed</div>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.simulatedDays}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Predicted</div>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">{stats.predictedCascades}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Prevented</div>
                <div className="text-3xl font-semibold text-emerald-600 tracking-tight">{stats.prevented}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Missed</div>
                <div className="text-3xl font-semibold text-red-600 tracking-tight">{stats.gridlocks}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-8 text-sm text-gray-700 font-medium leading-relaxed">
              Across <strong>{stats.simulatedDays} computed days</strong>, the operations platform successfully directed officers to neutralize <strong>{stats.prevented} cascading gridlocks</strong> out of {stats.predictedCascades} identified high-risk spatial anomalies.
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gray-900 hover:bg-black text-white font-medium text-sm py-3 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Restart Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
