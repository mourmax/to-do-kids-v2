import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Rocket, Star, Shield, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Floating particle helper
function Particle({ x, y, size, color, delay, duration }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{
        y: [0, -18, 0],
        x: [0, 6, -6, 0],
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.3, 1],
      }}
      transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
    />
  )
}

// Particles per slide (seeded positions)
const PARTICLES = [
  // Screen 1 — violet/indigo
  [
    { x: 15, y: 20, size: 8, color: '#a78bfa', delay: 0, duration: 2.2 },
    { x: 78, y: 15, size: 5, color: '#c4b5fd', delay: 0.4, duration: 1.8 },
    { x: 88, y: 65, size: 10, color: '#7c3aed', delay: 0.8, duration: 2.6 },
    { x: 10, y: 75, size: 6, color: '#ddd6fe', delay: 0.2, duration: 2.0 },
    { x: 55, y: 10, size: 7, color: '#8b5cf6', delay: 1.0, duration: 2.4 },
    { x: 92, y: 35, size: 4, color: '#ede9fe', delay: 0.6, duration: 1.6 },
  ],
  // Screen 2 — emerald
  [
    { x: 12, y: 18, size: 9, color: '#34d399', delay: 0, duration: 2.0 },
    { x: 80, y: 22, size: 5, color: '#6ee7b7', delay: 0.5, duration: 2.4 },
    { x: 85, y: 70, size: 8, color: '#10b981', delay: 0.3, duration: 1.9 },
    { x: 8, y: 70, size: 6, color: '#a7f3d0', delay: 0.7, duration: 2.2 },
    { x: 50, y: 8, size: 7, color: '#059669', delay: 1.1, duration: 2.6 },
    { x: 90, y: 45, size: 4, color: '#d1fae5', delay: 0.2, duration: 1.7 },
  ],
  // Screen 3 — violet + indigo
  [
    { x: 18, y: 15, size: 7, color: '#818cf8', delay: 0, duration: 2.1 },
    { x: 75, y: 10, size: 5, color: '#6366f1', delay: 0.6, duration: 2.5 },
    { x: 88, y: 60, size: 9, color: '#4f46e5', delay: 0.3, duration: 1.8 },
    { x: 10, y: 65, size: 6, color: '#c7d2fe', delay: 0.9, duration: 2.3 },
    { x: 55, y: 12, size: 8, color: '#a5b4fc', delay: 0.4, duration: 2.0 },
    { x: 92, y: 30, size: 4, color: '#e0e7ff', delay: 0.1, duration: 1.6 },
  ],
  // Screen 4 — amber/orange
  [
    { x: 14, y: 20, size: 8, color: '#fbbf24', delay: 0, duration: 2.3 },
    { x: 78, y: 12, size: 6, color: '#f59e0b', delay: 0.4, duration: 1.9 },
    { x: 85, y: 65, size: 10, color: '#f97316', delay: 0.7, duration: 2.5 },
    { x: 8, y: 72, size: 5, color: '#fde68a', delay: 0.2, duration: 2.1 },
    { x: 52, y: 8, size: 7, color: '#fb923c', delay: 1.0, duration: 2.0 },
    { x: 90, y: 40, size: 4, color: '#fed7aa', delay: 0.5, duration: 1.7 },
  ],
]

