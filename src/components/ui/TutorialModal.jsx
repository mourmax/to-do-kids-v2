import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, CheckCircle, Trophy, Shield } from 'lucide-react'

const slides = [
  {
    title: "Bienvenue à Bord !",
    text: "L'application qui transforme les corvées en aventures.",
    icon: "🚀",
    color: "bg-indigo-500"
  },
  {
    title: "Pour l'Enfant",
    text: "Réalise tes missions, coche les cases et regarde ta flamme grandir jour après jour !",
    icon: <CheckCircle size={48} />,
    color: "bg-emerald-500"
  },
  {
    title: "Pour le Parent",
    text: "Valide les journées pour débloquer les points. Tu es le maître du jeu.",
    icon: <Shield size={48} />,
    color: "bg-orange-500"
  },
  {
    title: "La Récompense",
    text: "Définissez ensemble un cadeau à la fin de la série. C'est la motivation ultime !",
    icon: <Trophy size={48} />,
    color: "bg-pink-500"
  }
]

export default function TutorialModal({ onClose }) {
  const [index, setIndex] = useState(0)

  const nextSlide = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative"
      >
        {/* Bouton Fermer */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20">
          <X size={24} />
        </button>

        {/* Contenu du Slide */}
        <div className={`h-48 ${slides[index].color} flex items-center justify-center text-white relative overflow-hidden transition-colors duration-500`}>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring" }}
            className="text-6xl drop-shadow-md"
          >
            {slides[index].icon}
          </motion.div>
        </div>

        <div className="p-8 text-center space-y-6">
          <motion.div
            key={`text-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
              {slides[index].title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {slides[index].text}
            </p>
          </motion.div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-indigo-500 w-6' : 'bg-slate-700'}`} />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {index === slides.length - 1 ? "C'est parti !" : "Suivant"}
            {index < slides.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  )
}