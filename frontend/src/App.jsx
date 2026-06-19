import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Gauge, Thermometer, ShieldAlert, Zap, Compass, Disc, Radio } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export default function App() {
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [violations, setViolations] = useState([]);
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");

  const [latestMetrics, setLatestMetrics] = useState({
    rpm: 0,
    speed: 0,
    batteryTemperature: 0,
    stateOfCharge: 100,
    accumulatorVoltage: 0,
    accumulatorCurrent: 0,
    gforceX: 0,
    gforceY: 0,
    gforceZ: 0,
    steeringAngle: 0,
    throttlePosition: 0,
    brakePosition: 0
  });
  
  const fetchInitialData = async () => {
    try {
      const telemetryRes = await fetch(`${API_BASE_URL}?size=50&sort=timestamp,desc`);
      const telemetryData = await telemetryRes.json();

      if (telemetryData.content) {
        const sortedHistory = [...telemetryData.content].reverse();
        setTelemetryHistory(sortedHistory);
        if (sortedHistory.length > 0) {
          setLatestMetrics(sortedHistory[sortedHistory.length - 1]);
        }
      }

      const violationsRes = await fetch(`${API_BASE_URL}/violations`);
      const violationsData = await violationsRes.json();
      setViolations(violationsData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const stompClient = new Client({
      brokerURL: WS_BASE_URL,
      reconnectDelay: 3000,
      onConnect: () => {
        setWsStatus("CONNECTED");

        stompClient.subscribe('/topic/live-data', (message) => {
          const data = JSON.parse(message.body);
          setLatestMetrics(data);
          setTelemetryHistory((prev) => {
            const updated = [...prev, data];
            return updated.slice(-30);
          });
        });

        stompClient.subscribe('/topic/violations', (message) => {
          const violation = JSON.parse(message.body);
          setViolations((prev) => {
            return [violation, ...prev];
          });
        });
      },
      onDisconnect: () => {
        setWsStatus("DISCONNECTED");
      },
      onStompError: (frame) => {
        console.error("STOMP protocol error", frame);
        setWsStatus("ERROR");
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const currentPowerKw = ((latestMetrics.accumulatorVoltage * latestMetrics.accumulatorCurrent) / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="text-amber-500 w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-black tracking-wider text-amber-500">ARISTURTLE TELEMETRY DESK</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-mono border ${
              wsStatus === "CONNECTED" 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              <Radio className={`w-3.5 h-3.5 ${wsStatus === "CONNECTED" ? "animate-pulse" : ""}`} />
              LIVE TELEMETRY: {wsStatus}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* CRITICAL POWERTRAIN METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Motor RPM</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1 font-mono">{latestMetrics.rpm?.toLocaleString() || 0}</h3>
              <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min((latestMetrics.rpm / 10000) * 100, 100)}%` }}></div>
              </div>
            </div>
            <Gauge className="text-amber-500/20 w-12 h-12" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accumulator Temp</p>
              <h3 className={`text-3xl font-black mt-1 font-mono ${latestMetrics.batteryTemperature >= 60 ? 'text-red-400' : 'text-slate-100'}`}>{latestMetrics.batteryTemperature?.toFixed(1) || 0}°C</h3>
              <p className="text-[11px] text-slate-500 mt-1">Warning: 60°C | Critical: 75°C</p>
            </div>
            <Thermometer className={`${latestMetrics.batteryTemperature >= 60 ? 'text-red-500 animate-bounce' : 'text-sky-400/30'} w-12 h-12`} />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Power Consumption</p>
              <h3 className={`text-3xl font-black mt-1 font-mono ${currentPowerKw > 80 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {currentPowerKw} <span className="text-sm font-normal text-slate-400">kW</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Formula Student Limit: 80.0 kW</p>
            </div>
            <Zap className={`${currentPowerKw > 80 ? 'text-red-500' : 'text-emerald-500/30'} w-12 h-12`} />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State of Charge (SoC)</p>
              <h3 className="text-3xl font-black text-cyan-400 mt-1 font-mono">{latestMetrics.stateOfCharge?.toFixed(1) || 0}%</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{latestMetrics.accumulatorVoltage?.toFixed(1) || 0}V | {latestMetrics.accumulatorCurrent?.toFixed(1) || 0}A</p>
            </div>
            <div className="text-cyan-500/20 font-black text-xl font-mono">HV</div>
          </div>
        </section>

        {/* VEHICLE DYNAMICS & DRIVER INPUTS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Chassis Mechanics</h4>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">GPS Speed</span>
                <span className="text-2xl font-black font-mono">{latestMetrics.speed?.toFixed(1) || 0} km/h</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Steering Angle</span>
                <span className="text-2xl font-black font-mono text-indigo-400">{latestMetrics.steeringAngle?.toFixed(1) || 0}°</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Driver Inputs</h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Throttle</span>
                <span className="text-emerald-400 font-bold">{latestMetrics.throttlePosition || 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${latestMetrics.throttlePosition || 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Brake Pressure</span>
                <span className="text-red-400 font-bold">{latestMetrics.brakePosition || 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-red-500 h-full transition-all duration-75" style={{ width: `${latestMetrics.brakePosition || 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">IMU Accelerometer (G)</h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block font-bold">LATERAL (Y)</span>
                <span className="text-sm font-mono font-bold text-amber-500">{latestMetrics.gforceY?.toFixed(2) || "0.00"}G</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block font-bold">LONGIT (X)</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{latestMetrics.gforceX?.toFixed(2) || "0.00"}G</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block font-bold">VERT (Z)</span>
                <span className="text-sm font-mono font-bold text-slate-400">{latestMetrics.gforceZ?.toFixed(2) || "0.00"}G</span>
              </div>
            </div>
          </div>
        </section>

        {/* CHARTS & TELEMETRY STREAM & SAFETY LOGS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col h-[420px]">
            <h2 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" /> Real-time Powertrain Analysis (Last 30 ticks)
            </h2>
            <div className="w-full h-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="id" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="RPM" />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={false} name="Speed (km/h)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col h-[420px]">
            <h2 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Safety Violations Log ({violations.length})
            </h2>
            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
              {violations.length === 0 ? (
                <div className="text-center pt-16 space-y-2">
                  <Disc className="w-8 h-8 text-slate-700 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 italic">Listening for system anomalies...</p>
                </div>
              ) : (
                violations.map((v, idx) => (
                  <div 
                    key={v.id ? v.id : idx} 
                    className={`p-3 border-l-4 rounded-r text-xs space-y-1 transition-all ${
                      v.severity === 'CRITICAL' 
                        ? 'border-red-500 bg-red-950/30 text-red-200' 
                        : v.severity === 'CLEARED'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                        : 'border-yellow-500 bg-yellow-950/30 text-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between font-bold uppercase tracking-wide">
                      <span>{v.parameterType}</span>
                      <span className="text-[11px] bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/80">{v.severity}</span>
                    </div>
                    <p className="text-slate-300 font-sans">{v.description}</p>
                    <span className="text-[11px] text-slate-500 block pt-1 font-mono">{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
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