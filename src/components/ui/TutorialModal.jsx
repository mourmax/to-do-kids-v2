import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/* ─────────────────────────────────────────────────────────────
   Keyframes injected once
───────────────────────────────────────────────────────────── */
const STYLE = `
@keyframes tm-float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
@keyframes tm-spin    { to{transform:rotate(360deg)} }
@keyframes tm-pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.18)} }
@keyframes tm-sparkle { 0%{transform:scale(0) rotate(0deg);opacity:1} 60%{opacity:1} 100%{transform:scale(1.4) rotate(200deg);opacity:0} }
@keyframes tm-fall    { 0%{transform:translateY(-30px) rotate(0deg);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translateY(260px) rotate(360deg);opacity:0} }
@keyframes tm-bar     { from{width:0} to{width:60%} }
@keyframes tm-glow    { 0%,100%{box-shadow:0 0 18px 4px rgba(255,255,255,.35)} 50%{box-shadow:0 0 48px 16px rgba(255,255,255,.7)} }
@keyframes tm-crown   { 0%,100%{filter:drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 18px #f59e0b)} 50%{filter:drop-shadow(0 0 24px #fde68a) drop-shadow(0 0 48px #f59e0b)} }
@keyframes tm-confetti{ 0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1} 100%{transform:translateY(260px) rotate(720deg) scale(.4);opacity:0} }
@keyframes tm-trophy  { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.12) rotate(3deg)} }
@keyframes tm-ray     { from{transform:scale(0) rotate(0deg);opacity:.8} to{transform:scale(2.8) rotate(60deg);opacity:0} }
@keyframes tm-star    { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.3)} }
`

/* ─────────────────────────────────────────────────────────────
   SCREEN 1 — MES MISSIONS  (teal / vert, jauge)
───────────────────────────────────────────────────────────── */
function HeroMissions() {
  const stars = [
    { x: '12%', y: '18%', s: 18, c: '#facc15', d: .1 }, { x: '78%', y: '12%', s: 14, c: '#fff', d: .5 },
    { x: '88%', y: '60%', s: 20, c: '#facc15', d: .9 }, { x: '10%', y: '70%', s: 16, c: '#fff', d: .3 },
    { x: '50%', y: '8%', s: 12, c: '#facc15', d: .7 }, { x: '90%', y: '30%', s: 10, c: '#a7f3d0', d: .4 },
    { x: '30%', y: '78%', s: 14, c: '#6ee7b7', d: .6 }, { x: '68%', y: '72%', s: 18, c: '#fff', d: .2 },
  ]
  return (
    <div style={{ position: 'relative', height: 210, background: 'linear-gradient(135deg,#047857 0%,#10b981 55%,#06b6d4 100%)', overflow: 'hidden' }}>
      {/* floating sparkle stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.s, height: s.s, color: s.c,
          fontSize: s.s, lineHeight: 1,
          animation: `tm-sparkle 2.4s ease-in-out infinite`,
          animationDelay: `${s.d}s`, pointerEvents: 'none',
        }}>★</div>
      ))}
      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,.18) 0%, transparent 70%)' }} />
      {/* 3D checkbox */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-54%)',
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(145deg,#22c55e,#15803d)',
          boxShadow: '0 8px 32px rgba(0,0,0,.3), inset 0 2px 6px rgba(255,255,255,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 46,
        }}
      >
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.4))' }}>✓</span>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 2 — POUR L'ENFANT  (vert/cyan, pluie de checks)
───────────────────────────────────────────────────────────── */
function HeroChild() {
  const checks = [
    { x: '8%', delay: 0, dur: 3.1 }, { x: '22%', delay: .8, dur: 2.7 }, { x: '38%', delay: 1.5, dur: 3.4 },
    { x: '55%', delay: .3, dur: 2.9 }, { x: '70%', delay: 1.1, dur: 3.2 }, { x: '85%', delay: .6, dur: 2.6 },
    { x: '15%', delay: 2.0, dur: 3.0 }, { x: '65%', delay: 1.8, dur: 2.8 }, { x: '90%', delay: .9, dur: 3.3 },
  ]
  return (
    <div style={{ position: 'relative', height: 210, background: 'linear-gradient(135deg,#059669 0%,#10b981 50%,#06b6d4 100%)', overflow: 'hidden' }}>
      {/* Rain of checkmarks */}
      {checks.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: -30,
          fontSize: 26, animation: `tm-fall ${c.dur}s linear infinite`,
          animationDelay: `${c.delay}s`, pointerEvents: 'none',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,.2)',
            border: '2px solid rgba(255,255,255,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 900,
          }}>✓</div>
        </div>
      ))}
      {/* Central glowing circle */}
      <motion.div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-54%)',
          width: 88, height: 88, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,.9)',
          background: 'rgba(255,255,255,.12)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'tm-glow 2.2s ease-in-out infinite',
        }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        <span style={{ fontSize: 50, color: '#fff', fontWeight: 900, lineHeight: 1 }}>✓</span>
      </motion.div>
      {/* sparkle corners */}
      {[{ x: '8%', y: '10%' }, { x: '85%', y: '8%' }, { x: '6%', y: '80%' }, { x: '88%', y: '78%' }, { x: '48%', y: '6%' }].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          color: 'rgba(255,255,255,.8)', fontSize: 18,
          animation: `tm-star 1.8s ease-in-out infinite`, animationDelay: `${i * .35}s`,
        }}>✦</div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 3 — POUR LE PARENT  (orange/amber, couronne + shield)
