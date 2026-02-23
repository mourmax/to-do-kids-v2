import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/* ─────────────────────────────────────────────────────────
   Keyframes CSS (injectées une seule fois)
───────────────────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes tm-float   { 0%,100%{transform:translateY(0)rotate(-3deg)}50%{transform:translateY(-14px)rotate(3deg)} }
@keyframes tm-twinkle { 0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)} }
@keyframes tm-spin    { to{transform:rotate(360deg)} }
@keyframes tm-sparkle { 0%{transform:scale(0)rotate(0deg);opacity:1}60%{opacity:1}100%{transform:scale(1.6)rotate(240deg);opacity:0} }
@keyframes tm-fall    { 0%{transform:translateY(-40px)rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(280px)rotate(360deg);opacity:0} }
@keyframes tm-bar     { from{width:0}to{width:60%} }
@keyframes tm-glow-ring { 0%,100%{box-shadow:0 0 20px 6px rgba(255,255,255,.4),0 0 0 0 rgba(255,255,255,.1)} 50%{box-shadow:0 0 48px 18px rgba(255,255,255,.7),0 0 80px 30px rgba(255,255,255,.08)} }
@keyframes tm-trophy  { 0%,100%{transform:scale(1)rotate(-4deg)drop-shadow(0 0 18px #fbbf24)} 50%{transform:scale(1.12)rotate(4deg)drop-shadow(0 0 40px #fbbf24)} }
@keyframes tm-confetti{ 0%{transform:translateY(0)rotate(0deg);opacity:1}100%{transform:translateY(280px)rotate(540deg);opacity:0} }
@keyframes tm-ray     { from{transform:scale(.1)rotate(0deg);opacity:.7}to{transform:scale(3)rotate(60deg);opacity:0} }
@keyframes tm-gift    { 0%,100%{transform:scale(1)rotate(-2deg)}50%{transform:scale(1.1)rotate(2deg)} }
@keyframes tm-star-burst { 0%{transform:scale(0)rotate(0deg);opacity:1}100%{transform:scale(2.5)rotate(360deg);opacity:0} }
@keyframes tm-rocket-fire { 0%,100%{transform:scaleY(1);opacity:.8}50%{transform:scaleY(1.5);opacity:1} }
`

/* ═══════════════════════════════════════════════════════════
   HERO 1 — BIENVENUE : violet/bleu, fusée, étoiles
═══════════════════════════════════════════════════════════ */
function HeroBienvenue() {
  const starData = [
    { x: '8%', y: '12%', s: 20, d: .1 }, { x: '88%', y: '8%', s: 16, d: .5 }, { x: '75%', y: '35%', s: 12, d: .9 },
    { x: '15%', y: '55%', s: 14, d: .3 }, { x: '92%', y: '60%', s: 18, d: .7 }, { x: '45%', y: '8%', s: 10, d: .4 },
    { x: '28%', y: '75%', s: 16, d: .6 }, { x: '68%', y: '70%', s: 12, d: .2 }, { x: '5%', y: '85%', s: 8, d: .8 },
    { x: '85%', y: '82%', s: 14, d: 1.0 }, { x: '52%', y: '78%', s: 10, d: .15 }, { x: '38%', y: '20%', s: 8, d: .55 },
  ]
  const dotData = [
    { x: '20%', y: '30%' }, { x: '65%', y: '15%' }, { x: '35%', y: '60%' },
    { x: '80%', y: '45%' }, { x: '12%', y: '40%' }, { x: '55%', y: '55%' },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(160deg,#2e1065 0%,#4c1d95 45%,#6d28d9 70%,#818cf8 100%)',
      overflow: 'hidden',
    }}>
      {/* Lumière radiale centrale */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(167,139,250,.35) 0%, transparent 65%)'
      }} />

      {/* Étoiles ★ animées */}
      {starData.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          fontSize: s.s, color: '#fff', lineHeight: 1,
          animation: `tm-twinkle ${1.5 + Math.random()}s ease-in-out infinite`,
          animationDelay: `${s.d}s`, pointerEvents: 'none',
        }}>★</div>
      ))}

      {/* Petits points lumineux */}
      {dotData.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.x, top: d.y,
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(255,255,255,.6)',
          animation: `tm-twinkle ${2 + i * .3}s ease-in-out infinite`,
          animationDelay: `${i * .4}s`,
        }} />
      ))}

      {/* Fusée */}
      <motion.div
        animate={{
          y: ['-52%', '-48%', '-52%'],
          x: ['-51%', '-49%', '-51%']
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          fontSize: 80,
          filter: 'drop-shadow(0 0 28px rgba(167,139,250,.9)) drop-shadow(0 8px 20px rgba(0,0,0,.4))',
        }}
      >🚀</motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO 2 — POUR L'ENFANT : vert/cyan, pluie de checks
