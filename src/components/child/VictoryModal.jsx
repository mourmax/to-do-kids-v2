import { motion } from 'framer-motion'
import { Trophy, Gift, RefreshCw } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export default function VictoryModal({ rewardName, onParentMode }) {
  
  useEffect(() => {
    // Feu d'artifice de confettis
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#020617] w-full max-w-sm border-2 border-indigo-500 rounded-[3rem] p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="bg-yellow-400 p-6 rounded-full shadow-lg shadow-yellow-500/50 animate-bounce">
            <Trophy size={64} className="text-yellow-900" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              CHALLENGE RÉUSSI !
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Tu as mérité ta récompense
            </p>
          </div>

          <div className="bg-indigo-600/20 border border-indigo-500/50 p-6 rounded-3xl w-full">
            <p className="text-indigo-300 text-[10px] font-black uppercase mb-2">Ta récompense</p>
            <div className="flex items-center justify-center gap-3">
              <Gift size={28} className="text-indigo-400" />
              <span className="text-2xl font-black text-white uppercase italic">{rewardName}</span>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-white/10 space-y-4">
            <p className="text-slate-500 text-[10px]">Passe le téléphone à ton parent pour valider la fin et lancer le prochain défi !</p>
            
            <button 
              onClick={onParentMode}
              className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw size={16} /> Espace Parent (Reset)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}