import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, Legend
} from 'recharts';
import { 
  AlertTriangle, Shield, MapPin, Activity, 
  Search, Info, CheckCircle2, Loader2, Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/data`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to connect to AI Engine. Please ensure the backend is running.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-50 p-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Waking up AI Engine...</h1>
        <p className="text-slate-400 max-w-md">
          Analyzing 300,000 traffic records and running K-Means clustering. This may take up to 45 seconds on first load.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-50 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
        <p className="text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const filteredJunctions = data.junctions.filter(j => 
    j.junction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clusterColors = {
    "Primary Parking Enforcement Priority": "#ef4444",
    "High-Complexity Parking Zone": "#f59e0b",
    "Data/Reporting Risk Zone": "#3b82f6",
    "Standard Monitoring": "#10b981"
  };

  const scatterData = data.junctions.map(j => ({
    name: j.junction,
    x: j.avg_vol,
    y: j.multi_rate * 100,
    z: j.persistence_score,
    role: j.role
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Shield className="w-5 h-5" />
            <span className="font-bold tracking-widest text-sm uppercase">Gridlock AI Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Enforcement Command Center</h1>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">System Status</span>
            <span className="text-green-400 flex items-center gap-1.5 text-sm font-bold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live ML Model Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-12 h-12" />
          </div>
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">10-50 Impact Rule</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-500">{data.rule_10_50}%</span>
            <span className="text-xs text-slate-400">of violations</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Driven by top 10 persistent hotspots</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-12 h-12" />
          </div>
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">Elite Hotspots</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">10</span>
            <span className="text-xs text-slate-400">Junctions</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">100% persistence over {data.stats.total_weeks} weeks</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">Anomaly Alerts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-500">{data.alerts.length}</span>
            <span className="text-xs text-slate-400">Stations flagged</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Exceeding {data.stats.threshold}% backlog</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-12 h-12" />
          </div>
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">Dataset Coverage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-300">{(data.stats.total_records / 1000).toFixed(0)}k</span>
            <span className="text-xs text-slate-400">Records</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Jan to May 2024 Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Classification & Anomaly Detection */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Cluster Chart */}
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  AI Operational Classification
                </h2>
                <p className="text-slate-500 text-sm">Multivariate K-Means Clustering for Smart Resource Allocation</p>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" name="Avg Weekly Volume" unit="" stroke="#64748b" label={{ value: 'Avg Weekly Volume', position: 'bottom', fill: '#64748b' }} />
                  <YAxis type="number" dataKey="y" name="Complexity (%)" unit="%" stroke="#64748b" label={{ value: 'Complexity Rate', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="Persistence" unit="%" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                  <Scatter name="Junctions" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={clusterColors[entry.role]} />
                    ))}
                  </Scatter>
                  <Legend verticalAlign="top" height={36} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {Object.entries(clusterColors).map(([role, color]) => (
                <div key={role} className="flex items-center gap-2 text-[10px] md:text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  <span className="text-slate-400">{role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Operational Alerts */}
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Operational Risk Alerts
            </h2>
            <div className="space-y-3">
              {data.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-tighter">Outlier Detected</span>
                    <h3 className="font-bold text-slate-100">{alert.police_station} Station</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-500">{alert.percent.toFixed(1)}%</span>
                    <span className="text-xs text-red-400/60 block">Backlog Rate</span>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-500">
                <p>Threshold for alert: <strong>{data.stats.threshold}%</strong> (Mean + 2σ). Backlog is defined as violations recorded but not transmitted to SCITA.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Priority List */}
        <div className="lg:col-span-1">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Targeted Enforcement Priorities
              </h2>
              <p className="text-slate-500 text-sm mt-1">Lexicographical Ranking: Persistence > Complexity</p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search junction or role..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredJunctions.map((j, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">#{idx+1}</span>
                      <h4 className="font-bold text-sm text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">{j.junction}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{j.persistence_score.toFixed(0)}% Persist</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>{(j.multi_rate * 100).toFixed(1)}% Cmplx</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${clusterColors[j.role]}20`, color: clusterColors[j.role] }}>
                      {j.role}
                    </span>
                    {j.persistence_score >= 100 && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Volume Engine</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      <footer className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between text-slate-600 text-[10px] uppercase tracking-widest font-bold">
        <span>&copy; 2026 Gridlock Intelligence Systems</span>
        <div className="flex gap-4">
          <span>Data: Jan to May 2024</span>
          <span>Method: K-Means Multivariate Clustering</span>
        </div>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default App;
