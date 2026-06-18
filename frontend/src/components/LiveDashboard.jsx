import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from "../services/api";
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AlertCircle, ShieldCheck, Activity, MapPin, Zap, AlertTriangle } from 'lucide-react';

const CASCADE_REASONS = [
  "Spillover Effect",
  "Signal Blocked",
  "Upstream Chokepoint",
  "Left-Turn Blocked",
  "Intersection Gridlock",
  "Bus Lane Blocked"
];

function MapBackground() {
  const texture = useLoader(THREE.TextureLoader, '/bangalore_osm_dark.png');
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
          color={isDispatched ? "#10b981" : "#eab308"} 
          lineWidth={isDispatched ? 4 : 3} 
          transparent 
          opacity={0.8} 
        />
      );
    });
  }, [formattedEdges, cascadeJunctions, positions, nodeMap, progress, isDispatched, id]);

  const nodesToRender = useMemo(() => {
    const nodesList = [];
    
    // Add Source Node
    if (violatedJunction && positions[nodeMap[violatedJunction]]) {
      nodesList.push({
        name: violatedJunction,
        isSource: true,
        pos: positions[nodeMap[violatedJunction]],
        show: true
      });
    }

    // Add Cascade Nodes
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
          <sphereGeometry args={[n.isSource ? 0.6 : (isDispatched ? 0.5 : 0.4), 16, 16]} />
          <meshStandardMaterial 
            color={n.isSource ? "#ff0000" : (isDispatched ? "#10b981" : "#eab308")} 
            emissive={n.isSource ? "#ff0000" : (isDispatched ? "#10b981" : "#eab308")}
            emissiveIntensity={1.5}
            transparent={true}
            opacity={n.isSource ? 1 : 0.9}
          />
        </mesh>
        
        {!isComplete && (
          <Html distanceFactor={25} center zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center mt-6 pointer-events-none">
              <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${n.isSource ? 'bg-red-900/90 border-red-500 text-red-100' : (isDispatched ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' : 'bg-yellow-900/90 border-yellow-500/50 text-yellow-200')}`}>
                {n.name}
              </div>
            {n.isSource && (
              <div className="text-[8px] bg-red-600/90 text-white px-1 py-0.5 rounded mt-0.5 whitespace-nowrap font-bold tracking-wider animate-pulse">
                {type.replace(/_/g, ' ')}
              </div>
            )}
            {!n.isSource && isDispatched && (
              <div className="text-[8px] bg-emerald-600/90 text-white px-1 py-0.5 rounded mt-0.5 whitespace-nowrap font-bold tracking-wider">
                POLICE DISPATCHED
              </div>
            )}
            {!n.isSource && !isDispatched && n.reason && (
              <div className="text-[8px] bg-black/80 text-slate-300 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">
                ⚠️ {n.reason}
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
      <ambientLight intensity={0.5} />
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
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
}

export default function LiveDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [activeEvents, setActiveEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aiMode, setAiMode] = useState(true);
  const [unseenData, setUnseenData] = useState([]);
  
  // Simulation Timer & Stats
  const [timeLeft, setTimeLeft] = useState(90); // 1 min 30 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({
    totalViolations: 0,
    predictedCascades: 0,
    prevented: 0,
    gridlocks: 0
  });

  useEffect(() => {
    api.getNetworkGraph().then(data => setGraphData(data));
    api.getUnseenEvents().then(data => setUnseenData(data));
  }, []);

  // Simulation Loop (Using Real Unseen Data)
  useEffect(() => {
    if (!graphData.nodes || graphData.nodes.length === 0 || unseenData.length === 0 || isComplete) return;
    
    // We maintain a local copy of unseenData to shift off from
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

        const newEvent = {
          id: Date.now().toString() + Math.random(),
          violatedJunction: realEvent.junction_name,
          cascadeJunctions: result.cascade_junctions || [realEvent.junction_name],
          score: result.impact_score,
          type: realEvent.violation_type,
          progress: 0,
          isDispatched: false,
          isGridlockLogged: false,
          policeBusy: Math.random() < 0.3, // 30% chance police are too busy!
          createdAt: Date.now()
        };

        setActiveEvents(prev => [...prev, newEvent]);
        
        setLogs(prev => [{
          id: newEvent.id,
          time: new Date().toLocaleTimeString(),
          msg: `🚨 ${realEvent.violation_type.replace(/_/g, ' ')} detected at ${realEvent.junction_name}`,
          score: result.impact_score,
          type: 'alert'
        }, ...prev].slice(0, 50));

        setStats(s => ({ ...s, totalViolations: s.totalViolations + 1 }));

      } catch (err) {
        console.error("Simulation error", err);
      }
    }, 2000); // Process 1 real event every 2 seconds for faster demo

    return () => clearInterval(interval);
  }, [graphData, unseenData, isComplete]);

  // Update Progress & Dispatch Logic Loop
  useEffect(() => {
    if (isComplete) return;

    const ticker = setInterval(() => {
      const now = Date.now();
      setActiveEvents(prev => {
        return prev.map(ev => {
          const elapsed = (now - ev.createdAt) / 1000;
          let newProgress = elapsed / 2; // Full cascade over 2 seconds
          if (newProgress > 1) newProgress = 1;
          
          let newDispatched = ev.isDispatched;
          let newGridlockLogged = ev.isGridlockLogged;
          
          // Trigger if score > 75 
          if (ev.score > 75 && elapsed > 2.5) {
            if (aiMode && !newDispatched && !ev.policeBusy) {
              newDispatched = true;
              setStats(s => ({ ...s, predictedCascades: s.predictedCascades + 1, prevented: s.prevented + 1 }));
              setLogs(logs => [{
                id: ev.id + '-dispatch',
                time: new Date().toLocaleTimeString(),
                msg: `🛡️ POLICE DISPATCHED to ${ev.violatedJunction}`,
                score: ev.score,
                type: 'dispatch',
                prevented: ev.cascadeJunctions.slice(1).join(', ')
              }, ...logs].slice(0, 50));
            } else if ((!aiMode || (aiMode && ev.policeBusy)) && !newGridlockLogged) {
              newGridlockLogged = true;
              setStats(s => ({ ...s, predictedCascades: s.predictedCascades + 1, gridlocks: s.gridlocks + 1 }));
              setLogs(logs => [{
                id: ev.id + '-gridlock',
                time: new Date().toLocaleTimeString(),
                msg: ev.policeBusy && aiMode ? `🚔 RESOURCES BUSY: Gridlock at ${ev.violatedJunction}` : `⚠️ SEVERE GRIDLOCK FORMED at ${ev.violatedJunction}`,
                score: ev.score,
                type: 'gridlock',
                affected: ev.cascadeJunctions.slice(1).join(', ')
              }, ...logs].slice(0, 50));
            }
          }

          return { ...ev, progress: newProgress, isDispatched: newDispatched, isGridlockLogged: newGridlockLogged };
        }).filter(ev => {
          // Cleared (Green) incidents leave the map after 12 seconds
          // Unresolved (Red/Yellow) gridlocks stay on the map indefinitely!
          if (ev.isDispatched) {
            return (now - ev.createdAt) / 1000 < 12;
          }
          return true;
        });
      });
    }, 100);

    return () => clearInterval(ticker);
  }, [aiMode, isComplete]);

  // Master Timer Loop
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsComplete(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex overflow-hidden text-slate-300 font-sans">
      
      {/* LEFT PANEL: Live Violations */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <Activity className="text-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-white tracking-wider">LIVE FEED</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {logs.filter(l => l.type === 'alert').map(log => (
            <div key={log.id} className="bg-slate-800 p-3 rounded-lg border-l-4 border-red-500 shadow-md animate-in slide-in-from-left">
              <div className="text-xs text-slate-400 mb-1">{log.time}</div>
              <div className="text-sm font-semibold text-slate-200">{log.msg}</div>
              <div className="text-xs mt-2 flex items-center justify-between">
                <span>AI Impact Score:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${log.score > 75 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {Math.round(log.score)}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* CENTER PANEL: The 3D Map */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-2xl flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              BLR-FLOW
            </h1>
            <p className="text-sm text-slate-400 mt-1">Autonomous Traffic Simulator</p>
          </div>
          
          {/* TOGGLE SWITCH */}
          <div className="flex items-center gap-3 ml-4 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button 
              onClick={() => setAiMode(false)}
              disabled={isComplete}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!aiMode ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50`}
            >
              BASELINE (Reactive)
            </button>
            <button 
              onClick={() => setAiMode(true)}
              disabled={isComplete}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${aiMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50`}
            >
              <Zap size={16} /> AI DISPATCH
            </button>
          </div>

          {/* TIMER */}
          <div className="ml-4 bg-slate-950 p-2 px-4 rounded-lg border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Time Remaining</span>
            <span className={`text-xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* MAP LEGEND */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-2xl">
          <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Map Legend</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span className="text-sm font-semibold text-slate-200">Violation Occurred</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
              <span className="text-sm font-semibold text-slate-200">Cascading Gridlock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-sm font-semibold text-slate-200">Police Prevented</span>
            </div>
          </div>
        </div>

        <LiveGraph graphData={graphData} activeEvents={activeEvents} isComplete={isComplete} />

        {/* COMPLETION OVERLAY */}
        {isComplete && (
          <div className="absolute inset-0 z-[999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-2xl w-full shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <h2 className="text-4xl font-black text-white text-center mb-2">SIMULATION COMPLETE</h2>
              <p className="text-slate-400 text-center mb-8">90-Second Autonomous AI Dispatch Trial</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Total Violations Seen</span>
                  <span className="text-5xl font-black text-white">{stats.totalViolations}</span>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Simulated Time</span>
                  <span className="text-5xl font-black text-blue-400">~{Math.floor(stats.totalViolations * 2.5)} Days</span>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-sm text-yellow-500/80 font-bold uppercase tracking-wider mb-2">Predicted Cascades</span>
                  <span className="text-5xl font-black text-yellow-500">{stats.predictedCascades}</span>
                </div>
                <div className="bg-slate-950 p-6 rounded-xl border border-emerald-900/50 flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <span className="text-sm text-emerald-500 font-bold uppercase tracking-wider mb-2">Gridlocks Prevented</span>
                  <span className="text-5xl font-black text-emerald-500">{stats.prevented}</span>
                </div>
              </div>

              <div className="mt-8 text-center bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                <p className="text-slate-300">
                  <strong className="text-white">Business Value:</strong> By using the AI model to triage live data instead of responding sequentially, the city mathematically prevented <strong className="text-emerald-400">{stats.prevented} severe network gridlocks</strong> across {Math.floor(stats.totalViolations * 2.5)} simulated days.
                </p>
              </div>

              <button onClick={() => window.location.reload()} className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                RUN ANOTHER TRIAL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Tracker Log */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          {aiMode ? <ShieldCheck className="text-emerald-500" /> : <AlertTriangle className="text-orange-500" />}
          <h2 className="text-xl font-bold text-white tracking-wider">
            {aiMode ? "DISPATCH LOG" : "IMPACT TRACKER"}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {/* AI Mode Logs */}
          {aiMode && logs.filter(l => l.type === 'dispatch').map(log => (
            <div key={log.id} className="bg-slate-800 p-3 rounded-lg border-l-4 border-emerald-500 shadow-md animate-in slide-in-from-right">
              <div className="text-xs text-slate-400 mb-1">{log.time}</div>
              <div className="text-sm font-semibold text-emerald-400">{log.msg}</div>
              <div className="text-xs mt-2 text-slate-300">
                <span className="text-emerald-500 font-bold">PREVENTED CASCADES TO:</span><br/>
                {log.prevented || "Adjacent roads"}
              </div>
            </div>
          ))}
          {aiMode && logs.filter(l => l.type === 'dispatch').length === 0 && (
            <div className="text-center text-slate-500 mt-10 text-sm">Waiting for high-severity AI dispatch...</div>
          )}

          {/* Baseline Mode Logs */}
          {!aiMode && logs.filter(l => l.type === 'gridlock').map(log => (
            <div key={log.id} className="bg-slate-800 p-3 rounded-lg border-l-4 border-orange-500 shadow-md animate-in slide-in-from-right">
              <div className="text-xs text-slate-400 mb-1">{log.time}</div>
              <div className="text-sm font-semibold text-orange-400">{log.msg}</div>
              <div className="text-xs mt-2 text-slate-300">
                <span className="text-orange-500 font-bold">GRIDLOCK SPREAD TO:</span><br/>
                {log.affected || "Adjacent roads"}
              </div>
            </div>
          ))}
          {!aiMode && logs.filter(l => l.type === 'gridlock').length === 0 && (
            <div className="text-center text-slate-500 mt-10 text-sm">Monitoring for severe network failures...</div>
          )}

        </div>
      </div>

    </div>
  );
}
