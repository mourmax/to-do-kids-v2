import { useState, useEffect } from "react";

const THEMES = {
  rainbow: { name:"Arc-en-ciel", emoji:"🌈", font:"'Nunito', sans-serif", particles:["⭐","🌟","✨","🎉","🎊","💫","🌈","❤️","💛","💚"], heroBg:"from-fuchsia-500 via-violet-500 to-indigo-500" },
  cosmos:  { name:"Cosmos",      emoji:"🚀", font:"'Nunito', sans-serif", particles:["🚀","⭐","💫","🪐","☄️","✨","🌌"],             heroBg:"from-indigo-700 via-violet-800 to-purple-900" },
  champion:{ name:"Champion",    emoji:"🏆", font:"'Nunito', sans-serif", particles:["🏆","🥇","💪","🔥","👑","🎖️","⭐"],            heroBg:"from-orange-500 via-red-500 to-rose-700" },
  ado:     { name:"Vibe",        emoji:"⚡", font:"'Space Grotesk', sans-serif", particles:["⚡","💜","🔥","✦","◆","▲"],            heroBg:"from-violet-700 via-fuchsia-700 to-pink-700" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
  @keyframes particleFall  { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes backdropIn    { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn       { 0%{transform:scale(0.3);opacity:0} 70%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
  @keyframes fadeUp        { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blackIn       { 0%{opacity:0} 15%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
  @keyframes logoReveal    { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
  @keyframes shakeIn       { 0%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} 100%{transform:translateX(0)} }
  @keyframes cloudFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes tearDrop      { 0%{transform:translateY(-10px);opacity:0} 50%{opacity:1} 100%{transform:translateY(20px);opacity:0} }
  @keyframes hopeLine      { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes glitchRed     { 0%,90%,100%{filter:none;transform:translate(0)} 92%{filter:hue-rotate(180deg);transform:translate(-2px,1px)} 94%{transform:translate(2px,-1px)} 96%{transform:translate(0)} }
  @keyframes adoSlideUp    { from{opacity:0;transform:translateY(70px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes nameReveal    { from{letter-spacing:-0.05em;opacity:0} to{letter-spacing:0.06em;opacity:1} }
  @keyframes titleGlitch   { 0%,94%,100%{transform:translate(0);filter:none} 95%{transform:translate(-3px,1px);filter:hue-rotate(90deg)} 97%{transform:translate(3px,-1px);filter:hue-rotate(-90deg)} 98%{transform:translate(0)} }
  @keyframes streakPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0.6)} 50%{box-shadow:0 0 0 14px rgba(168,85,247,0)} }
  @keyframes giftBounce    { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.18) rotate(3deg)} }
  @keyframes rayExpand     { from{opacity:0;transform:scaleX(0)} to{opacity:0.12;transform:scaleX(1)} }
  @keyframes shimmerGold   { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes epicPulse     { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.4)} 50%{box-shadow:0 0 0 16px rgba(251,191,36,0)} }

  /* 🌈 Rainbow reward — enveloppe simple */
  @keyframes chestPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,0.6)} 50%{box-shadow:0 0 0 20px rgba(250,204,21,0)} }
  @keyframes sparkle       { 0%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1.2) rotate(180deg);opacity:1} 100%{transform:scale(0) rotate(360deg);opacity:0} }
  @keyframes revealDown    { 0%{max-height:0;opacity:0} 100%{max-height:120px;opacity:1} }
  @keyframes labelSlide    { 0%{transform:translateY(-8px);opacity:0} 100%{transform:translateY(0);opacity:1} }

  /* 🚀 Cosmos reward — capsule qui atterrit */
  @keyframes capsuleLand   { 0%{transform:translateY(-60px) scale(0.7);opacity:0} 70%{transform:translateY(6px) scale(1.03);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
  @keyframes thrusterFire  { 0%,100%{opacity:0.6;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.3)} }
  @keyframes scanLine      { from{transform:translateY(-100%)} to{transform:translateY(100%)} }
  @keyframes holoBorder    { 0%,100%{border-color:rgba(99,102,241,0.4)} 50%{border-color:rgba(139,92,246,0.9)} }

  /* 🏆 Champion reward — médaille claquée sur le podium */
  @keyframes medalDrop     { 0%{transform:translateY(-80px) rotate(-20deg);opacity:0} 65%{transform:translateY(8px) rotate(4deg);opacity:1} 82%{transform:translateY(-4px) rotate(-2deg)} 100%{transform:translateY(0) rotate(0);opacity:1} }
  @keyframes medalShine    { 0%{left:-100%} 100%{left:200%} }
  @keyframes stampIn       { 0%{transform:scale(3);opacity:0;filter:blur(8px)} 70%{transform:scale(0.97);opacity:1;filter:blur(0)} 100%{transform:scale(1);opacity:1} }
  @keyframes podiumPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.5)} 50%{box-shadow:0 0 0 18px rgba(251,191,36,0)} }
