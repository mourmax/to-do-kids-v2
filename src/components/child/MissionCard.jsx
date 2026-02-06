import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// 1. On change "onClick" en "onToggle" dans les arguments
export default function MissionCard({ mission, onToggle, disabled }) {
  const { t } = useTranslation()
  const isDone = mission.is_completed
  const isParentValidated = mission.parent_validated && isDone

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden p-5 aspect-square rounded-[2.8rem] border-2 transition-all duration-700 flex flex-col items-center justify-between shadow-2xl ${isParentValidated
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 shadow-[0_15px_30px_rgba(251,191,36,0.3)]'
        : isDone
          ? 'bg-emerald-500 border-emerald-400 shadow-[0_15px_30px_rgba(16,185,129,0.2)]'
          : 'bg-slate-900 [.light-theme_&]:bg-white border-white/5 [.light-theme_&]:border-indigo-100 [.light-theme_&]:border-b-[8px] [.light-theme_&]:shadow-indigo-500/10'
        }`}
    >
      <AnimatePresence>
        {isDone && !isParentValidated && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.25 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
          >
            <CheckCircle2 size={140} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
        {isParentValidated && (
          <motion.div
            initial={{ scale: 0, rotate: -20, y: 10 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            className="absolute top-4 right-4 z-40 bg-white text-orange-600 px-3 py-1.5 rounded-2xl font-black text-[9px] tracking-widest shadow-xl flex items-center gap-1 border border-orange-100"
          >
            <Check size={12} strokeWidth={4} /> {t('child.validated').toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex flex-col items-center gap-1 mt-4 z-10 text-center pointer-events-none transition-transform duration-500 ${isParentValidated ? 'scale-110' : ''}`}>
        <motion.span
          animate={isDone ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          className={`text-6xl mb-2 transition-all drop-shadow-sm ${isDone ? 'drop-shadow-md' : ''}`}
        >
          {mission.icon || '⭐'}
        </motion.span>
        <h3 className={`font-black uppercase text-[11px] tracking-tight leading-tight px-1 ${isParentValidated ? 'text-white' : 'text-white [.light-theme_&]:text-indigo-950'}`}>
          {t(mission.title)}
        </h3>
      </div>

      {!isParentValidated ? (
        <button
          onClick={() => !disabled && onToggle(mission.id, isDone)}
          className={`w-full py-3.5 rounded-[1.8rem] font-black uppercase text-[9px] tracking-[0.15em] transition-all z-30 shadow-lg ${isDone
            ? 'bg-white/20 text-white border border-white/30 hover:bg-white/40'
            : 'bg-indigo-600 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 [.light-theme_&]:bg-indigo-500 [.light-theme_&]:text-white [.light-theme_&]:border-indigo-700 [.light-theme_&]:shadow-indigo-500/20'
            }`}
        >
          {isDone ? (
            <span className="flex items-center justify-center gap-1">
              <Check size={12} strokeWidth={4} /> {t('actions.cancel').toUpperCase()}
            </span>
          ) : t('child.to_do').toUpperCase()}
        </button>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full py-3.5 rounded-[1.8rem] bg-white text-orange-600 font-black uppercase text-[9px] tracking-widest text-center shadow-inner"
        >
          {t('child.victory_title').toUpperCase()}
        </motion.div>
      )}
    </motion.div>
  )
}