═══════════════════════════════════════════════════════════ */
function HeroChild() {
  const checks = [
    { x: '6%', d: 0, dur: 3.0 }, { x: '18%', d: .7, dur: 2.6 }, { x: '32%', d: 1.4, dur: 3.2 },
    { x: '48%', d: .2, dur: 2.9 }, { x: '62%', d: 1.0, dur: 3.1 }, { x: '76%', d: .5, dur: 2.7 },
    { x: '88%', d: 1.8, dur: 3.3 }, { x: '94%', d: .9, dur: 2.5 }, { x: '25%', d: 2.1, dur: 3.0 },
    { x: '70%', d: 1.6, dur: 2.8 },
  ]
  const sparklePos = [
    { x: '8%', y: '8%' }, { x: '88%', y: '10%' }, { x: '6%', y: '75%' }, { x: '90%', y: '73%' },
    { x: '48%', y: '5%' }, { x: '30%', y: '80%' }, { x: '72%', y: '78%' },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(135deg,#047857 0%,#10b981 50%,#06b6d4 100%)',
      overflow: 'hidden',
    }}>
      {/* Pluie de checkboxes */}
      {checks.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: -40,
          animation: `tm-fall ${c.dur}s linear infinite`,
          animationDelay: `${c.d}s`, pointerEvents: 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.15))',
            border: '2px solid rgba(255,255,255,.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 900,
          }}>✓</div>
        </div>
      ))}

      {/* Cercle lumineux central */}
      <motion.div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(255,255,255,.13)',
          backdropFilter: 'blur(8px)',
          border: '3.5px solid rgba(255,255,255,.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          x: '-50%', y: '-50%',
          animation: 'tm-glow-ring 2.4s ease-in-out infinite',
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      >
        <span style={{
          fontSize: 52, color: '#fff', fontWeight: 900, lineHeight: 1,
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.3))'
        }}>✓</span>
      </motion.div>

      {/* Sparkles ✦ */}
      {sparklePos.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          color: 'rgba(255,255,255,.85)', fontSize: 16 + i % 3 * 4,
          animation: `tm-sparkle ${1.8 + i * .3}s ease-in-out infinite`,
          animationDelay: `${i * .45}s`,
        }}>✦</div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO 3 — POUR LE PARENT : amber/orange, couronne + shield
═══════════════════════════════════════════════════════════ */
function HeroParent() {
  const sparkles = [
    { x: '14%', y: '18%', s: 22 }, { x: '80%', y: '12%', s: 18 }, { x: '88%', y: '65%', s: 20 },
    { x: '10%', y: '68%', s: 16 }, { x: '50%', y: '6%', s: 14 }, { x: '26%', y: '80%', s: 12 },
    { x: '72%', y: '76%', s: 18 },
  ]
  const constellations = [
    { x: '8%', y: '22%' }, { x: '90%', y: '20%' }, { x: '85%', y: '75%' },
    { x: '6%', y: '80%' }, { x: '48%', y: '88%' },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(135deg,#78350f 0%,#b45309 30%,#d97706 60%,#fbbf24 100%)',
      overflow: 'hidden',
    }}>
      {/* Swirl radial */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.22) 0%, transparent 60%)'
      }} />

      {/* Spirale tournante */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 140, height: 140, borderRadius: '50%',
        transform: 'translate(-50%,-50%) rotate(0deg)',
        background: 'conic-gradient(from 0deg, rgba(253,230,138,.5), transparent 25%, rgba(253,230,138,.4) 50%, transparent 75%)',
        animation: 'tm-spin 6s linear infinite',
      }} />

      {/* Couronne + Shield */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], y: ['-52%', '-48%', '-52%'] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          x: '-50%',
          textAlign: 'center', lineHeight: .9,
        }}
      >
        <div style={{
          fontSize: 28, marginBottom: 2,
          filter: 'drop-shadow(0 0 12px rgba(251,191,36,.9))',
        }}>👑</div>
        <div style={{
          fontSize: 68,
          filter: 'drop-shadow(0 0 24px rgba(251,191,36,.8)) drop-shadow(0 6px 14px rgba(0,0,0,.4))',
        }}>🛡️</div>
      </motion.div>

      {/* Sparkles dorés */}
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          color: '#fde68a', fontSize: s.s,
          animation: `tm-sparkle ${2 + i * .4}s ease-in-out infinite`,
          animationDelay: `${i * .5}s`,
        }}>✦</div>
      ))}

      {/* Constellation dots */}
      {constellations.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: c.y,
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(255,255,255,.7)',
          animation: `tm-twinkle ${2.2 + i * .3}s ease-in-out infinite`,
          animationDelay: `${i * .35}s`,
        }} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO 4 — LA RÉCOMPENSE : doré/violet, cadeau explosif