`;

function Particle({ emoji, delay, duration, x, size }) {
  return (
    <div className="absolute pointer-events-none select-none top-0"
      style={{ left:`${x}%`, fontSize:`${size}px`, animation:`particleFall ${duration}s ease-in ${delay}s infinite`, opacity:0 }}>
      {emoji}
    </div>
  );
}
function Rain({ particles, count=26 }) {
  const items = Array.from({length:count},(_,i)=>({
    id:i, emoji:particles[i%particles.length],
    delay:Math.random()*2.5, duration:1.8+Math.random()*2,
    x:Math.random()*100, size:14+Math.floor(Math.random()*22),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map(p=><Particle key={p.id} {...p}/>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CARTOUCHES RÉCOMPENSE animés par thème
// ─────────────────────────────────────────────────────────

// 🌈 Arc-en-ciel : cartouche qui se révèle proprement du haut vers le bas
function RainbowRewardCard({ text }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = label apparaît  |  phase 1 = contenu se déroule  |  phase 2 = pulse
  useEffect(()=>{
    const t1 = setTimeout(()=>setPhase(1), 350);
    const t2 = setTimeout(()=>setPhase(2), 900);
    return()=>[t1,t2].forEach(clearTimeout);
  },[]);

  const sparkles = [
    {top:"-20px",left:"8px",delay:"0.7s"},
    {top:"-24px",right:"6px",delay:"0.85s"},
    {top:"-14px",left:"50%",delay:"0.75s"},
  ];

  return (
    <div className="relative">
      {/* Étincelles au-dessus */}
      {phase >= 1 && sparkles.map((s,i)=>(
        <div key={i} className="absolute text-lg pointer-events-none z-10"
          style={{...s, animation:`sparkle 1s ease ${s.delay} both`}}>✨</div>
      ))}

      {/* Cartouche */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background:"linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
          padding:"2px",
          animation: phase >= 2 ? "chestPulse 2s ease infinite" : "none",
        }}>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">

          {/* Header label — glisse vers le bas */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 flex items-center justify-center gap-2"
            style={{animation:"labelSlide 0.35s ease both"}}>
            <span className="text-lg">🎁</span>
            <span className="text-amber-900 text-xs font-black uppercase tracking-widest">Ta récompense</span>
          </div>

          {/* Texte — déroule vers le bas */}
          <div style={{
            overflow:"hidden",
            animation: phase >= 1 ? "revealDown 0.5s ease both" : "none",
            maxHeight: phase >= 1 ? "120px" : "0px",
          }}>
            <div className="px-5 py-4 text-center">
              <div className="text-slate-800 font-black text-lg leading-snug">{text}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🚀 Cosmos : capsule spatiale qui atterrit avec thrusteurs et scan holographique
function CosmosRewardCard({ text }) {
  const [landed, setLanded] = useState(false);
  const [scanned, setScanned] = useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setLanded(true), 100);
    const t2=setTimeout(()=>setScanned(true), 800);
    return()=>[t1,t2].forEach(clearTimeout);
  },[]);
  return (
    <div className="relative">
      {/* Thrusteurs */}
      {!landed && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
          {[0,1,2].map(i=>(
            <div key={i} className="w-1.5 rounded-b-full"
              style={{height:"16px", background:"linear-gradient(180deg,#f97316,#fbbf24,transparent)",
                animation:`thrusterFire 0.15s ease ${i*0.05}s infinite`}}/>
          ))}
        </div>
      )}
      {/* Capsule */}
      <div className="relative rounded-2xl overflow-hidden border-2"
        style={{
          borderColor:"rgba(99,102,241,0.5)",
          background:"linear-gradient(135deg, rgba(30,27,75,0.95), rgba(49,46,129,0.95))",
          animation: `${landed ? "capsuleLand 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none"}, holoBorder 2s ease 1s infinite`,
          opacity: landed ? 1 : 0,
        }}>
        {/* Scan line */}
        {scanned && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
              style={{animation:"scanLine 1.5s ease 0s 2"}}/>
          </div>
        )}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" style={{boxShadow:"0 0 6px #22d3ee"}}/>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Récompense débloquée</div>
          </div>
          <div className="text-white font-black text-lg leading-snug"
            style={{animation: scanned ? "fadeUp 0.4s ease 0.8s both" : "none", opacity:0}}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🏆 Champion : médaille claquée comme un sceau officiel
function ChampionRewardCard({ text }) {
  const [stamped, setStamped] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setStamped(true), 300); return()=>clearTimeout(t); },[]);
  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background:"linear-gradient(135deg, #92400e, #78350f)",
          padding:"2px",
          animation: stamped ? "podiumPulse 2s ease 0.8s infinite" : "none",
        }}>
        <div className="bg-gradient-to-br from-amber-900/60 to-stone-900/80 rounded-xl px-5 py-5 relative overflow-hidden">
          {/* Effet métal brossé */}
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:"repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)"}}/>

          {/* Médaille claquée */}
          <div className="text-center mb-3"
            style={{animation: stamped ? "medalDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" : "none", opacity:0}}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full relative"
              style={{background:"linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)", boxShadow:"0 4px 16px rgba(251,191,36,0.5)"}}>
              {/* Shine */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 h-full w-8 bg-white/30 skew-x-12"
                  style={{animation: stamped ? "medalShine 1.2s ease 0.9s both" : "none"}}/>
              </div>
              <span className="text-2xl relative z-10">🥇</span>
            </div>
          </div>

          {/* Texte récompense en tampon */}
          <div style={{animation: stamped ? "stampIn 0.5s ease 0.7s both" : "none", opacity:0}}>
            <div className="text-amber-400/80 text-xs font-black uppercase tracking-widest text-center mb-1">Récompense gagnée</div>
            <div className="text-white font-black text-lg text-center leading-snug">{text}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// VICTORY MODAL
// ─────────────────────────────────────────────────────────
function VictoryModal({ theme, childName, gender="boy", rewardText, onClose }) {
  const t = THEMES[theme];
  const [act, setAct] = useState(0);
  useEffect(()=>{ const t1=setTimeout(()=>setAct(1),1800); return()=>clearTimeout(t1); },[]);
  const isAdo = theme==="ado";
  const heroTitle = isAdo
    ? (gender==="girl" ? "Queen victorieuse ⚡" : "Boss absolu ⚡")
    : {rainbow:"Tu as gagné !!! 🎊", cosmos:"Mission réussie ! 🚀", champion:"Victoire totale ! 🏆"}[theme];
  const RewardCard = {rainbow:RainbowRewardCard, cosmos:CosmosRewardCard, champion:ChampionRewardCard}[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{animation:"backdropIn 0.2s ease forwards", fontFamily:t.font}}>
      <style>{CSS}</style>

      {act===0 && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center"
          style={{animation:"blackIn 2s ease forwards", pointerEvents:"none"}}>
          <div className="text-6xl mb-3" style={{animation:"logoReveal 0.5s ease 0.4s both", opacity:0}}>🏆</div>
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest"
            style={{animation:"logoReveal 0.5s ease 0.9s both", opacity:0}}>Challenge terminé</div>
        </div>
      )}

      {act>=1 && <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose}/>}
      {act>=1 && !isAdo && <Rain particles={t.particles} count={30}/>}

      {act>=1 && (
        <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10"
          style={{animation:"scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>

          {isAdo ? (
            <div className="bg-zinc-950 border border-yellow-500/30 rounded-3xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"/>
              <div className="absolute inset-0 pointer-events-none"
                style={{background:"radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.1) 0%, transparent 60%)"}}/>
              <div className="relative px-6 pt-8 pb-7 flex flex-col items-center gap-5 text-center">
                <div className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Challenge accompli,</div>
                <div className="font-black text-white leading-none"
                  style={{fontSize:"clamp(2rem,9vw,2.8rem)", animation:"nameReveal 0.6s ease 0.2s both", letterSpacing:"0.06em"}}>
                  {childName.toUpperCase()}
                </div>
                <div className="font-black text-2xl text-transparent"
                  style={{background:"linear-gradient(135deg,#fbbf24,#f97316,#ec4899)",
                    WebkitBackgroundClip:"text", backgroundClip:"text", animation:"titleGlitch 5s ease 1s infinite"}}>
                  {heroTitle}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"/>
                <div className="w-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-5"
                  style={{animation:"epicPulse 2s ease 1s infinite"}}>
                  <div className="text-yellow-400/70 text-xs uppercase tracking-widest font-semibold mb-2">Ta récompense</div>
                  <div className="font-black text-white text-xl" style={{animation:"shimmerGold 3s linear infinite",
                    background:"linear-gradient(90deg,#fbbf24,#fff,#fbbf24)",backgroundSize:"200% auto",
                    WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    {rewardText}
                  </div>
                </div>
                <div className="text-zinc-500 text-xs">En attente de validation parent</div>
                <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 text-xs font-semibold">Fermer</button>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"/>
            </div>
          ) : (
            <div className={`bg-gradient-to-br ${t.heroBg} p-6 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {Array.from({length:10},(_,i)=>(
                  <div key={i} className="absolute h-px w-full origin-center"
                    style={{transform:`rotate(${i*18}deg)`,
                      background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                      animation:`rayExpand 0.6s ease ${0.2+i*0.06}s both`}}/>
                ))}
              </div>
              <div className="relative">
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Félicitations</div>
                <div className="text-white font-black mb-3" style={{fontSize:"2.4rem"}}>{childName} !</div>
                <div className="text-5xl mb-2 inline-block" style={{animation:"giftBounce 1.2s ease-in-out infinite"}}>🏆</div>
                <div className="text-white font-black text-2xl mb-1">{heroTitle}</div>
                <div className="text-white/80 text-sm font-semibold mb-5">Tu as relevé le challenge !</div>
                <div className="mb-4"><RewardCard text={rewardText}/></div>
                <div className="bg-white/15 rounded-xl px-4 py-2.5 text-white text-xs font-bold">
                  En attente de validation parent 🙌
                </div>
              </div>
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm">✕</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MALUS MODAL
// ─────────────────────────────────────────────────────────
const KID_MALUS = {
  rainbow: { bg:"from-slate-600 via-slate-700 to-slate-800", emoji:"😔", title:"Oh non...",         message:"C'est pas grave du tout !", rebond:"La prochaine fois, tu vas y arriver ! 💪" },
  cosmos:  { bg:"from-slate-900 via-indigo-950 to-slate-900", emoji:"🛸", title:"Mission échouée...", message:"Même les astronautes ratent des atterrissages.", rebond:"Le cosmos t'attend encore ! 🚀" },
  champion:{ bg:"from-slate-700 via-slate-800 to-slate-900", emoji:"😤", title:"Match perdu !",       message:"Tout champion connaît la défaite.", rebond:"Les grands champions rebondissent fort ! 🏅" },
};
const ADO_MALUS = {
  boy: {
    emoji:"💀", glitch:true,
    headline:"Challenge raté.", sub:"Ça arrive. Mais ça passe pas inaperçu.",
    rebond:"Reset. Le prochain, t'es dessus. 💪",
    accentColor:"rgba(239,68,68,0.08)", borderColor:"border-red-900/40",
    lineColor:"via-red-800/60", rebondColor:"text-zinc-300",
  },
  girl: {
    emoji:"🤦", glitch:false,
    headline:"Aïe, c'est raté...", sub:"Mais une queen se relève toujours.",
    rebond:"La prochaine fois, le challenge est à toi. 👑",
    accentColor:"rgba(236,72,153,0.08)", borderColor:"border-pink-900/40",
    lineColor:"via-pink-700/50", rebondColor:"text-pink-300",
  },
};

