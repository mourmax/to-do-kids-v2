import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, CheckCircle, Trophy, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TutorialModal({ onClose }) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  const slides = [
    {
      title: t('tutorial.welcome_title'),
      text: t('tutorial.welcome_text'),
      icon: "🚀",
      color: "bg-indigo-500"
    },
    {
      title: t('tutorial.child_title'),
      text: t('tutorial.child_text'),
      icon: <CheckCircle size={80} strokeWidth={2.5} />,
      color: "bg-emerald-500"
    },
    {
      title: t('tutorial.parent_title'),
      text: t('tutorial.parent_text'),
      icon: <Shield size={80} strokeWidth={2.5} />,
      color: "bg-orange-500"
    },
    {
      title: t('tutorial.reward_title'),
      text: t('tutorial.reward_text'),
      icon: <Trophy size={80} strokeWidth={2.5} />,
      color: "bg-pink-500"
    }
  ]

  const nextSlide = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        {/* Bouton Fermer */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white z-20 transition-colors">
          <X size={28} />
        </button>

        {/* Contenu visuel (Icône) */}
        <div className={`h-44 ${slides[index].color} flex items-center justify-center text-white relative overflow-hidden transition-colors duration-500`}>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="drop-shadow-2xl"
          >
            {typeof slides[index].icon === 'string' ? (
              <span className="text-7xl">{slides[index].icon}</span>
            ) : (
              slides[index].icon
            )}
          </motion.div>
        </div>

        {/* Zone de Texte optimisée */}
        <div className="p-10 text-center space-y-8">
          <motion.div
            key={`text-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              {slides[index].title}
            </h3>

            <p className="text-slate-200 text-xl font-medium leading-relaxed whitespace-pre-line px-2">
              {slides[index].text}
            </p>
          </motion.div>

          {/* Pagination plus visible */}
          <div className="flex justify-center gap-3">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-8' : 'bg-white/20 w-2'}`}
              />
            ))}
          </div>

          {/* Bouton Suivant plus imposant */}
          <button
            onClick={nextSlide}
            className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase text-lg tracking-widest hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {index === slides.length - 1 ? t('tutorial.start') : t('tutorial.next')}
            {index < slides.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </motion.div>
    </div>
  )
}