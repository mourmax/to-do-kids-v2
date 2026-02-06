import { motion } from 'framer-motion'
import { Flame, Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// 👇 J'ai changé les noms ici pour correspondre au Dashboard : current, total, reward
export default function ChildProgressBar({ current, total, reward }) {
  const { t } = useTranslation()

  // Sécurités Anti-NaN et Division par zéro
  const safeTotal = Math.max(1, Number(total) || 1)
  const safeCurrent = Math.max(0, Number(current) || 0)

  // On limite l'affichage pour ne pas dépasser 100%
  const displayCurrent = Math.min(safeCurrent, safeTotal)
  const progress = (displayCurrent / safeTotal) * 100

  // On crée les étapes : 0, 1, 2... jusqu'au total
  const steps = Array.from({ length: safeTotal + 1 }, (_, i) => i)

  return (
    <section className="bg-slate-900 [.light-theme_&]:bg-gradient-to-br [.light-theme_&]:from-orange-500 [.light-theme_&]:to-orange-600 p-8 rounded-[3rem] border-2 border-white/5 [.light-theme_&]:border-white/10 relative shadow-2xl transition-colors">
      <div className="flex justify-between items-end mb-12 relative z-10">
        <div>
          <p className="text-orange-500 [.light-theme_&]:text-orange-100 text-[10px] font-black uppercase tracking-widest mb-1">{t('child.final_goal')}</p>
          <h2 className="text-white font-black text-lg flex items-center gap-2 italic uppercase tracking-tight">
            🎁 {reward || "Surprise"}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-5xl font-black text-indigo-400 [.light-theme_&]:text-white leading-none">{displayCurrent}</span>
          <span className="text-slate-600 [.light-theme_&]:text-orange-200 font-black uppercase ml-1">/{safeTotal} {t('child.days')}</span>
        </div>
      </div>

      {/* Container de la barre */}
      <div className="relative h-10 mt-2">

        {/* Fond de la barre (Gris) */}
        <div className="absolute inset-0 bg-slate-800 [.light-theme_&]:bg-orange-700/50 rounded-full border border-white/5 overflow-hidden">

          {/* Remplissage coloré (Progression) */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 relative z-0"
          />

          {/* 📏 POINTS D'ÉTAPE (Barres verticales) */}
          {steps.map((step) => {
            // Pas de barre aux extrémités pour le style
            if (step === 0 || step === safeTotal) return null

            const positionPercent = (step / safeTotal) * 100
            const isPassed = displayCurrent >= step

            return (
              <div
                key={step}
                className={`absolute top-0 bottom-0 w-[2px] z-10 transition-colors duration-500 ${isPassed ? 'bg-indigo-300/30' : 'bg-slate-950/50'}`}
                style={{ left: `${positionPercent}%` }}
              />
            )
          })}
        </div>

        {/* CHIFFRES ET ICÔNES (Sous la barre) */}
        {steps.map((step) => {
          const positionPercent = (step / safeTotal) * 100
          const isPassed = displayCurrent >= step

          return (
            <div
              key={`label-${step}`}
              className="absolute top-0 h-full flex flex-col items-center justify-center pointer-events-none"
              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
            >
              {/* Le numéro en dessous */}
              <div className={`absolute -bottom-6 text-[10px] font-black transition-colors ${isPassed ? 'text-indigo-400' : 'text-slate-600'}`}>
                {step === safeTotal ? <Gift size={16} /> : step}
              </div>
            </div>
          )
        })}

        {/* 🔥 FLAMME MOBILE (Au dessus de tout) */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute top-0 h-full z-20"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="relative w-1 h-full flex items-center justify-center">
            {/* La flamme flotte au dessus de la barre */}
            <div className="absolute -top-8 bg-orange-500/20 [.light-theme_&]:bg-white/20 p-1.5 rounded-full animate-pulse backdrop-blur-sm border border-orange-500/30 [.light-theme_&]:border-white/30">
              <Flame size={28} className="text-orange-500 fill-orange-500 [.light-theme_&]:text-yellow-300 [.light-theme_&]:fill-yellow-300 drop-shadow-lg" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}