function MalusModal({ theme, childName, gender="boy", malusText, onClose }) {
  const t = THEMES[theme];
  const isAdo = theme==="ado";
  const [showConsequence, setShowConsequence] = useState(false);
  useEffect(()=>{ const tv=setTimeout(()=>setShowConsequence(true),900); return()=>clearTimeout(tv); },[]);
  const tears = isAdo ? [] : Array.from({length:5},(_,i)=>({id:i, x:15+i*17, delay:i*0.3}));
  const ado = ADO_MALUS[gender];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{animation:"backdropIn 0.3s ease forwards", fontFamily:t.font}}>
      <style>{CSS}</style>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose}/>
      {!isAdo && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {tears.map(tr=>(
            <div key={tr.id} className="absolute text-xl top-0"
              style={{left:`${tr.x}%`, animation:`tearDrop 2.2s ease-in ${tr.delay}s infinite`}}>💧</div>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10"
        style={{animation: isAdo ? "adoSlideUp 0.4s ease-out forwards" : "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>

        {isAdo ? (
          <div className={`bg-zinc-950 border ${ado.borderColor} rounded-3xl overflow-hidden`}
            style={{animation:"shakeIn 0.5s ease 0.2s both"}}>
            <div className={`h-px bg-gradient-to-r from-transparent ${ado.lineColor} to-transparent`}/>
            <div className="absolute inset-0 pointer-events-none"
              style={{background:`radial-gradient(ellipse at 50% 0%, ${ado.accentColor} 0%, transparent 60%)`}}/>
            <div className="relative px-6 pt-8 pb-7 flex flex-col items-center gap-4 text-center">
              <div className="text-5xl" style={{animation: ado.glitch ? "glitchRed 2s ease 0.3s infinite" : "cloudFloat 2.5s ease-in-out infinite"}}>
                {ado.emoji}
              </div>
              <div className="font-black text-white leading-none"
                style={{fontSize:"1.8rem", letterSpacing:"0.04em", animation:"nameReveal 0.5s ease 0.2s both"}}>
                {childName.toUpperCase()}
              </div>
              <div className="font-black text-xl text-white/90">{ado.headline}</div>
              <div className="text-zinc-500 text-sm font-semibold leading-relaxed">{ado.sub}</div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"/>
              {showConsequence && (
                <div className={`w-full rounded-2xl p-4 border ${ado.borderColor}`}
                  style={{background:`radial-gradient(ellipse at center, ${ado.accentColor}, transparent)`,
                    animation:"fadeUp 0.4s ease forwards"}}>
                  <div className="text-zinc-500 text-xs uppercase tracking-widest font-semibold mb-2">Conséquence :</div>
                  <div className="text-white font-bold text-base">{malusText}</div>
                </div>
              )}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 w-full"
                style={{animation:"hopeLine 0.5s ease 1.3s both"}}>
                <div className={`text-sm font-semibold ${ado.rebondColor}`}>{ado.rebond}</div>
              </div>
              <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 text-xs font-semibold">OK</button>
            </div>
            <div className={`h-px bg-gradient-to-r from-transparent ${ado.lineColor} to-transparent opacity-50`}/>
          </div>
        ) : (
          <div className={`bg-gradient-to-br ${KID_MALUS[theme].bg} p-6 text-center relative overflow-hidden`}
            style={{animation:"shakeIn 0.5s ease 0.2s both"}}>
            <div className="absolute top-4 left-6 text-4xl opacity-20 pointer-events-none" style={{animation:"cloudFloat 3s ease-in-out infinite"}}>☁️</div>
            <div className="absolute top-8 right-8 text-2xl opacity-15 pointer-events-none" style={{animation:"cloudFloat 3.5s ease-in-out 0.5s infinite"}}>☁️</div>
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Eh {childName}...</div>
            <div className="text-5xl mb-3 inline-block" style={{animation:"cloudFloat 2s ease-in-out infinite"}}>
              {KID_MALUS[theme].emoji}
            </div>
            <div className="text-white font-black text-2xl mb-1">{KID_MALUS[theme].title}</div>
            <div className="text-white/80 text-sm font-semibold mb-4">{KID_MALUS[theme].message}</div>
            {showConsequence && (
              <div className="bg-black/25 rounded-2xl p-4 mb-3 border border-white/20"
                style={{animation:"fadeUp 0.5s ease forwards"}}>
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Ce qui se passe :</div>
                <div className="text-white font-black text-base leading-snug">{malusText}</div>
              </div>
            )}
            <div className="bg-white/15 rounded-xl px-4 py-3 mb-1 border border-white/20"
              style={{animation:"hopeLine 0.6s ease 1.4s both"}}>
              <div className="text-white font-bold text-sm">{KID_MALUS[theme].rebond}</div>
            </div>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DEMO
// ─────────────────────────────────────────────────────────
export default function Demo() {
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState("rainbow");
  const [gender, setGender] = useState("boy");
  return (
    <div style={{fontFamily:"'Nunito', sans-serif"}}
      className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 p-6">
      <style>{CSS}</style>
      <div className="text-white font-black text-xl mb-1">Moments émotionnels v3</div>
      <div className="flex gap-2 flex-wrap justify-center">
        {Object.entries(THEMES).map(([key,t])=>(
          <button key={key} onClick={()=>setTheme(key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              theme===key ? "bg-violet-600 text-white shadow-lg scale-105" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}>{t.emoji} {t.name}</button>
        ))}
      </div>
      {theme==="ado" && (
        <div className="flex gap-2">
          {[{k:"boy",l:"👦 Garçon"},{k:"girl",l:"👧 Fille"}].map(g=>(
            <button key={g.k} onClick={()=>setGender(g.k)}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${gender===g.k ? "bg-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
              {g.l}</button>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={()=>setModal({type:"victory"})}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-black px-5 py-4 rounded-2xl text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
          🏆 Victoire
        </button>
        <button onClick={()=>setModal({type:"malus"})}
          className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-black px-5 py-4 rounded-2xl text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
          😔 Malus
        </button>
      </div>
      {modal?.type==="victory" && (
        <VictoryModal theme={theme} childName="Marie" gender={gender}
          rewardText="Un ticket de cinéma + pop-corn 🎬🍿" onClose={()=>setModal(null)}/>
      )}
      {modal?.type==="malus" && (
        <MalusModal theme={theme} childName="John" gender={gender}
          malusText="Privé d'écran pendant 24h 📵" onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}
