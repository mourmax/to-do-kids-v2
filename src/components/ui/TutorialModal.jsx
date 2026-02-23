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
@keyframes tm-heart   { 0%{transform:translateY(0)scale(0);opacity:0}15%{opacity:1;transform:scale(1.2)}80%{opacity:.6}100%{transform:translateY(-60px)scale(.5);opacity:0} }
@keyframes tm-wave    { 0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)} }
@keyframes tm-cloud   { 0%{transform:translateX(0)}50%{transform:translateX(8px)}100%{transform:translateX(0)} }
@keyframes tm-smoke   { 0%{transform:translateY(0)scale(1);opacity:.7}100%{transform:translateY(-50px)scale(2.5);opacity:0} }
@keyframes tm-liftoff { 0%{transform:translateX(-50%) translateY(0)}30%{transform:translateX(-50%) translateY(-4px)}60%{transform:translateX(-50%) translateY(-80px)}80%{transform:translateX(-50%) translateY(-160px);opacity:0.6}100%{transform:translateX(-50%) translateY(-220px);opacity:0} }
@keyframes tm-star-streak { 0%{transform:translateX(0) translateY(0);opacity:1}100%{transform:translateX(-80px) translateY(40px);opacity:0} }
@keyframes tm-bubble  { 0%{opacity:0;transform:scale(0) translateY(0)}20%{opacity:.9;transform:scale(1)}80%{opacity:.7}100%{opacity:0;transform:scale(.6) translateY(-40px)} }
@keyframes tm-zen-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(110,231,183,.3)} 50%{box-shadow:0 0 0 14px rgba(110,231,183,.0)} }
`

/* ═══════════════════════════════════════════════════════════
   HERO 1 — BIENVENUE : La Maison Magique (Concept A)
   Ciel nocturne, maison lumière, 4 étoiles orbitent — aucun stéréotype
═══════════════════════════════════════════════════════════ */
function HeroBienvenue() {
  // 4 étoiles = 4 membres de la famille, sans genre ni âge imposés
  const familyStars = [
    { label: 'A', color: '#fde68a', size: 28, orbitR: 72, angle: -30, dur: 8 },
    { label: 'B', color: '#93c5fd', size: 22, orbitR: 72, angle: 60, dur: 10 },
    { label: 'C', color: '#f9a8d4', size: 20, orbitR: 72, angle: 160, dur: 9 },
    { label: 'D', color: '#86efac', size: 18, orbitR: 72, angle: 240, dur: 11 },
  ]
  // Petites étoiles fixées dans le ciel
  const bgStars = [
    { x: '6%', y: '8%', s: 12 }, { x: '82%', y: '6%', s: 10 },
    { x: '15%', y: '22%', s: 8 }, { x: '70%', y: '18%', s: 14 },
    { x: '90%', y: '40%', s: 10 }, { x: '5%', y: '55%', s: 8 },
    { x: '88%', y: '62%', s: 12 }, { x: '38%', y: '10%', s: 8 },
    { x: '55%', y: '5%', s: 6 },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(180deg,#0b0f2e 0%,#1e1b4b 45%,#312e81 75%,#3730a3 100%)',
      overflow: 'hidden',
    }}>
      {/* Lune */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 12, right: 20,
          fontSize: 30,
          filter: 'drop-shadow(0 0 14px rgba(253,230,138,.7))',
        }}
      >🌙</motion.div>

      {/* Étoiles de fond fixes */}
      {bgStars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          color: '#fff', fontSize: s.s, opacity: .6,
          animation: `tm-twinkle ${2 + i * .3}s ease-in-out infinite`,
          animationDelay: `${i * .4}s`,
        }}>★</div>
      ))}

      {/* Sol / horizon */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
        background: 'linear-gradient(0deg,#1c1917 0%,#292524 100%)',
      }} />

      {/* Maison centrale */}
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 14px rgba(251,191,36,.5))',
            'drop-shadow(0 0 28px rgba(251,191,36,.9))',
            'drop-shadow(0 0 14px rgba(251,191,36,.5))',
          ]
        }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: 30, left: '50%',
          x: '-50%',
          fontSize: 64, lineHeight: 1,
        }}
      >🧸
        {/* Faux toit + fenêtres lumineuses */}
        <div style={{
          position: 'absolute', inset: 0,
          fontSize: 64, textAlign: 'center',
        }}>🏠</div>
      </motion.div>

      {/* 4 étoiles-famille qui orbitent lentement autour de la maison */}
      {familyStars.map((s, i) => (
        <motion.div
          key={s.label}
          animate={{ rotate: [s.angle, s.angle + 360] }}
          transition={{ repeat: Infinity, duration: s.dur, ease: 'linear' }}
          style={{
            position: 'absolute',
            // Centre de l'orbite = centre de la maison
            bottom: 55, left: '50%',
            width: s.orbitR * 2, height: s.orbitR * 2,
            marginLeft: -s.orbitR, marginBottom: -s.orbitR,
            borderRadius: '50%',
            // L'étoile est placée sur le bord du cercle d'orbite
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: '50%',
            transform: `translateX(-50%) translateY(-${s.orbitR}px)`,
            fontSize: s.size,
            filter: `drop-shadow(0 0 8px ${s.color})`,
          }}>⭐</div>
        </motion.div>
      ))}
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
   HERO 3 — POUR LE PARENT : zen & contrôle, fini les répétitions
═══════════════════════════════════════════════════════════ */
function HeroParent() {
  // Bulles d'actions qui disparaissent ("plus besoin de répéter")
  const noBubbles = [
    { emoji: '🔄', label: 'Répéter', x: '8%', y: '14%', delay: 0, dur: 3.2 },
    { emoji: '📢', label: 'Rappeler', x: '64%', y: '10%', delay: 1.1, dur: 2.8 },
    { emoji: '⏰', label: 'Relancer', x: '82%', y: '55%', delay: 0.5, dur: 3.5 },
    { emoji: '😩', label: 'Stresser', x: '5%', y: '60%', delay: 1.6, dur: 2.6 },
  ]
  // Check items flottants (missions validées en un clic)
  const checks = [
    { x: '20%', y: '22%', delay: 0.2 },
    { x: '75%', y: '28%', delay: 0.9 },
    { x: '14%', y: '74%', delay: 1.4 },
    { x: '80%', y: '72%', delay: 0.5 },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(135deg,#0f4c75 0%,#1a6fa8 40%,#0d9488 75%,#34d399 100%)',
      overflow: 'hidden',
    }}>
      {/* Lueur zen centrale */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(110,231,183,.25) 0%, transparent 65%)'
      }} />

      {/* Bulles "à éliminer" — s'estompent et disparaissent */}
      {noBubbles.map((b, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [1, 0.35, 1], y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: b.dur, delay: b.delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: b.x, top: b.y,
            background: 'rgba(255,255,255,.12)',
            backdropFilter: 'blur(6px)',
            border: '1.5px solid rgba(255,255,255,.2)',
            borderRadius: 12,
            padding: '4px 9px',
            fontSize: 13,
            color: 'rgba(255,255,255,.85)',
            display: 'flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {/* Barre rouge de barrage */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: '110%', height: 2.5, background: '#f87171',
              left: '-5%', position: 'absolute',
              borderRadius: 2, opacity: .9,
            }} />
          </div>
          <span>{b.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 700 }}>{b.label}</span>
        </motion.div>
      ))}

      {/* Carrés checks (missions validées) */}
      {checks.map((c, i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.8, 1.05, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 + i * 0.4, delay: c.delay }}
          style={{
            position: 'absolute', left: c.x, top: c.y,
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(255,255,255,.15)',
            border: '2px solid rgba(110,231,183,.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6ee7b7', fontSize: 14, fontWeight: 900,
          }}
        >✓</motion.div>
      ))}

      {/* Élément central : tlphone + parent zen */}
      <motion.div
        animate={{ y: ['-52%', '-48%', '-52%'] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          x: '-50%',
          textAlign: 'center',
        }}
      >
        {/* Halo zen animé — grand personnage zen au centre, pas de picto calculette */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(110,231,183,.15)',
            border: '2.5px solid rgba(110,231,183,.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <span style={{ fontSize: 62, lineHeight: 1 }}>🧘</span>
        </motion.div>
      </motion.div>
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
   HERO 5 — C'EST PARTI : fusée qui décolle + traînée de feu
═══════════════════════════════════════════════════════════ */
function HeroGo() {
  const stars = [
    { x: '8%', y: '12%', d: 0.0, dur: 1.8 }, { x: '78%', y: '8%', d: 0.4, dur: 2.1 },
    { x: '90%', y: '38%', d: 0.7, dur: 1.6 }, { x: '5%', y: '50%', d: 0.2, dur: 2.0 },
    { x: '60%', y: '18%', d: 1.0, dur: 1.7 }, { x: '30%', y: '7%', d: 0.5, dur: 1.9 },
    { x: '15%', y: '30%', d: 1.3, dur: 2.2 }, { x: '85%', y: '60%', d: 0.9, dur: 1.5 },
  ]
  // Particules de fumée/feu qui sortent du bas de la fusée
  const smokeParticles = [
    { x: '50%', delay: 0, dur: 1.2, size: 18, color: 'rgba(251,146,60,.8)' },
    { x: '48%', delay: 0.2, dur: 1.0, size: 14, color: 'rgba(252,211,77,.7)' },
    { x: '52%', delay: 0.4, dur: 1.3, size: 16, color: 'rgba(220,38,38,.6)' },
    { x: '49%', delay: 0.6, dur: 1.1, size: 22, color: 'rgba(120,113,108,.4)' },
    { x: '51%', delay: 0.1, dur: 0.9, size: 12, color: 'rgba(251,191,36,.9)' },
  ]
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(180deg,#020617 0%,#0f172a 40%,#1e1b4b 70%,#312e81 100%)',
      overflow: 'hidden',
    }}>
      {/* Étoiles qui filent vers l'arrière (sensation de vitesse) */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, -40],
            y: [0, 20],
            opacity: [0.9, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: s.dur,
            delay: s.d,
            ease: 'linear',
          }}
          style={{
            position: 'absolute', left: s.x, top: s.y,
            color: '#fff', fontSize: 12 + i % 3 * 4,
          }}
        >★</motion.div>
      ))}

      {/* Rampe de lancement */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 60, height: 18,
        background: 'linear-gradient(0deg,#475569,#64748b)',
        borderRadius: '8px 8px 0 0',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 100, height: 8,
        background: '#334155',
        borderRadius: 4,
      }} />

      {/* Fumée / Feu de propulsion */}
      {smokeParticles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [36, 80],
            scale: [0.3, 2.2],
            opacity: [0.9, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: p.dur,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            left: p.x, bottom: 18,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            x: `-${p.size / 2}px`,
          }}
        />
      ))}

      {/* FUSE qui décolle — animation de levée */}
      <motion.div
        animate={{
          y: [0, -8, -170],
          opacity: [1, 1, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          times: [0, 0.25, 1],
          ease: ['easeIn', 'easeIn'],
          repeatDelay: 0.8,
        }}
        style={{
          position: 'absolute',
          bottom: 18, left: '50%',
          x: '-50%',
          fontSize: 64,
          // rotate(-45deg) corrige l'orientation diagonale de l'émoji 🚀
          // qui par défaut pointe vers l'upper-right — on le force vers le haut
          rotate: '-45deg',
          filter: 'drop-shadow(0 0 20px rgba(251,146,60,.9)) drop-shadow(0 0 40px rgba(252,211,77,.6))',
          lineHeight: 1,
        }}
      >🚀</motion.div>

      {/* Lueur de launchpad qui pulse au moment du décollage */}
      <motion.div
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.6, 0.5] }}
        transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: 10, left: '50%',
          x: '-50%',
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,.8) 0%, transparent 70%)',
        }}
      />
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