import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Check, Bell } from 'lucide-react'
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
      className={`relative overflow-hidden p-5 aspect-square rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center justify-between shadow-xl ${isParentValidated
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 shadow-[0_15px_30px_rgba(251,191,36,0.3)]'
        : isDone
          ? 'bg-emerald-500 border-emerald-400 shadow-[0_15px_30px_rgba(16,185,129,0.2)]'
          : 'bg-slate-900 [.light-theme_&]:bg-white border-white/5 [.light-theme_&]:border-indigo-100 [.light-theme_&]:border-b-[10px] [.light-theme_&]:shadow-[0_20px_40px_rgba(99,102,241,0.08)]'
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

      <div className={`flex flex-col items-center gap-2 mt-2 z-10 text-center pointer-events-none transition-transform duration-500 ${isParentValidated ? 'scale-110' : ''}`}>
        <motion.span
          animate={isDone ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          className={`text-7xl mb-1 transition-all drop-shadow-sm flex items-center justify-center h-20 w-20 ${isDone ? 'drop-shadow-md' : ''}`}
        >
          {mission.icon || '⭐'}
        </motion.span>
        <h3 className={`font-black uppercase text-[13px] tracking-tight leading-tight px-1 ${isParentValidated ? 'text-white' : 'text-slate-200 [.light-theme_&]:text-indigo-950'}`}>
          {t(mission.title)}
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {(mission.scheduled_times || []).map((t, idx) => (
            <div key={idx} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${isParentValidated ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500 [.light-theme_&]:bg-indigo-50 [.light-theme_&]:text-indigo-600 border border-indigo-500/10'}`}>
              <Bell size={11} className="shrink-0" /> {t}
            </div>
          ))}
        </div>
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
