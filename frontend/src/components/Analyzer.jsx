import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Info, Download, FileText, CheckCircle, AlertTriangle, History, Trash2 } from 'lucide-react';
import Planet3D from './Planet3D'; // Import the new 3D component

export default function Analyzer() {
  const [formData, setFormData] = useState({
    Name: '', Radius: '', Mass: '', EqTemp: '', Insolation: '', Period: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // --- LOAD HISTORY ON STARTUP ---
  useEffect(() => {
    const saved = localStorage.getItem('mission_logs');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const res = await axios.post('https://exohabitai-1-ysat.onrender.com/predict', formData);
        
        const newResult = {
            ...res.data,
            timestamp: new Date().toLocaleString(),
            id: Date.now() // Unique ID
        };

        setResult(newResult);

        // --- SAVE TO HISTORY ---
        const updatedHistory = [newResult, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('mission_logs', JSON.stringify(updatedHistory));

    } catch (err) {
        alert("Error: Backend offline.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mission_logs');
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `MISSION REPORT\nPlanet: ${result.input_planet}\nPrediction: ${result.prediction}\nConfidence: ${(result.confidence_score * 100).toFixed(1)}%`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${result.input_planet}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN: INPUT FORM (4 Columns wide) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
            <Search className="text-cyan-400" size={20} />
            Scanner Controls
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
            <InputGroup label="Planet Name" name="Name" type="text" onChange={handleChange} placeholder="e.g. Kepler-186f" />
            <div className="grid grid-cols-2 gap-3">
                <InputGroup label="Radius (Earth=1)" name="Radius" onChange={handleChange} placeholder="1.0" />
                <InputGroup label="Mass (Earth=1)" name="Mass" onChange={handleChange} placeholder="1.0" />
                <InputGroup label="Temp (K)" name="EqTemp" onChange={handleChange} placeholder="288" />
                <InputGroup label="Period (Days)" name="Period" onChange={handleChange} placeholder="365" />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
                {loading ? "Scanning..." : "Analyze Habitability"}
            </button>
            </form>
        </div>

        {/* MISSION LOG (HISTORY) */}
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10 h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-300 flex items-center gap-2"><History size={16}/> Mission Log</h3>
                <button onClick={clearHistory} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"><Trash2 size={12}/> Clear</button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                {history.length === 0 && <p className="text-xs text-gray-600 text-center mt-10">No recent scans.</p>}
                {history.map((scan) => (
                    <div key={scan.id} className="p-3 bg-white/5 rounded-lg border-l-2 border-transparent hover:border-cyan-400 transition-all cursor-pointer" onClick={() => setResult(scan)}>
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-white">{scan.input_planet}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${scan.habitable_flag ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {scan.habitable_flag ? 'LIFE' : 'DEAD'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{scan.timestamp}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 3D RESULT (8 Columns wide) */}
      <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
        {result ? (
          <div className={`relative h-full p-8 rounded-2xl border-2 ${result.habitable_flag ? 'border-emerald-500 bg-emerald-900/10' : 'border-rose-500 bg-rose-900/10'} shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col`}>
            
            {/* 3D VIEWPORT */}
            <div className="absolute inset-0 z-0 opacity-80">
                {/* PASSING 'formData' ALLOWS THE PLANET TO REACT TO TEMP/RADIUS */}
                <Planet3D data={formData} isHabitable={result.habitable_flag} />
            </div>

            {/* OVERLAY UI */}
            <div className="relative z-10 pointer-events-none mt-auto bg-gradient-to-t from-black via-black/80 to-transparent p-6 -m-8 pt-20">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Target Analysis</div>
                        <h1 className="text-5xl font-black text-white mb-2">{result.prediction}</h1>
                        <p className="text-cyan-400 font-mono">CONFIDENCE: {(result.confidence_score * 100).toFixed(1)}%</p>
                    </div>
                    
                    <button 
                        onClick={handleDownload}
                        className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold backdrop-blur-md transition-all"
                    >
                        <Download size={18} />
                        Save Data
                    </button>
                </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-gray-500 p-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <div>
                <Info className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
                <p className="text-xl font-light">Awaiting Telemetry Data...</p>
                <p className="text-sm text-gray-600 mt-2">Enter planet parameters to generate 3D model.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InputGroup = ({ label, name, type="number", onChange, placeholder }) => (
  <div>
    <label className="block text-[10px] text-cyan-200/50 uppercase tracking-wider mb-1 font-bold">{label}</label>
    <input 
      type={type} 
      name={name} 
      step="any"
      required
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm placeholder-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
    />
  </div>
);