export default function TutorialModal({ onClose }) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const slides = [
    {
      key: 'welcome',
      title: t('tutorial.welcome_title') || 'BIENVENUE !',
      text: t('tutorial.welcome_text') || 'Fini les rappels inutiles, place à l\'organisation ludique pour toute la famille.',
      Icon: Rocket,
      gradient: 'linear-gradient(145deg, #7c3aed 0%, #4f46e5 60%, #818cf8 100%)',
      accent: '#a78bfa',
      features: ['🚀 Organisation fun', '👨‍👩‍👧 Pour toute la famille', '⚡ En 2 minutes'],
    },
    {
      key: 'child',
      title: t('tutorial.child_title') || "POUR L'ENFANT",
      text: t('tutorial.child_text') || 'Réalise tes missions, coche les cases et regarde ta progression vers ta récompense !',
      Icon: Star,
      gradient: 'linear-gradient(145deg, #059669 0%, #10b981 60%, #34d399 100%)',
      accent: '#6ee7b7',
      features: ['✅ Missions du jour', '🔥 Streaks consécutifs', '🏆 Récompenses'],
    },
    {
      key: 'parent',
      title: t('tutorial.parent_title') || 'POUR LE PARENT',
      text: t('tutorial.parent_text') || 'Créez les missions, validez les journées et motivez votre enfant en quelques secondes.',
      Icon: Shield,
      gradient: 'linear-gradient(145deg, #4338ca 0%, #6366f1 60%, #818cf8 100%)',
      accent: '#a5b4fc',
      features: ['📋 Créer des missions', '✅ Valider les journées', '👑 Gestion Premium'],
    },
    {
      key: 'go',
      title: t('tutorial.reward_title') || "C'EST PARTI !",
      text: t('tutorial.reward_text') || 'Tout est prêt ! Configurez vos premières missions et lancez le premier défi famille.',
      Icon: Trophy,
      gradient: 'linear-gradient(145deg, #b45309 0%, #f59e0b 60%, #fbbf24 100%)',
      accent: '#fde68a',
      features: ['🎯 Défi famille', '🎁 Bonus & Malus', '🌟 Aventure commence'],
    },
  ]

  const slide = slides[index]
  const isLast = index === slides.length - 1

  const nextSlide = () => {
    if (!isLast) {
      setDirection(1)
      setIndex(i => i + 1)
    } else {
      onClose()
    }
  }

  const goTo = (i) => {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  const variants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.95 }),
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,3,15,0.92)', backdropFilter: 'blur(18px)' }}>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-sm relative select-none"
        style={{
          background: 'linear-gradient(160deg, #0f0b1e 0%, #130d2a 100%)',
          borderRadius: 40,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 text-white/30 hover:text-white/80 transition-colors"
        >
          <X size={22} />
        </button>

        {/* Hero panel */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`hero-${index}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative h-52 flex items-center justify-center overflow-hidden"
            style={{ background: slide.gradient }}
          >
            {/* Particles */}
            {PARTICLES[index].map((p, i) => <Particle key={i} {...p} />)}

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(-30%, 30%)' }} />

            {/* Animated Icon */}
            <motion.div
              key={`icon-${index}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
              className="relative z-10"
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${slide.accent}80, transparent)`,
                  filter: 'blur(20px)',
                  transform: 'scale(2.2)',
                }}
                animate={{ scale: [2.0, 2.6, 2.0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              />
              {/* Floating bob */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="relative z-10 bg-white/20 backdrop-blur-sm p-5 rounded-[28px] shadow-2xl"
                style={{ border: '2px solid rgba(255,255,255,0.3)' }}
              >
                <slide.Icon size={52} color="white" strokeWidth={2} />
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Text content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${index}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
            className="px-8 pt-7 pb-8 text-center space-y-5"
          >
            {/* Title */}
            <h3 className="font-black text-white italic tracking-tighter leading-none"
              style={{ fontSize: 30, textShadow: `0 0 30px ${slide.accent}60` }}>
              {slide.title}
            </h3>

            {/* Description */}
            <p className="text-slate-300 text-base font-medium leading-relaxed">
              {slide.text}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {slide.features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: `${slide.accent}18`,
                    border: `1px solid ${slide.accent}40`,
                    color: slide.accent,
                  }}
                >
                  {f}
                </motion.div>
              ))}
            </div>

            {/* Dot pagination */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}>
                  <motion.div
                    animate={{
                      width: i === index ? 28 : 8,
                      opacity: i === index ? 1 : 0.35,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="h-2 rounded-full bg-white"
                  />
                </button>
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={nextSlide}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-base flex items-center justify-center gap-2 transition-all"
              style={
                isLast
                  ? { background: slide.gradient, color: 'white', boxShadow: `0 8px 24px ${slide.accent}50` }
                  : { background: 'white', color: '#0f0b1e' }
              }
            >
              {isLast ? '🚀 Commencer l\'aventure !' : (
                <>
                  {t('tutorial.next') || 'SUIVANT'}
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}