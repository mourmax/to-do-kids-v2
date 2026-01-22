import { motion } from 'framer-motion'
import { Flame, Gift } from 'lucide-react'

export default function ChildProgressBar({ streak, goal, rewardName }) {
  const safeGoal = goal || 1
  const displayStreak = Math.min(streak, safeGoal)
  const progress = (displayStreak / safeGoal) * 100

  // On crée les étapes : 0, 1, 2...
  const steps = Array.from({ length: safeGoal + 1 }, (_, i) => i)

  return (
    <section className="bg-slate-900 p-8 rounded-[3rem] border-2 border-white/5 relative shadow-2xl">
      <div className="flex justify-between items-end mb-12 relative z-10">
        <div>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-1">Objectif final</p>
          <h2 className="text-white font-black text-lg flex items-center gap-2 italic uppercase tracking-tight">
            🎁 {rewardName || "Surprise"}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-5xl font-black text-indigo-400 leading-none">{displayStreak}</span>
          <span className="text-slate-600 font-black uppercase ml-1">/{safeGoal}j</span>
        </div>
      </div>

      {/* Container de la barre */}
      <div className="relative h-10 mt-2">
        
        {/* Fond de la barre (Gris) */}
        <div className="absolute inset-0 bg-slate-800 rounded-full border border-white/5 overflow-hidden">
          
          {/* Remplissage coloré (Progression) */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }} 
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 relative z-0" 
          />
          
          {/* 📏 POINTS D'ÉTAPE (Barres verticales À L'INTÉRIEUR du masque overflow-hidden) */}
          {steps.map((step) => {
            // Ne pas afficher la barre pour le début (0) et la fin (goal) pour éviter les bords moches
            if (step === 0 || step === safeGoal) return null
            
            const positionPercent = (step / safeGoal) * 100
            const isPassed = displayStreak >= step

            return (
              <div 
                key={step}
                className={`absolute top-0 bottom-0 w-[2px] z-10 transition-colors duration-500 ${isPassed ? 'bg-indigo-300/30' : 'bg-slate-950/50'}`}
                style={{ left: `${positionPercent}%` }}
              />
            )
          })}
        </div>

        {/* CHIFFRES ET ICÔNES (En dehors du masque overflow-hidden) */}
        {steps.map((step) => {
          const positionPercent = (step / safeGoal) * 100
          const isPassed = displayStreak >= step

          return (
            <div 
              key={`label-${step}`}
              className="absolute top-0 h-full flex flex-col items-center justify-center pointer-events-none"
              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
            >
              {/* Le numéro en dessous */}
              <div className={`absolute -bottom-6 text-[10px] font-black transition-colors ${isPassed ? 'text-indigo-400' : 'text-slate-600'}`}>
                {step === safeGoal ? <Gift size={16} /> : step}
              </div>
            </div>
          )
        })}

        {/* 🔥 FLAMME MOBILE (Au dessus de tout) */}
        <motion.div 
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="absolute top-0 h-full z-20"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="relative w-1 h-full flex items-center justify-center">
             {/* La flamme flotte au dessus de la barre */}
            <div className="absolute -top-8 bg-orange-500/20 p-1.5 rounded-full animate-pulse backdrop-blur-sm border border-orange-500/30">
               <Flame size={28} className="text-orange-500 fill-orange-500 drop-shadow-lg" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}