───────────────────────────────────────────────────────────── */
function HeroParent() {
  const stars = [
    { x: '10%', y: '15%' }, { x: '80%', y: '10%' }, { x: '90%', y: '55%' },
    { x: '8%', y: '65%' }, { x: '45%', y: '7%' }, { x: '85%', y: '75%' },
    { x: '25%', y: '80%' }, { x: '60%', y: '78%' },
  ]
  return (
    <div style={{
      position: 'relative', height: 210,
      background: 'linear-gradient(135deg,#92400e 0%,#d97706 50%,#f59e0b 100%)',
      overflow: 'hidden',
    }}>
      {/* Swirl radial */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.2) 0%, transparent 65%)'
      }} />
      {/* Constellation dots */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.7)',
          animation: `tm-star 2s ease-in-out infinite`, animationDelay: `${i * .3}s`,
        }} />
      ))}
      {/* Rotating ray */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 120, height: 120, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, rgba(253,230,138,.4), transparent, rgba(253,230,138,.4))',
        transform: 'translate(-50%,-50%)',
        animation: 'tm-spin 8s linear infinite',
      }} />
      {/* Crown + Shield emoji */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-60%)',
          textAlign: 'center', lineHeight: 1,
          animation: 'tm-crown 2.6s ease-in-out infinite',
        }}
      >
        <div style={{ fontSize: 20, marginBottom: -4, textAlign: 'center' }}>👑</div>
        <div style={{ fontSize: 64 }}>🛡️</div>
      </motion.div>
      {/* sparkle dots */}
      {[{ x: '20%', y: '20%' }, { x: '75%', y: '22%' }, { x: '82%', y: '68%' }, { x: '18%', y: '72%' }].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          color: '#fde68a', fontSize: 20,
          animation: `tm-sparkle 2s ease-in-out infinite`, animationDelay: `${i * .5}s`,
        }}>✦</div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 4 — C'EST PARTI  (violet/rose, trophée + confettis)
───────────────────────────────────────────────────────────── */
function HeroReady() {
  const confetti = [
    { x: '12%', c: '#f97316', delay: 0, dur: 1.8 }, { x: '25%', c: '#facc15', delay: .3, dur: 2.1 },
    { x: '38%', c: '#ec4899', delay: .6, dur: 1.9 }, { x: '52%', c: '#a78bfa', delay: .1, dur: 2.3 },
    { x: '63%', c: '#34d399', delay: .8, dur: 1.7 }, { x: '75%', c: '#f97316', delay: .4, dur: 2.0 },
    { x: '85%', c: '#facc15', delay: .9, dur: 1.6 }, { x: '18%', c: '#ec4899', delay: 1.2, dur: 2.2 },
    { x: '90%', c: '#a78bfa', delay: .5, dur: 1.8 }, { x: '45%', c: '#fff', delay: 1.0, dur: 2.4 },
    { x: '70%', c: '#34d399', delay: .2, dur: 1.9 }, { x: '5%', c: '#facc15', delay: .7, dur: 2.1 },
  ]
  return (
    <div style={{
      position: 'relative', height: 210,
      background: 'linear-gradient(135deg,#581c87 0%,#7c3aed 45%,#db2777 100%)',
      overflow: 'hidden',
    }}>
      {/* Rays */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 160, height: 160,
        background: 'conic-gradient(from 0deg, rgba(253,230,138,.3), transparent 30%, rgba(253,230,138,.2) 60%, transparent)',
        borderRadius: '50%', transform: 'translate(-50%,-50%)',
        animation: 'tm-spin 4s linear infinite',
      }} />
      {/* Confetti rain */}
      {confetti.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: -16,
          width: 10, height: 10, borderRadius: i % 3 === 0 ? '50%' : 2,
          background: c.c,
          animation: `tm-confetti ${c.dur}s linear infinite`,
          animationDelay: `${c.delay}s`,
        }} />
      ))}
      {/* Golden Trophy */}
      <motion.div
        animate={{ rotate: [-4, 4, -4], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-54%)',
          fontSize: 72,
          filter: 'drop-shadow(0 0 24px #fbbf24) drop-shadow(0 4px 12px rgba(0,0,0,.5))',
        }}
      >🏆</motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Bottom content per slide
