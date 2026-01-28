import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'

export default function ParentVictoryModal({ childName, rewardName, onClose, isParent = true, isReady = false }) {
  const { t } = useTranslation()

  // Explosion de confettis "Premium" à l'ouverture
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110 }; // Augmenté zIndex pour passer au dessus de la modale

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confettis venant des deux côtés
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, [])

  const getButtonText = () => {
    if (isParent) return t('validation.continue_to_report')
    if (isReady) return t('validation.start_new_challenge_child', { name: childName })
    return t('validation.waiting_next_challenge')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-indigo-900 via-[#020617] to-[#020617] border-2 border-indigo-400/50 rounded-[3rem] p-8 text-center shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden"
      >
        {/* Rayons de lumière en arrière-plan */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[200%] h-[200%] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent rotate-45 animate-[spin_10s_linear_infinite]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Icône Trophée animée */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-yellow-300 to-orange-500 p-6 rounded-full shadow-xl shadow-orange-500/30 relative"
          >
            <Trophy size={64} className="text-white drop-shadow-md" />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-200 animate-pulse" size={24} />
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 uppercase italic tracking-tighter"
            >
              {t('validation.victory_title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-indigo-200 text-sm font-bold uppercase tracking-widest leading-relaxed"
            >
              {t('validation.victory_message_with_name', { name: childName })}
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-indigo-600/30 border border-indigo-400/30 p-5 rounded-3xl w-full backdrop-blur-sm"
          >
            <p className="text-indigo-300 text-[10px] font-black uppercase mb-1 tracking-wider">{t('validation.reward_unlocked_upcase')}</p>
            <p className="text-2xl font-black text-white uppercase italic text-shadow">{rewardName}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={onClose}
            className="w-full bg-white text-indigo-950 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-lg shadow-white/20 active:scale-95"
          >
            {getButtonText()}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}