═══════════════════════════════════════════════════════════ */
function HeroReward() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  const starBursts = [
    { x: '15%', y: '15%', d: .2 }, { x: '80%', y: '10%', d: .7 }, { x: '90%', y: '65%', d: 1.1 },
    { x: '8%', y: '70%', d: .4 }, { x: '50%', y: '5%', d: .9 }, { x: '30%', y: '80%', d: .1 },
    { x: '70%', y: '78%', d: .6 },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(135deg,#3b0764 0%,#6d28d9 45%,#c026d3 80%,#fbbf24 100%)',
      overflow: 'hidden',
    }}>
      {/* Rayons solaires */}
      {rays.map((angle, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 160, height: 2,
          background: 'rgba(251,191,36,.4)',
          transformOrigin: '0 50%',
          transform: `translate(0,-1px) rotate(${angle}deg)`,
          animation: `tm-ray 3s ease-out infinite`,
          animationDelay: `${i * .15}s`,
        }} />
      ))}

      {/* Cadeau / trophée */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          x: '-50%', y: '-50%',
          fontSize: 72,
          filter: 'drop-shadow(0 0 24px rgba(251,191,36,.9)) drop-shadow(0 8px 18px rgba(0,0,0,.4))',
        }}
      >🎁</motion.div>

      {/* Star bursts */}
      {starBursts.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          color: '#fde68a', fontSize: 18 + i % 3 * 4,
          animation: `tm-sparkle 2.2s ease-in-out infinite`,
          animationDelay: `${s.d}s`,
        }}>★</div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO 5 — C'EST PARTI : violet/rose, trophée + confettis
