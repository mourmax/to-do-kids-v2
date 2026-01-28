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
      className={`relative overflow-hidden p-4 aspect-square rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col items-center justify-between ${isParentValidated
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
        : isDone
          ? 'bg-emerald-600 border-emerald-500'
          : 'bg-slate-900 [.light-theme_&]:bg-white border-white/5 [.light-theme_&]:border-indigo-200 [.light-theme_&]:border-b-[6px] shadow-xl shadow-black/20 [.light-theme_&]:shadow-indigo-200/50'
        }`}
    >
      <AnimatePresence>
        {isDone && !isParentValidated && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.2 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
          >
            <CheckCircle2 size={120} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
        {isParentValidated && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-3 right-3 z-40 bg-white text-orange-600 px-2 py-1 rounded-lg font-black text-[8px] tracking-widest shadow-xl flex items-center gap-1"
          >
            <Check size={10} strokeWidth={4} /> {t('child.validated').toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex flex-col items-center gap-1 mt-2 z-10 text-center pointer-events-none transition-transform duration-500 ${isParentValidated ? 'scale-110' : ''}`}>
        <span className={`text-5xl mb-1 transition-all ${isDone ? 'scale-110 drop-shadow-md' : 'grayscale-0 opacity-100'}`}>
          {mission.icon || '⭐'}
        </span>
        <h3 className={`font-black uppercase text-[10px] tracking-tight leading-tight px-1 text-shadow-sm ${isParentValidated ? 'text-white' : 'text-white [.light-theme_&]:text-slate-800'}`}>
          {t(mission.title)}
        </h3>
      </div>

      {!isParentValidated ? (
        <button
          onClick={() => !disabled && onToggle(mission.id, isDone)}
          className={`w-full py-2.5 rounded-[1.5rem] font-black uppercase text-[8px] tracking-[0.1em] transition-all z-30 ${isDone
            ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
            : 'bg-indigo-600 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 [.light-theme_&]:bg-indigo-500 [.light-theme_&]:text-white [.light-theme_&]:border-indigo-700'
            }`}
        >
          {isDone ? (
            <span className="flex items-center justify-center gap-1">
              <Check size={10} strokeWidth={4} /> {t('actions.cancel').toUpperCase()}
            </span>
          ) : t('child.to_do').toUpperCase()}
        </button>
      ) : (
        <div className="w-full py-2.5 rounded-[1.5rem] bg-white text-orange-600 font-black uppercase text-[8px] tracking-widest text-center shadow-inner">
          {t('child.victory_title').toUpperCase()}
        </div>
      )}
    </motion.div>
  )
}
