import { motion } from 'framer-motion'
import { Skull, X, AlertTriangle } from 'lucide-react'

import { useTranslation } from 'react-i18next'

export default function FailureModal({ malusMessage, onClose, onConfirm }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, x: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: [0, -10, 10, -10, 10, 0] // Animation de secousse "Non !"
        }}
        transition={{ duration: 0.5 }}
        className="bg-[#020617] w-full max-w-sm border border-red-500/30 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center gap-4 mt-2">
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 shadow-inner">
            <span className="text-5xl" role="img" aria-label="triste">😥</span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              {t('validation.failure_title')}
            </h3>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mt-2">
              {t('validation.failure_subtitle')}
            </p>
          </div>

          {/* Affichage du Malus */}
          <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl w-full">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-[10px] uppercase font-bold text-red-400">{t('validation.malus_label')}</span>
            </div>
            <p className="text-white font-bold text-sm italic">"{malusMessage}"</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors"
            >
              {t('validation.confirm_failure')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}