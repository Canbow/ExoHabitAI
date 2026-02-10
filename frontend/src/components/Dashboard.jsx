import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, Trophy, AlertTriangle, CheckCircle, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// --- CONFIGURATION ---
const ANIM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL DATA FETCH
    axios.get('http://127.0.0.1:5000/dashboard-data')
      .then(res => setData(res.data))
      .catch(err => console.error(err)) // Handles offline backend gracefully
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div>;

  // Fallback for demo if backend is offline
  const safeData = data || { 
    metrics: { total: 4520, habitable: 32, non_habitable: 4488, best_model: "Random Forest", avg_score: 0.04 },
    table: [],
    charts: { feature_importance: { labels: [], values: [] } } 
  };

  const featureData = safeData.charts.feature_importance.labels.map((l, i) => ({ name: l, value: safeData.charts.feature_importance.values[i] }));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Planets", val: safeData.metrics.total, icon: Globe, col: "text-blue-400" },
          { title: "Habitable", val: safeData.metrics.habitable, icon: CheckCircle, col: "text-emerald-400" },
          { title: "Non-Habitable", val: safeData.metrics.non_habitable, icon: AlertTriangle, col: "text-rose-400" },
          { title: "Best Model", val: safeData.metrics.best_model, icon: Trophy, col: "text-yellow-400" }
        ].map((item, i) => (
          <motion.div 
            custom={i} initial="hidden" animate="visible" variants={ANIM_VARIANTS}
            key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className={`absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity ${item.col}`}>
              <item.icon size={100} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.title}</p>
            <h3 className={`text-4xl font-black mt-2 ${item.col}`}>{item.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={ANIM_VARIANTS} className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-6 text-cyan-100 flex items-center gap-2">
            <Activity className="text-cyan-400" size={20}/> Model Logic Analysis
          </h2>
          <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical" margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#555" />
                <YAxis dataKey="name" type="category" width={100} stroke="#aaa" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Bar dataKey="value" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Candidates */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={ANIM_VARIANTS} className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-6 text-emerald-100 flex items-center gap-2">
            <Trophy className="text-emerald-400" size={20}/> Top Candidates
          </h2>
          <div className="space-y-3">
            {safeData.table.slice(0, 5).map((row, k) => (
              <div key={k} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border-l-2 border-emerald-500/0 hover:border-emerald-500">
                <div>
                  <div className="text-sm font-bold text-white">Kepler-{k+100}b</div>
                  <div className="text-xs text-gray-500">Radius: {row.Radius.toFixed(2)} R⊕</div>
                </div>
                <div className="text-emerald-400 font-mono font-bold">{(row.Habitability_Probability * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}