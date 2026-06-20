import React, { useState, useEffect } from 'react';
import LiveDashboard from './components/LiveDashboard';
import { api } from './services/api';
import { Server, Activity } from 'lucide-react';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Connecting to server...");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.health();
        if (mounted) {
          setStatus("Connected! Launching...");
          setProgress(100);
          setErrorMsg("");
          setTimeout(() => setIsReady(true), 600);
        }
      } catch (err) {
        if (mounted) {
          setStatus("Warming up ML models on Render...");
          if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            setErrorMsg(`Network Error: Is VITE_API_URL set in Vercel?`);
          } else {
            setErrorMsg(err.message);
          }
          setTimeout(checkHealth, 2000);
        }
      }
    };
    checkHealth();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (progress === 100) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 99) return 99;
        // Asymptotically approach 99
        return p + (99 - p) * 0.08;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [progress]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-6 p-10 bg-white border border-slate-200 shadow-2xl rounded-sm w-[400px]">
          <div className="relative">
            <Server size={48} className="text-slate-800 animate-pulse" />
            <div className="absolute -bottom-2 -right-2">
              <Activity size={24} className="text-blue-600 animate-bounce" />
            </div>
          </div>
          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-slate-900 tracking-widest uppercase mb-1">INITIALIZING</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2 mb-2 h-4">
              {status !== "Connected! Launching..." && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping shrink-0"></span>
              )}
              {status}
            </p>
            {errorMsg ? (
              <p className="text-[10px] text-red-500 mb-4 h-4 font-bold">{errorMsg}</p>
            ) : (
              <div className="mb-4 h-4"></div>
            )}
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative border border-slate-200">
              <div 
                className="absolute top-0 left-0 h-full bg-slate-900 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-right mt-2 text-[10px] font-bold text-slate-400 font-mono tracking-widest">
              {Math.floor(progress)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LiveDashboard />;
}

export default App;
