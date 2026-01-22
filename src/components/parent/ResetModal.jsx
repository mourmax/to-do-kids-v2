import { motion } from 'framer-motion'
import { AlertTriangle, Rocket, X } from 'lucide-react'

export default function ResetModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#020617] w-full max-w-sm border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Fond lumineux */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[60px] pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center gap-4 mt-2">
          <div className="bg-orange-500/10 p-4 rounded-full border border-orange-500/20">
            <Rocket size={32} className="text-orange-500" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
              Lancer la nouvelle série ?
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Cela va remettre le compteur de jours à zéro. Assurez-vous d'avoir validé les missions et la récompense avec votre enfant.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button 
              onClick={onClose}
              className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              C'est parti !
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}