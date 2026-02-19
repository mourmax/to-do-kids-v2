import { useState, useEffect } from "react";

// ── STREAK ANIMATIONS PAR THÈME ──────────────────────────
//
// 🌈 Arc-en-ciel : compteur qui s'incrémente 0→N avec confettis explosifs
// 🚀 Cosmos      : étoiles qui s'allument une par une comme une constellation
// 🏆 Champion    : barre de puissance qui se charge comme dans un jeu vidéo
// ⚡ Ado         : card sombre avec glow pulse (déjà fait, inchangé)

function Particle({ emoji, delay, duration, x, y, size }) {
  return (
    <div className="absolute pointer-events-none select-none"
      style={{ left:`${x}%`, top:`${y}%`, fontSize:`${size}px`,
        animation:`particleFall ${duration}s ease-in ${delay}s infinite`, opacity:0 }}>
      {emoji}
    </div>
  );
}
function ConfettiRain({ particles, count=22 }) {
  const items = Array.from({length:count},(_,i) => ({
    id:i, emoji:particles[i%particles.length],
    delay:Math.random()*2, duration:1.5+Math.random()*2,
    x:Math.random()*100, y:-10+Math.random()*20,
    size:16+Math.floor(Math.random()*24),
  }));
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{items.map(p=><Particle key={p.id} {...p}/>)}</div>;
}