═══════════════════════════════════════════════════════════ */
function HeroGo() {
  const confetti = [
    { x: '5%', c: '#f97316', d: 0, dur: 1.7 }, { x: '16%', c: '#facc15', d: .3, dur: 2.0 },
    { x: '28%', c: '#ec4899', d: .6, dur: 1.8 }, { x: '40%', c: '#a78bfa', d: .1, dur: 2.2 },
    { x: '52%', c: '#34d399', d: .8, dur: 1.6 }, { x: '63%', c: '#f97316', d: .4, dur: 2.1 },
    { x: '74%', c: '#facc15', d: .9, dur: 1.7 }, { x: '84%', c: '#ec4899', d: .2, dur: 1.9 },
    { x: '93%', c: '#60a5fa', d: .5, dur: 2.0 }, { x: '10%', c: '#fff', d: 1.1, dur: 2.3 },
    { x: '45%', c: '#fde68a', d: .7, dur: 1.8 }, { x: '79%', c: '#34d399', d: 1.3, dur: 2.0 },
  ]
  const decoEmoji = ['🎆', '🎇', '🧨', '⭐', '🎉']
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(160deg,#4c1d95 0%,#7c3aed 40%,#db2777 80%,#be185d 100%)',
      overflow: 'hidden',
    }}>
      {/* Socle noir au bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
        background: 'linear-gradient(0deg, rgba(10,5,20,.8) 0%, transparent 100%)',
      }} />

      {/* Rayons lumineux */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 180, height: 180, borderRadius: '50%',
        transform: 'translate(-50%,-50%) rotate(0deg)',
        background: 'conic-gradient(from 0deg, rgba(251,191,36,.35), transparent 20%, rgba(251,191,36,.25) 40%, transparent 60%, rgba(251,191,36,.3) 80%, transparent)',
        animation: 'tm-spin 5s linear infinite',
      }} />

      {/* Confettis */}
      {confetti.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: -16,
          width: i % 4 === 0 ? 12 : 8, height: i % 4 === 0 ? 5 : 10,
          borderRadius: i % 3 === 0 ? '50%' : 2,
          background: c.c,
          animation: `tm-confetti ${c.dur}s linear infinite`,
          animationDelay: `${c.d}s`,
        }} />
      ))}

      {/* Emoji décoratifs éjectés */}
      {decoEmoji.map((e, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + i * 18}%`, top: `${8 + i % 2 * 12}%`,
          fontSize: 20,
          animation: `tm-fall ${2 + i * .4}s ease-in-out infinite`,
          animationDelay: `${i * .6}s`,
        }}>{e}</div>
      ))}

      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          x: '-50%', y: '-50%',
          fontSize: 80,
          filter: 'drop-shadow(0 0 28px rgba(251,191,36,.9)) drop-shadow(0 8px 20px rgba(0,0,0,.5))',
        }}
      >🏆</motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Configuration des 5 slides
═══════════════════════════════════════════════════════════ */
const SLIDES = [
  {
    key: 'bienvenue',
    Hero: HeroBienvenue,
    title: 'BIENVENUE !',
    text: 'Fini les rappels, place à l\'organisation magique pour toute la famille.',
    btnBg: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    btnShadow: 'rgba(109,40,217,.5)',
    dark: true,
  },
  {
    key: 'child',
    Hero: HeroChild,
    title: "POUR L'ENFANT",
    text: 'Coche tes missions, regarde ton score monter et gagne ta récompense !',
    btnBg: '#10b981',
    btnShadow: 'rgba(16,185,129,.4)',
    dark: true,
  },
  {
    key: 'parent',
    Hero: HeroParent,
    title: 'POUR LE PARENT',
    text: 'Définissez les missions, validez les journées et regardez vos enfants progresser avec fierté !',
    btnBg: null, // outlined style amber
    btnBorder: '#d97706',
    btnText: '#d97706',
    btnOutline: true,
    dark: true,
  },
  {
    key: 'reward',
    Hero: HeroReward,
    title: 'LA RÉCOMPENSE',
    text: 'Complète tous tes défis et remporte ta récompense ! Chaque effort compte. 🎁',
    btnBg: 'linear-gradient(135deg,#7c3aed,#c026d3)',
    btnShadow: 'rgba(124,58,237,.45)',
    dark: true,
  },
  {
    key: 'go',
    Hero: HeroGo,
    title: "C'EST PARTI ! 🏆",
    text: 'Votre famille est prête. Configurez votre premier défi maintenant !',
    btnBg: 'linear-gradient(135deg,#7c3aed,#db2777)',
    btnShadow: 'rgba(219,39,119,.45)',
    isLast: true,
    dark: true,
  },
]

/* ═══════════════════════════════════════════════════════════
   TutorialModal principal
═══════════════════════════════════════════════════════════ */
export default function TutorialModal({ onClose }) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const next = useCallback(() => {
    if (!isLast) { setDir(1); setIdx(i => i + 1) }
    else onClose()
  }, [isLast, onClose])

  const goTo = (i) => { setDir(i > idx ? 1 : -1); setIdx(i) }

  const variants = {
    enter: d => ({ x: d > 0 ? 56 : -56, opacity: 0, scale: .93 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: d => ({ x: d > 0 ? -56 : 56, opacity: 0, scale: .93 }),
  }

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(2,1,10,.9)',
        backdropFilter: 'blur(18px)',
      }} onClick={onClose} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: .82, y: 36 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9991,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '100%', maxWidth: 360,
          borderRadius: 38, overflow: 'hidden',
          background: '#0f0b1e',
          boxShadow: '0 40px 100px rgba(0,0,0,.65)',
          border: '1px solid rgba(255,255,255,.07)',
          position: 'relative', pointerEvents: 'all',
        }}>

          {/* Bouton fermer */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer',
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,.75)',
          }}>
            <X size={18} />
          </button>

          {/* Hero animé */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`hero-${idx}`}
              custom={dir}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ position: 'relative', width: '100%' }}
            >
              <slide.Hero />
            </motion.div>
          </AnimatePresence>

          {/* Contenu textuel */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`text-${idx}`}
              custom={dir}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: .05 }}
              style={{ padding: '22px 26px 26px' }}
            >
              <h3 style={{
                fontSize: 26, fontWeight: 900, fontStyle: 'italic',
                color: '#fff', margin: '0 0 10px', textAlign: 'center',
                letterSpacing: -.3,
                textShadow: '0 2px 14px rgba(0,0,0,.4)',
              }}>
                {slide.title}
              </h3>
              <p style={{
                fontSize: 14, textAlign: 'center', lineHeight: 1.7,
                color: 'rgba(255,255,255,.6)',
                margin: '0 0 18px',
              }}>
                {slide.text}
              </p>

              {/* Pagination dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <motion.div
                      animate={{ width: i === idx ? 28 : 8, opacity: i === idx ? 1 : .3 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                      style={{ height: 8, borderRadius: 4, background: '#fff' }}
                    />
                  </button>
                ))}
              </div>

              {/* Bouton CTA */}
              <motion.button
                whileTap={{ scale: .95 }}
                onClick={next}
                style={{
                  width: '100%', padding: '15px 20px',
                  borderRadius: 18, border: slide.btnOutline ? `2.5px solid ${slide.btnBorder}` : 'none',
                  cursor: 'pointer', fontWeight: 900, fontSize: 15,
                  letterSpacing: .8, textTransform: 'uppercase',
                  color: slide.btnOutline ? slide.btnText : '#fff',
                  background: slide.btnOutline ? 'transparent' : (slide.btnBg || '#7c3aed'),
                  boxShadow: slide.btnOutline ? 'none' : `0 8px 28px ${slide.btnShadow || 'rgba(124,58,237,.4)'}`,
                  fontFamily: "'Inter',sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isLast ? 'Commencer ! 🚀' : 'Suivant →'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}