───────────────────────────────────────────────────────────── */
function MissionsContent() {
  return (
    <div>
      <h3 style={{ fontSize: 26, fontWeight: 900, fontStyle: 'italic', color: '#111', margin: '0 0 8px', textAlign: 'center', letterSpacing: -.5 }}>
        MES MISSIONS
      </h3>
      <p style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 1.6, margin: '0 0 16px' }}>
        Coche chaque mission et regarde ta barre de progression se remplir vers ta récompense ! 🏆
      </p>
      {/* Animated progress bar */}
      <div style={{ margin: '0 8px' }}>
        <div style={{ height: 12, borderRadius: 8, background: '#e5e7eb', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', borderRadius: 8, width: '60%',
            background: 'linear-gradient(90deg,#10b981,#06b6d4)',
            animation: 'tm-bar 1.2s ease-out both',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
          <span>0%</span>
          <span style={{ color: '#10b981', fontWeight: 800 }}>60% ⭐</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Slides definition
───────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    key: 'missions',
    Hero: HeroMissions,
    Content: MissionsContent,
    btnColor: '#7c3aed',
    isLast: false,
  },
  {
    key: 'child',
    Hero: HeroChild,
    title: "POUR L'ENFANT",
    text: "Coche tes missions, regarde ton score monter et gagne ta récompense !",
    btnColor: '#10b981',
    isLast: false,
  },
  {
    key: 'parent',
    Hero: HeroParent,
    title: "POUR LE PARENT",
    text: "Définissez les missions, validez les journées et regardez vos enfants progresser avec fierté !",
    btnColor: '#d97706',
    isLast: false,
    darkBg: true,
  },
  {
    key: 'go',
    Hero: HeroReady,
    title: "C'EST PARTI ! 🏆",
    text: "Votre famille est prête. Configurez votre premier défi maintenant !",
    btnGradient: 'linear-gradient(135deg,#7c3aed,#db2777)',
    isLast: true,
    darkBg: true,
  },
]

/* ─────────────────────────────────────────────────────────────
   Main Modal
───────────────────────────────────────────────────────────── */
export default function TutorialModal({ onClose }) {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const next = () => {
    if (!isLast) { setDir(1); setIdx(i => i + 1) }
    else onClose()
  }
  const goTo = (i) => { setDir(i > idx ? 1 : -1); setIdx(i) }

  const variants = {
    enter: d => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: .94 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: d => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: .94 }),
  }

  const isDark = slide.darkBg

  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(5,3,18,.88)',
        backdropFilter: 'blur(16px)',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: .86, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            width: '100%', maxWidth: 360,
            borderRadius: 36, overflow: 'hidden',
            background: isDark ? '#0f0b1e' : '#fff',
            boxShadow: '0 32px 80px rgba(0,0,0,.55)',
            border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(0,0,0,.06)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            background: 'rgba(0,0,0,.25)', border: 'none', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,.8)',
          }}>
            <X size={18} />
          </button>

          {/* Hero panel */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`hero-${idx}`}
              custom={dir}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            >
              <slide.Hero />
            </motion.div>
          </AnimatePresence>

          {/* Text content */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`content-${idx}`}
              custom={dir}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: .04 }}
              style={{ padding: '20px 24px 24px' }}
            >
              {/* Custom content or standard title+text */}
              {slide.Content ? (
                <slide.Content />
              ) : (
                <>
                  <h3 style={{
                    fontSize: 26, fontWeight: 900, fontStyle: 'italic',
                    color: isDark ? '#fff' : '#111',
                    margin: '0 0 8px', textAlign: 'center', letterSpacing: -.5,
                    textShadow: isDark ? '0 2px 12px rgba(0,0,0,.5)' : 'none',
                  }}>{slide.title}</h3>
                  <p style={{
                    fontSize: 14, textAlign: 'center', lineHeight: 1.65,
                    color: isDark ? 'rgba(255,255,255,.65)' : '#4b5563',
                    margin: '0 0 16px',
                  }}>{slide.text}</p>
                </>
              )}

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '14px 0' }}>
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <motion.div
                      animate={{ width: i === idx ? 28 : 8, opacity: i === idx ? 1 : .3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                      style={{ height: 8, borderRadius: 4, background: isDark ? '#fff' : '#374151' }}
                    />
                  </button>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: .95 }}
                onClick={next}
                style={{
                  width: '100%', padding: '15px', borderRadius: 16,
                  border: 'none', cursor: 'pointer',
                  fontWeight: 900, fontSize: 15, letterSpacing: .8,
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: slide.btnGradient || slide.btnColor || '#7c3aed',
                  boxShadow: `0 6px 24px ${slide.btnColor ? slide.btnColor + '55' : 'rgba(124,58,237,.45)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isLast ? 'Commencer !' : 'Suivant →'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}