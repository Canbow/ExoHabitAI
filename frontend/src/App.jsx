import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import { Rocket, BarChart3, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'analyzer'

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* Animated Background */}
      <div className="stars"></div>
      
      {/* --- LANDING SCREEN --- */}
      <AnimatePresence>
        {view === 'landing' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }}
            className="h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-900/50 to-space-900 pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Globe className="w-24 h-24 text-cyan-400 mb-6 mx-auto animate-pulse" />
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                EXOHABIT<span className="text-white">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-light">
                Artificial Intelligence for Exoplanetary Habitability Assessment
              </p>
              
              <button 
                onClick={() => setView('dashboard')}
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] flex items-center gap-3 mx-auto"
              >
                Launch Mission System
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN APP INTERFACE --- */}
      {view !== 'landing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          
          {/* Navbar */}
          <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
                <Globe className="text-cyan-400 w-6 h-6" />
                <h1 className="text-xl font-bold tracking-wider">ExoHabit<span className="text-cyan-400">AI</span></h1>
              </div>
              <div className="flex gap-4">
                <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<BarChart3 size={18} />} label="Mission Control" />
                <NavButton active={view === 'analyzer'} onClick={() => setView('analyzer')} icon={<Rocket size={18} />} label="Analyzer" />
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto p-6">
            <AnimatePresence mode="wait">
              {view === 'dashboard' ? (
                <motion.div key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Dashboard />
                </motion.div>
              ) : (
                <motion.div key="anal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Analyzer />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

        </motion.div>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
      active ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);