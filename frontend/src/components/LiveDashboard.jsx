import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from "../services/api";
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, AlertCircle, ShieldCheck, CheckCircle2, BarChart3, Clock, Zap, TrendingUp, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

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

function HeatmapOverlay({ heatmapData, positions, nodeMap, onSelectHotspot }) {
  const maxCount = Math.max(1, ...Object.values(heatmapData).map(d => d.count || 0));
  return (
    <group>
      {Object.entries(heatmapData).map(([name, data]) => {
        const count = data.count || 0;
        const id = nodeMap[name];
        const pos = positions[id];
        if (!pos || name.includes("NO JUNCTION")) return null;
        
        const intensity = count / maxCount; // 0 to 1
        
        return (
          <group key={`heat-${name}`} position={[pos.x, pos.y, 0.1]}>
            {/* Core */}
            <mesh>
              <circleGeometry args={[0.15 + intensity * 0.2, 32]} />
              <meshBasicMaterial color={intensity > 0.7 ? "#ef4444" : (intensity > 0.3 ? "#f97316" : "#eab308")} transparent opacity={0.9} depthWrite={false} />
            </mesh>
            {/* Outer Glow & Hitbox */}
            <mesh 
              position={[0,0,-0.01]}
              onClick={(e) => { e.stopPropagation(); onSelectHotspot({ name, data }); }} 
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} 
              onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
            >
              <circleGeometry args={[0.4 + intensity * 0.6, 32]} />
              <meshBasicMaterial color={intensity > 0.7 ? "#ef4444" : (intensity > 0.3 ? "#f97316" : "#eab308")} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {intensity > 0.75 && (
              <Html distanceFactor={25} center zIndexRange={[100, 0]}>
                <div className="flex flex-col items-center mt-3 pointer-events-none">
                  <div className="bg-red-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 whitespace-nowrap uppercase tracking-widest border border-red-800 shadow-lg">
                    HOTSPOT: {name}
                  </div>
                  <div className="bg-slate-900 text-red-400 text-[7px] font-mono font-bold px-1 py-0.5 whitespace-nowrap uppercase tracking-widest mt-0.5 border border-slate-700 shadow-lg">
                    ADVISE PATROL
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function LiveGraph({ graphData, activeEvents, isComplete, showHeatmap, heatmapData, onSelectHotspot }) {
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
      {!showHeatmap && activeEvents.map(ev => (
        <EventGroup 
          key={ev.id} 
          event={ev} 
          positions={positions} 
          nodeMap={nodeMap} 
          formattedEdges={formattedEdges} 
          isComplete={isComplete}
        />
      ))}
      {showHeatmap && (
        <HeatmapOverlay heatmapData={heatmapData} positions={positions} nodeMap={nodeMap} onSelectHotspot={onSelectHotspot} />
      )}
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
  const activeEventsRef = useRef([]);
  const [unseenData, setUnseenData] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Simulation Timer & Stats
  const [isStarted, setIsStarted] = useState(false);
  const [inputDuration, setInputDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ predictedCascades: 0, prevented: 0, gridlocks: 0, simulatedDays: 0, totalViolations: 0, lastHour: null });
  const [showReport, setShowReport] = useState(false);
  const [preventedByType, setPreventedByType] = useState({});
  const [preventedByCongestionType, setPreventedByCongestionType] = useState({});
  const [preventedStacked, setPreventedStacked] = useState({});
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  
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
          congestionType: CASCADE_REASONS[Math.floor(Math.random() * CASCADE_REASONS.length)],
          time: realEvent.time,
          date: realEvent.date || "Recurring",
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
    }, 100); 

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
        let newProgress = Math.min(elapsed / 0.5, 1);
        
        let newDispatched = ev.isDispatched;
        let newGridlockLogged = ev.isGridlockLogged;
        
        if (elapsed > 0.6) {
          if (ev.score > 75 && aiMode && !newDispatched && !ev.policeBusy) {
            newDispatched = true;
            preventsToAdd++;
            setHeatmapData(prev => {
              const current = prev[ev.violatedJunction] || { count: 0, types: {}, congestionTypes: {}, times: {}, dates: {}, avgScore: 0 };
              return {
                ...prev,
                [ev.violatedJunction]: {
                  ...current,
                  count: current.count + 1,
                  types: { ...current.types, [ev.type]: (current.types[ev.type] || 0) + 1 },
                  congestionTypes: { ...(current.congestionTypes || {}), [ev.congestionType]: ((current.congestionTypes || {})[ev.congestionType] || 0) + 1 },
                  times: { ...(current.times || {}), [ev.time]: ((current.times || {})[ev.time] || 0) + 1 },
                  dates: { ...(current.dates || {}), [ev.date]: ((current.dates || {})[ev.date] || 0) + 1 },
                  avgScore: ((current.avgScore * current.count) + ev.score) / (current.count + 1)
                }
              };
            });
            newLogs.push({
              id: ev.id + '-dispatch',
              time: new Date().toLocaleTimeString(),
              msg: `Unit dispatched to ${ev.violatedJunction}`,
              score: ev.score,
              type: 'dispatch',
              violation_type: ev.type
            });
            setPreventedByType(prev => ({
              ...prev,
              [ev.type]: (prev[ev.type] || 0) + 1
            }));
            setPreventedByCongestionType(prev => ({
              ...prev,
              [ev.congestionType]: (prev[ev.congestionType] || 0) + 1
            }));
            setPreventedStacked(prev => {
              const current = prev[ev.type] || { name: ev.type, "Spillover": 0, "Signal Blocked": 0, "Chokepoint": 0, "Lane Blocked": 0 };
              return { ...prev, [ev.type]: { ...current, [ev.congestionType]: (current[ev.congestionType] || 0) + 1 } };
            });
          } else if (!newDispatched && !newGridlockLogged) {
            newGridlockLogged = true;
            gridsToAdd++;
            setHeatmapData(prev => {
              const current = prev[ev.violatedJunction] || { count: 0, types: {}, congestionTypes: {}, times: {}, dates: {}, avgScore: 0 };
              return {
                ...prev,
                [ev.violatedJunction]: {
                  ...current,
                  count: current.count + 1,
                  types: { ...current.types, [ev.type]: (current.types[ev.type] || 0) + 1 },
                  congestionTypes: { ...(current.congestionTypes || {}), [ev.congestionType]: ((current.congestionTypes || {})[ev.congestionType] || 0) + 1 },
                  times: { ...(current.times || {}), [ev.time]: ((current.times || {})[ev.time] || 0) + 1 },
                  dates: { ...(current.dates || {}), [ev.date]: ((current.dates || {})[ev.date] || 0) + 1 },
                  avgScore: ((current.avgScore * current.count) + ev.score) / (current.count + 1)
                }
              };
            });
            newLogs.push({
              id: ev.id + '-gridlock',
              time: new Date().toLocaleTimeString(),
              msg: `Cascade observed at ${ev.violatedJunction}`,
              score: ev.score,
              type: 'gridlock',
              violation_type: ev.type
            });
          }
        }

        return { ...ev, progress: newProgress, isDispatched: newDispatched, isGridlockLogged: newGridlockLogged };
      }).filter(ev => {
        return (now - ev.createdAt) / 1000 < 1.5;
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

              {isComplete && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`w-full font-bold text-xs uppercase tracking-widest py-3 px-4 transition-colors flex items-center justify-center gap-2 border ${showHeatmap ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'}`}
                  >
                    {showHeatmap ? 'Return to Grid View' : 'Show Map Analysis'}
                  </button>
                  {!showHeatmap && <p className="text-[10px] text-slate-500 mt-2 text-center">Analyze patrol hotspots based on simulation.</p>}
                </div>
              )}
            </div>


          </div>
        </div>

        {/* Center: 3D Map Area */}
        <div className="flex-1 relative bg-slate-100 z-0 border-r border-slate-200">
          
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[999] flex items-center bg-white shadow-md border border-slate-200 rounded-full px-3 py-2 transition-all duration-500 ease-out">
            <div className="flex items-center gap-3 px-3 py-1">
              <img src="/icon.png" alt="BLR Flow" className="w-6 h-6 object-contain" />
              <h1 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-slate-900">BLR Flow</h1>
            </div>
            
            {isStarted && !isComplete && (
              <div className="flex items-center border-l border-slate-200 ml-2 pl-5 pr-3 py-1 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <span className="text-xs font-mono font-bold text-slate-700 tracking-widest">T-MINUS {formatTime(timeLeft)}</span>
                </div>
              </div>
            )}
            
            {showHeatmap && (
              <div className="flex items-center border-l border-slate-200 ml-2 pl-5 pr-3 py-1 gap-4">
                <div className="text-xs font-mono font-bold text-red-600 tracking-widest uppercase">Hotspot Analysis Mode</div>
              </div>
            )}
          </div>

          <div className="absolute inset-0">
            <LiveGraph graphData={graphData} activeEvents={activeEvents} isComplete={isComplete} showHeatmap={showHeatmap} heatmapData={heatmapData} onSelectHotspot={setSelectedHotspot} />
          </div>

          {/* Hotspot Info Panel */}
          {showHeatmap && selectedHotspot && (
            <div className="absolute right-6 top-6 w-80 bg-white border border-slate-200 shadow-2xl z-[1000] flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Patrol Dossier</span>
                </div>
                <button onClick={() => setSelectedHotspot(null)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">{selectedHotspot.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Critical Intervention Zone</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-200 p-3 bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Incidents</div>
                    <div className="font-mono text-xl text-slate-900">{selectedHotspot.data.count}</div>
                  </div>
                  <div className="border border-slate-200 p-3 bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Avg Risk</div>
                    <div className="font-mono text-xl text-red-600">{Math.round(selectedHotspot.data.avgScore)}</div>
                  </div>
                  <div className="border border-slate-200 p-3 bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Peak Time</div>
                    <div className="font-mono text-xl text-slate-900">
                      {(() => {
                        const pt = Object.entries(selectedHotspot.data.times || {}).sort((a,b)=>b[1]-a[1])[0]?.[0];
                        return pt ? pt.split(':')[0] + ':00' : "N/A";
                      })()}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Violation Demographics</div>
                  <ul className="space-y-2 mt-3">
                    {Object.entries(selectedHotspot.data.types).sort((a,b)=>b[1]-a[1]).map(([t, c]) => (
                      <li key={t} className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium">{t}</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-200 pb-2 mt-2">Congestion Causes</div>
                  <ul className="space-y-2 mt-3">
                    {Object.entries(selectedHotspot.data.congestionTypes || {}).sort((a,b)=>b[1]-a[1]).map(([t, c]) => (
                      <li key={t} className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium">{t}</span>
                        <span className="font-mono font-bold text-red-900 bg-red-100 px-2 py-0.5">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 bg-red-50 border border-red-200 p-3 text-xs text-red-900 leading-relaxed shadow-sm">
                  <strong>Recommendation:</strong> {
                    (() => {
                      const c = selectedHotspot.data.count;
                      const s = selectedHotspot.data.avgScore;
                      const t = Object.entries(selectedHotspot.data.types).sort((a,b)=>b[1]-a[1])[0]?.[0] || "violations";
                      
                      if (c >= 10 && s >= 82) return <span>This junction poses an extreme, chronic risk of city-wide cascading gridlock primarily driven by <strong>{t}</strong>. Immediate assignment of a permanent static patrol unit is required.</span>;
                      if (c >= 10 && s < 82) return <span>High volume of <strong>{t}</strong> incidents recorded. While individual impact is moderate, the sheer volume guarantees regular congestion. Advise installing automated enforcement cameras.</span>;
                      if (c < 10 && s >= 82) return <span>Though less frequent, <strong>{t}</strong> incidents at this junction have an extremely high probability of triggering massive gridlock. Advise rapid-response readiness during peak hours.</span>;
                      return <span>Occasional <strong>{t}</strong> incidents noted with moderate risk. Add to standard patrol sweep schedules to prevent escalation.</span>;
                    })()
                  }
                </div>
              </div>
            </div>
          )}
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
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 mb-2 transition-colors"
               >
                 Restart Simulation
               </button>
               <button 
                 onClick={() => setShowReport(true)} 
                 className="w-full border border-slate-900 text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-widest py-3 px-4 transition-colors flex items-center justify-center gap-2"
               >
                 <BarChart3 size={14} /> Detailed Explanation
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

      {/* DETAILED REPORT MODAL */}
      {showReport && (
        <div className="absolute inset-0 z-[1000] bg-slate-900/60 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <h2 className="font-display text-xl font-bold text-slate-900 uppercase tracking-widest">Post-Trial Report</h2>
              </div>
              <button onClick={() => setShowReport(false)} className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100">
              
              {/* Premium KPI Section */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                
                {/* Main Metric */}
                <div className="bg-white border border-slate-200 p-6 col-span-2 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-5 text-slate-900 pointer-events-none">
                    <ShieldCheck size={180} />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                    <div className="w-2 h-2 bg-emerald-500" />
                    Cascades Neutralized
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="font-mono text-6xl font-bold text-slate-900">{stats.prevented}</span>
                    <span className="font-mono text-xl text-slate-400">/ {stats.predictedCascades}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500 font-medium relative z-10">Total high-risk cascade events successfully intercepted.</div>
                </div>

                {/* Secondary Metrics Grid */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={14} className="text-blue-600" /> Time Saved
                  </div>
                  <div className="font-mono text-4xl text-slate-900">{stats.prevented * 45}<span className="text-lg text-slate-400 ml-1">m</span></div>
                </div>
                  
                <div className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp size={14} className="text-amber-600" /> Avg Speed
                  </div>
                  <div className="font-mono text-4xl text-slate-900">{Math.round(12 + ((stats.prevented / Math.max(1, stats.predictedCascades)) * 14))}<span className="text-lg text-slate-400 ml-1">km/h</span></div>
                </div>

                <div className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-center col-span-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-purple-600" /> System Efficiency
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-600">{Math.round((stats.prevented / Math.max(1, stats.predictedCascades)) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${Math.round((stats.prevented / Math.max(1, stats.predictedCascades)) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* Stacked Bar - Takes 2 cols */}
                <div className="col-span-2 bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Violation / Congestion Cross-Analysis</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.values(preventedStacked).sort((a,b) => {
                        const sumA = a["Spillover"] + a["Signal Blocked"] + a["Chokepoint"] + a["Lane Blocked"];
                        const sumB = b["Spillover"] + b["Signal Blocked"] + b["Chokepoint"] + b["Lane Blocked"];
                        return sumB - sumA;
                      }).slice(0, 8)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} itemStyle={{color: '#0f172a'}} />
                        <Legend iconType="square" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', paddingTop: '20px' }} />
                        <Bar dataKey="Spillover" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Signal Blocked" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Chokepoint" stackId="a" fill="#10b981" />
                        <Bar dataKey="Lane Blocked" stackId="a" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart & Delay Chart Stacked Vertically */}
                <div className="flex flex-col gap-6">
                  <div className="bg-white border border-slate-200 p-6 shadow-sm flex-1 flex flex-col">
                    <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Congestion Dist.</h3>
                    <div className="flex-1 w-full min-h-[120px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(preventedByCongestionType).map(([name, value]) => ({ name, value }))}
                            cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none"
                          >
                            {Object.entries(preventedByCongestionType).map((entry, index) => {
                              const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Pie>
                          <RechartsTooltip contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} itemStyle={{color: '#0f172a'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 shadow-sm flex-1 flex flex-col">
                    <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Total Delay (Mins)</h3>
                    <div className="flex-1 w-full min-h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Base', delay: stats.predictedCascades * 45 },
                          { name: 'AI', delay: stats.gridlocks * 45 }
                        ]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => [`${value}m`, 'Delay']} />
                          <Bar dataKey="delay">
                            <Cell fill="#ef4444" />
                            <Cell fill="#10b981" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
