import React, { useState, useEffect } from 'react';
import LiveDashboard from './components/LiveDashboard';
import { api } from './services/api';
import { Server, Activity } from 'lucide-react';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Connecting to server...");

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.health();
        if (mounted) {
          setStatus("Connected");
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setStatus("Warming up ML models on Render (this may take 30s)...");
          setTimeout(checkHealth, 2000);
        }
      }
    };
    checkHealth();
    return () => { mounted = false; };
  }, []);

  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-6 p-10 bg-slate-800 border border-slate-700 shadow-2xl rounded-sm">
          <div className="relative">
            <Server size={48} className="text-emerald-500 animate-pulse" />
            <div className="absolute -bottom-2 -right-2">
              <Activity size={24} className="text-blue-400 animate-bounce" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-100 tracking-widest uppercase mb-2">INITIALIZING</h2>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
              {status}
            </p>
          </div>
          <div className="w-full bg-slate-700 h-1 mt-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-emerald-500 animate-[slide_1.5s_ease-in-out_infinite_alternate]"></div>
          </div>
        </div>
        <style>{`
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  return <LiveDashboard />;
}

export default App;
