import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Gauge, Thermometer, ShieldAlert } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [violations, setViolations] = useState([]);
  const [latestMetrics, setLatestMetrics] = useState({ rpm: 0, batteryTemperature: 0, speed: 0 });

  const fetchData = async () => {
    try {
      const telemetryRes = await fetch(API_BASE_URL);
      const telemetryData = await telemetryRes.json();
      setTelemetryHistory(telemetryData);

      if (telemetryData.length > 0) {
        setLatestMetrics(telemetryData[telemetryData.length - 1]);
      }

      const violationsRes = await fetch(`${API_BASE_URL}/violations`);
      const violationsData = await violationsRes.json();
      setViolations(violationsData);
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="text-amber-500 w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-black tracking-wider text-amber-500">APEX TELEMETRY ENGINE</h1>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-mono border border-emerald-500/20">CORE API: LIVE</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Live Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Engine RPM</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1 font-mono">{latestMetrics.rpm}</h3>
            </div>
            <Gauge className="text-amber-500/40 w-12 h-12" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Battery Temp</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1 font-mono">{latestMetrics.batteryTemperature}°C</h3>
            </div>
            <Thermometer className={`${latestMetrics.batteryTemperature >= 75 ? 'text-red-500 animate-bounce' : 'text-sky-400/40'} w-12 h-12`} />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Vehicle Speed</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1 font-mono">{latestMetrics.speed} <span className="text-sm font-normal text-slate-400">km/h</span></h3>
            </div>
            <Activity className="text-emerald-500/40 w-12 h-12" />
          </div>
        </section>

        {/* Real-time Chart & Logs Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Chart Panel */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col h-[400px]">
            <h2 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Live RPM Telemetry Stream</h2>
            <div className="w-full h-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory.slice(-15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="id" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="rpm" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Violations Panel */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col h-[400px]">
            <h2 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Safety Violations Log ({violations.length})
            </h2>
            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
              {violations.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center pt-12">No safety threshold violations detected.</p>
              ) : (
                [...violations].reverse().map((v) => (
                  <div key={v.id} className={`p-3 border-l-4 ${v.severity === 'CRITICAL' ? 'border-red-500 bg-red-950/20 text-red-200' : 'border-yellow-500 bg-yellow-950/20 text-yellow-200'} rounded-r text-xs space-y-1`}>
                    <div className="flex justify-between font-bold uppercase tracking-wide">
                      <span>{v.parameterType}</span>
                      <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">{v.severity}</span>
                    </div>
                    <p className="text-slate-300">{v.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}