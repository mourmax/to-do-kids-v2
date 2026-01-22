import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Check } from 'lucide-react'

export default function MissionCard({ mission, onClick }) {
  const isDone = mission.is_completed

  return (
    <motion.div
      layout
      className={`relative overflow-hidden p-4 aspect-square rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center justify-between ${
        isDone ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-white/5 shadow-xl shadow-black/20'
      }`}
    >
      <AnimatePresence>
        {isDone && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1.2, opacity: 0.2 }} 
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
          >
            <CheckCircle2 size={120} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-1 mt-2 z-10 text-center pointer-events-none">
        <span className={`text-5xl mb-1 transition-all ${isDone ? 'scale-110 drop-shadow-md' : 'grayscale-[0.2]'}`}>
          {mission.icon || '⭐'}
        </span>
        <h3 className="font-black uppercase text-[10px] tracking-tight leading-tight px-1 text-white text-shadow-sm">
          {mission.title}
        </h3>
      </div>

      <button 
        onClick={() => onClick(mission.id, isDone)} 
        className={`w-full py-2.5 rounded-[1.5rem] font-black uppercase text-[8px] tracking-[0.1em] transition-all z-30 ${
          isDone 
          ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30' 
          : 'bg-indigo-600 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1'
        }`}
      >
        {isDone ? (
          <span className="flex items-center justify-center gap-1">
            <Check size={10} strokeWidth={4} /> ANNULER
          </span>
        ) : "A FAIRE"}
      </button>
    </motion.div>
  )
}