// ── 🌈 RAINBOW STREAK : compteur animé + explosion de confettis ──
function RainbowStreak({ streak }) {
  const [count, setCount] = useState(0);
  const [explode, setExplode] = useState(false);

  useEffect(() => {
    // Compteur qui monte rapidement 0 → streak
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= streak) {
        clearInterval(interval);
        setTimeout(() => setExplode(true), 200);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/20 rounded-2xl px-5 py-4 text-center relative overflow-hidden">
      {explode && (
        <div className="absolute inset-0 pointer-events-none">
          {["⭐","✨","🌟","💫","🎊"].map((e,i) => (
            <div key={i} className="absolute text-2xl"
              style={{
                left:`${15+i*17}%`, top:"50%",
                animation:`starBurst 0.7s ease-out ${i*0.08}s both`,
              }}>{e}</div>
          ))}
        </div>
      )}
      <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">🔥 Série en cours</div>
      <div className="text-white font-black leading-none mb-1"
        style={{ fontSize:"3.5rem", animation: count===streak ? "countLand 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
        {count}
      </div>
      <div className="text-white font-black text-lg">jours de suite !</div>
      <div className="text-white/70 text-sm font-semibold mt-1">Tu es incroyable 🌟</div>
    </div>
  );
}

// ── 🚀 COSMOS STREAK : étoiles constellation qui s'allument une par une ──
function CosmosStreak({ streak }) {
  const [lit, setLit] = useState(0);
  const [allLit, setAllLit] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLit(i);
      if (i >= streak) {
        clearInterval(interval);
        setTimeout(() => setAllLit(true), 300);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  // Positions des étoiles en arc (constellation)
  const stars = Array.from({length: streak}, (_, i) => {
    const angle = (i / (streak - 1)) * Math.PI; // arc de 180°
    return {
      x: 50 + Math.cos(Math.PI - angle) * 38,
      y: 55 - Math.sin(angle) * 30,
    };
  });

  return (
    <div className="bg-indigo-950/80 border border-indigo-700/40 rounded-2xl px-5 py-5 text-center relative overflow-hidden">
      {/* Fond étoilé */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"18px 18px"}}/>

      <div className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">
        🌌 Constellation de ta série
      </div>

      {/* SVG constellation */}
      <div className="relative mx-auto mb-3" style={{width:180, height:80}}>
        <svg width="180" height="80" className="absolute inset-0">
          {/* Lignes entre étoiles allumées */}
          {stars.slice(0, Math.max(0, lit-1)).map((s, i) => (
            <line key={i}
              x1={`${stars[i].x}%`} y1={`${stars[i].y}%`}
              x2={`${stars[i+1].x}%`} y2={`${stars[i+1].y}%`}
              stroke="rgba(99,102,241,0.6)" strokeWidth="1.5"
              style={{animation:`lineDrawIn 0.3s ease ${i*0.28}s both`}}/>
          ))}
        </svg>
        {stars.map((s, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all"
            style={{
              left:`${s.x}%`, top:`${s.y}%`,
              width: i < lit ? 20 : 10,
              height: i < lit ? 20 : 10,
              borderRadius:"50%",
              background: i < lit
                ? allLit ? "radial-gradient(circle, #fbbf24, #f97316)" : "radial-gradient(circle, #e0e7ff, #818cf8)"
                : "rgba(255,255,255,0.1)",
              boxShadow: i < lit ? (allLit ? "0 0 12px #fbbf24" : "0 0 10px #818cf8") : "none",
              animation: i < lit ? `starLight 0.4s ease ${i*0.28}s both` : "none",
              transition:"all 0.3s ease",
            }}/>
        ))}
      </div>

      <div className="text-white font-black text-2xl">{lit === streak ? `${streak} jours` : `${lit} / ${streak}`}</div>
      {allLit && <div className="text-indigo-300 text-sm font-semibold mt-1">Constellation complète ✨</div>}
    </div>
  );
}

// ── 🏆 CHAMPION STREAK : barre power comme un jeu vidéo ──
function ChampionStreak({ streak }) {
  const [barWidth, setBarWidth] = useState(0);
  const [level, setLevel] = useState(0);
  const [charged, setCharged] = useState(false);
  const levels = ["🥉","🥈","🥇","🏆","👑"];
  const targetPct = Math.min(100, (streak / 7) * 100); // max 7j = 100%

  useEffect(() => {
    // Barre qui se charge progressivement
    const startTime = Date.now();
    const duration = 1200;
    const raf = requestAnimationFrame(function tick() {
      const progress = Math.min(1, (Date.now() - startTime) / duration);
      // Easing out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      setBarWidth(eased * targetPct);
      setLevel(Math.floor(eased * (levels.length - 1)));
      if (progress < 1) requestAnimationFrame(tick);
      else { setCharged(true); setLevel(levels.length - 1); }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const barColor = barWidth < 40
    ? "#22c55e"
    : barWidth < 70
    ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="bg-white/15 rounded-2xl px-5 py-4 relative overflow-hidden">
      {charged && (
        <div className="absolute inset-0 pointer-events-none"
          style={{animation:"championFlash 0.5s ease forwards", background:"rgba(251,191,36,0.15)"}}>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/70 text-xs font-bold uppercase tracking-widest">⚡ Puissance série</div>
        <div className="text-2xl" style={{transition:"all 0.2s", transform: charged ? "scale(1.3)" : "scale(1)"}}>
          {levels[level]}
        </div>
      </div>

      {/* Barre power */}
      <div className="w-full h-5 bg-black/30 rounded-full overflow-hidden mb-2 relative">
        {/* Segments */}
        {[25,50,75].map(p => (
          <div key={p} className="absolute top-0 bottom-0 w-px bg-white/20 z-10" style={{left:`${p}%`}}/>
        ))}
        <div className="h-full rounded-full transition-all relative overflow-hidden"
          style={{width:`${barWidth}%`, background:`linear-gradient(90deg, #22c55e, ${barColor})`}}>
          {/* Shimmer sur la barre */}
          <div className="absolute inset-0 opacity-40"
            style={{background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              backgroundSize:"200% 100%", animation:"barShimmer 1s linear infinite"}}/>
        </div>
      </div>

      {/* Compteur + label */}
      <div className="flex items-center justify-between">
        <div className="text-white font-black text-xl">
          {streak} <span className="text-white/70 text-sm font-semibold">jours d'affilée</span>
        </div>
        {charged && (
          <div className="text-amber-300 text-xs font-black uppercase tracking-wide"
            style={{animation:"championBadge 0.5s cubic-bezier(0.34,1.56,0.64,1) both"}}>
            NIVEAU MAX 🔥
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADO STREAK (inchangé, déjà bon) ──────────────────────
function AdoStreak({ streak, phase }) {
  return (
    <div className="w-full rounded-2xl border border-violet-500/40 p-4 flex items-center gap-4"
      style={{
        background:"linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))",
        animation: phase >= 1 ? "streakPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
        opacity: phase >= 1 ? 1 : 0,
      }}>
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background:"linear-gradient(135deg, #7c3aed, #ec4899)",
          animation: phase >= 2 ? "streakPulse 1.5s ease infinite" : "none",
          boxShadow:"0 0 20px rgba(139,92,246,0.4)" }}>
        🔥
      </div>
      <div className="text-left flex-1">
        <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Streak record</div>
        <div className="text-white font-black text-2xl leading-tight">
          {streak} jours <span className="text-violet-400 text-base font-bold">de suite</span>
        </div>
        <div className="text-zinc-500 text-xs font-semibold mt-0.5">Continue demain 💜</div>
      </div>
    </div>
  );
}

// ── MODAL ENFANTS (rainbow / cosmos / champion) ───────────
const KID_CONFIG = {
  rainbow: {
    bg:"from-fuchsia-500 via-violet-500 to-indigo-500",
    particles:["⭐","🌟","✨","🎉","🎊","💫","🌈"],
    title:"BRAVO !!!! 🎉", titleSize:"text-3xl",
    emoji:"🥳", emojiAnim:"emoji-bounce",
    subtitle:"Toutes tes missions sont faites !",
    cta:"En attente de papa/maman ✓",
  },
  cosmos: {
    bg:"from-indigo-900 via-violet-900 to-slate-900",
    particles:["🚀","⭐","💫","🪐","☄️","✨"],
    title:"Mission accomplie !", titleSize:"text-3xl",
    emoji:"🚀", emojiAnim:"emoji-float",
    subtitle:"Tu as tout réussi aujourd'hui",
    cta:"En attente de validation →",
  },
  champion: {
    bg:"from-orange-500 via-red-500 to-rose-600",
    particles:["🏆","🥇","💪","🔥","👑","🎖️"],
    title:"CHAMPION ! 🏆", titleSize:"text-3xl",
    emoji:"🏆", emojiAnim:"emoji-pulse",
    subtitle:"Objectif du jour atteint !",
    cta:"En attente de validation →",
  },
};

function KidModal({ universeKey, childName, streak, onClose }) {
  const c = KID_CONFIG[universeKey];
  const StreakComp = { rainbow: RainbowStreak, cosmos: CosmosStreak, champion: ChampionStreak }[universeKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{animation:"backdropIn 0.3s ease forwards", fontFamily:"'Nunito', sans-serif"}}>
      <style>{`
        @keyframes backdropIn  {from{opacity:0}to{opacity:1}}
        @keyframes modalBounce {0%{transform:scale(0.3) translateY(60px);opacity:0}60%{transform:scale(1.08) translateY(-10px);opacity:1}80%{transform:scale(0.95) translateY(4px)}100%{transform:scale(1) translateY(0);opacity:1}}
        @keyframes emojiBounce {0%,100%{transform:scale(1)}30%{transform:scale(1.3)}60%{transform:scale(0.9)}}
        @keyframes emojiFloat  {0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-16px) rotate(5deg)}}
        @keyframes emojiPulse  {0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.15);filter:brightness(1.3)}}
        @keyframes particleFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes starBurst   {0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1);opacity:0}}
        @keyframes starLight   {0%{transform:translate(-50%,-50%) scale(0);opacity:0}70%{transform:translate(-50%,-50%) scale(1.4);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        @keyframes lineDrawIn  {from{stroke-dasharray:0 200}to{stroke-dasharray:200 0}}
        @keyframes countLand   {0%{transform:scale(1.5)}100%{transform:scale(1)}}
        @keyframes barShimmer  {0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes championFlash{0%{opacity:1}100%{opacity:0}}
        @keyframes championBadge{0%{transform:scale(0);opacity:0}70%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:1}}
      `}</style>

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <ConfettiRain particles={c.particles} count={26}/>

      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{animation:"modalBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>
        <div className={`bg-gradient-to-br ${c.bg} p-6 text-center relative overflow-hidden`}>
          <div className="absolute -top-8 -right-8 text-9xl opacity-10 select-none">🎊</div>

          {/* Nom */}
          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Bravo</div>
          <div className="text-white font-black mb-3" style={{fontSize:"2.4rem", letterSpacing:"0.02em"}}>
            {childName} !
          </div>

          {/* Emoji */}
          <div className="text-6xl mb-3 inline-block" style={{animation:`${c.emojiAnim} 0.8s ease-in-out infinite`}}>
            {c.emoji}
          </div>
          <div className={`${c.titleSize} font-black text-white mb-1`}>{c.title}</div>
          <div className="text-white/80 font-semibold text-sm mb-4">{c.subtitle}</div>

          {/* Streak animé spécifique */}
          <div className="mb-4"><StreakComp streak={streak}/></div>

          <div className="bg-white/15 rounded-xl px-4 py-2.5 text-white text-xs font-bold">{c.cta}</div>

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm hover:bg-white/30 transition-all">✕</button>
        </div>
      </div>
    </div>
  );
}

// ── ADO MODAL ─────────────────────────────────────────────
function AdoModal({ childName, gender="boy", streak, onClose }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(()=>setPhase(1), 600);
    const t2 = setTimeout(()=>setPhase(2), 2200);
    const t3 = setTimeout(onClose, 9000);
    return ()=>[t1,t2,t3].forEach(clearTimeout);
  }, []);

  const title = gender==="girl" ? "T'es une QUEEN" : "T'es le BOSS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{animation:"backdropIn 0.3s ease forwards", fontFamily:"'Space Grotesk', sans-serif"}}>
      <style>{`
        @keyframes backdropIn  {from{opacity:0}to{opacity:1}}
        @keyframes adoSlideUp  {0%{transform:translateY(90px) scale(0.9);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes nameReveal  {0%{letter-spacing:-0.05em;opacity:0}100%{letter-spacing:0.06em;opacity:1}}
        @keyframes titleGlitch {0%,95%,100%{transform:translate(0);filter:none}96%{transform:translate(-3px,1px);filter:hue-rotate(90deg)}97%{transform:translate(3px,-1px);filter:hue-rotate(-90deg)}98%{transform:translate(-2px,2px);filter:none}}
        @keyframes streakPop   {0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15);opacity:1}80%{transform:scale(0.95)}100%{transform:scale(1)}}
        @keyframes streakPulse {0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0.6)}50%{box-shadow:0 0 0 14px rgba(168,85,247,0)}}
        @keyframes particleFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(540deg);opacity:0}}
        @keyframes lineIn      {from{width:0}to{width:100%}}
      `}</style>

      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}/>
      <ConfettiRain particles={["⚡","💜","🔥","✦","◆","▲","✺"]} count={18}/>

      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{animation:"adoSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards"}}>
        <div className="relative bg-zinc-950 border border-violet-500/40 rounded-3xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent"/>
          <div className="absolute inset-0 pointer-events-none"
            style={{background:"radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)"}}/>

          <div className="relative px-6 pt-8 pb-7 text-center flex flex-col items-center gap-5">
            <div>
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Respect,</div>
              <div className="font-black text-white leading-none"
                style={{fontSize:"clamp(2.2rem,10vw,3rem)", animation:"nameReveal 0.6s ease 0.2s both", letterSpacing:"0.06em"}}>
                {childName.toUpperCase()}
              </div>
            </div>
            <div className="font-black text-transparent text-2xl leading-tight"
              style={{background:"linear-gradient(135deg, #a855f7, #ec4899, #f97316)",
                WebkitBackgroundClip:"text", backgroundClip:"text",
                animation:"titleGlitch 4s ease 1s infinite"}}>
              {title}
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"/>
            <AdoStreak streak={streak} phase={phase}/>
            <div className="w-full flex items-center gap-3 bg-zinc-900 rounded-xl px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm font-black flex-shrink-0">✓</div>
              <div className="text-zinc-300 text-sm font-semibold">Toutes les missions complétées</div>
              <div className="ml-auto text-zinc-600 text-xs">Parent →</div>
            </div>
            <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 text-xs font-semibold transition-colors">Fermer</button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"/>
        </div>
      </div>
    </div>
  );
}

// ── DEMO ─────────────────────────────────────────────────
export default function Demo() {
  const [show, setShow] = useState(false);
  const [universeKey, setUniverseKey] = useState("rainbow");
  const [gender, setGender] = useState("boy");

  return (
    <div style={{fontFamily:"'Nunito', sans-serif"}}
      className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-5 p-6">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>

      <div className="text-white font-black text-xl mb-1">Célébration — démo streak</div>
      <div className="text-zinc-500 text-xs text-center mb-2">Chaque thème a sa propre animation de série</div>

      <div className="flex gap-2 flex-wrap justify-center">
        {[
          {key:"rainbow",label:"🌈 Arc-en-ciel"},
          {key:"cosmos", label:"🚀 Cosmos"},
          {key:"champion",label:"🏆 Champion"},
          {key:"ado",    label:"⚡ Ado"},
        ].map(u=>(
          <button key={u.key} onClick={()=>setUniverseKey(u.key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              universeKey===u.key ? "bg-violet-600 text-white shadow-lg scale-105" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}>{u.label}</button>
        ))}
      </div>

      {universeKey==="ado" && (
        <div className="flex gap-2">
          {[{k:"boy",l:"👦 Garçon"},{k:"girl",l:"👧 Fille"}].map(g=>(
            <button key={g.k} onClick={()=>setGender(g.k)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                gender===g.k ? "bg-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}>{g.l}</button>
          ))}
        </div>
      )}

      <button onClick={()=>setShow(true)}
        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
        🎉 Déclencher la célébration
      </button>

      {show && universeKey==="ado" && <AdoModal childName="John" gender={gender} streak={4} onClose={()=>setShow(false)}/>}
      {show && universeKey!=="ado" && <KidModal universeKey={universeKey} childName="Marie" streak={4} onClose={()=>setShow(false)}/>}
    </div>
  );
}
