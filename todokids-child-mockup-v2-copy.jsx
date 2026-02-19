import { useState, useRef } from "react";

// ── THEMES ──────────────────────────────────────────────
const UNIVERSES = {
  rainbow: {
    name: "Arc-en-ciel",
    emoji: "🌈",
    ageHint: "Pour les petits explorateurs",
    bg: "from-pink-400 via-purple-400 to-indigo-500",
    cardBg: "bg-white/90 border border-white/60",
    heroBg: "from-fuchsia-500 via-violet-500 to-indigo-500",
    streakBg: "from-amber-400 to-orange-500",
    isDark: false,
  },
  cosmos: {
    name: "Cosmos",
    emoji: "🚀",
    ageHint: "Pour les aventuriers de l'espace",
    bg: "from-slate-900 via-indigo-950 to-slate-900",
    cardBg: "bg-white/10 backdrop-blur-md border border-white/15",
    heroBg: "from-indigo-600 via-violet-700 to-purple-900",
    streakBg: "from-cyan-500 to-blue-600",
    isDark: true,
  },
  champion: {
    name: "Champion",
    emoji: "🏆",
    ageHint: "Pour les champions du quotidien",
    bg: "from-amber-400 via-orange-400 to-red-400",
    cardBg: "bg-white/90 border border-white/60",
    heroBg: "from-orange-500 via-red-500 to-rose-600",
    streakBg: "from-yellow-400 to-amber-500",
    isDark: false,
  },
  ado: {
    name: "Vibe",
    emoji: "⚡",
    ageHint: "Pour les 12 ans et +",
    bg: "from-zinc-950 via-zinc-900 to-zinc-950",
    cardBg: "bg-zinc-800/80 border border-zinc-700/50",
    heroBg: "from-violet-600 via-fuchsia-600 to-pink-600",
    streakBg: "from-violet-600 to-fuchsia-600",
    isDark: true,
    isAdo: true,
  },
};

const AVATARS = ["🦁","🐯","🦊","🐸","🦄","🐲","🚀","⭐","🦋","🐬","🦅","🐺","🎮","🎸","⚽","🎯","🔥","💎","🌊","🎭"];

const MISSIONS = [
  { id: 1, icon: "📚", title: "Faire ses devoirs", done: false, time: "16:00" },
  { id: 2, icon: "🧸", title: "Ranger sa chambre",  done: true,  time: "17:00" },
  { id: 3, icon: "🍽️", title: "Mettre la table",    done: false, time: "18:00" },
  { id: 4, icon: "🎸", title: "Pratiquer guitare",  done: false, time: "17:30" },
  { id: 5, icon: "🦷", title: "Se brosser les dents", done: true, time: "20:00" },
];

// ── AVATAR PICKER (emoji + photo) ────────────────────────
function AvatarPicker({ onSelect, universeKey }) {
  const u = UNIVERSES[universeKey];
  const fileRef = useRef();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setSelected({ type: "photo", src: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${u.bg} flex flex-col px-5 py-8`}
      style={{ fontFamily: u.isAdo ? "'Space Grotesk', sans-serif" : "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

      <div className="text-center mb-6">
        <div className={`font-black text-2xl mb-1 ${u.isDark ? "text-white" : "text-white"}`}>
          {u.isAdo ? "Ton identité" : "Choisis ton totem !"}
        </div>
        <p className={`text-sm font-semibold ${u.isDark ? "text-white/50" : "text-white/70"}`}>
          {u.isAdo ? "Photo ou emoji — à toi de choisir" : "Ton animal ou symbole préféré"}
        </p>
      </div>

      {/* Photo upload — featured */}
      <div className="mb-5">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current.click()}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all
            ${photoPreview
              ? "bg-emerald-500 text-white"
              : u.isAdo
                ? "bg-zinc-700 border border-zinc-600 text-zinc-200 hover:bg-zinc-600"
                : "bg-white/20 text-white border-2 border-dashed border-white/40 hover:bg-white/30"
            }`}>
          {photoPreview ? (
            <>
              <img src={photoPreview} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
              <span>Photo choisie ✓ — changer</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span>{u.isAdo ? "Utiliser ma photo" : "Mettre ma photo"}</span>
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex-1 h-px ${u.isDark ? "bg-white/10" : "bg-white/30"}`} />
        <span className={`text-xs font-bold ${u.isDark ? "text-white/30" : "text-white/60"}`}>
          {u.isAdo ? "ou un emoji" : "ou un emoji"}
        </span>
        <div className={`flex-1 h-px ${u.isDark ? "bg-white/10" : "bg-white/30"}`} />
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {AVATARS.map(a => (
          <button key={a} onClick={() => setSelected({ type: "emoji", value: a })}
            className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all
              hover:scale-110 active:scale-95
              ${selected?.type === "emoji" && selected.value === a
                ? "bg-white scale-110 shadow-lg ring-2 ring-white"
                : u.isAdo
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-white/20 hover:bg-white/30"
              }`}>
            {a}
          </button>
        ))}
      </div>

      {/* Confirm */}
      <button
        disabled={!selected}
        onClick={() => onSelect(selected)}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all
          ${selected
            ? `bg-gradient-to-r ${u.heroBg} text-white shadow-lg active:scale-95`
            : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}>
        {selected ? "C'est parti ! →" : "Choisis d'abord un avatar"}
      </button>
    </div>
  );
}

// ── UNIVERSE PICKER ───────────────────────────────────────
function UniversePicker({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex flex-col px-5 py-10"
      style={{ fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">✨</div>
        <h1 className="text-3xl font-black text-white mb-1">Choisis ton univers !</h1>
        <p className="text-white/70 font-semibold text-sm">Tu pourras le changer quand tu veux</p>
      </div>
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        {Object.entries(UNIVERSES).map(([key, u]) => (
          <button key={key} onClick={() => onSelect(key)}
            className={`bg-gradient-to-r ${u.heroBg} text-white rounded-3xl p-4 flex items-center gap-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
              ${u.isDark ? "bg-white/10" : "bg-white/20"}`}>
              {u.emoji}
            </div>
            <div className="text-left flex-1">
              <div className="font-black text-lg leading-tight">{u.name}</div>
              <div className="text-white/70 text-xs font-semibold mt-0.5">{u.ageHint}</div>
            </div>
            <span className="text-xl opacity-60">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AVATAR DISPLAY ────────────────────────────────────────
function AvatarDisplay({ avatar, size = "md" }) {
  const s = size === "sm" ? "w-8 h-8 text-base" : "w-11 h-11 text-2xl";
  if (avatar?.type === "photo") {
    return <img src={avatar.src} className={`${s} rounded-xl object-cover flex-shrink-0`} alt="avatar" />;
  }
  return (
    <div className={`${s} rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0`}>
      {avatar?.value || "🦁"}
    </div>
  );
}

// ── CHILD DASHBOARD ───────────────────────────────────────
function ChildDashboard({ universeKey, avatar, childName, onSwitchUniverse }) {
  const u = UNIVERSES[universeKey];
  const [missions, setMissions] = useState(MISSIONS);
  const [justDone, setJustDone] = useState(null);

  const doneCount = missions.filter(m => m.done).length;
  const totalCount = missions.length;
  const allDone = doneCount === totalCount;
  const streak = 3;
  const challengeDays = 2;
  const challengeTotal = 5;
  const pct = Math.round((doneCount / totalCount) * 100);

  const toggleMission = (id) => {
    const m = missions.find(m => m.id === id);
    if (!m.done) { setJustDone(id); setTimeout(() => setJustDone(null), 1000); }
    setMissions(ms => ms.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  // ── ADO LAYOUT ──
  if (u.isAdo) {
    return (
      <div className="min-h-screen bg-zinc-950" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Header ado — minimaliste */}
        <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarDisplay avatar={avatar} />
            <div>
              <div className="text-white font-bold text-sm leading-tight">{childName}</div>
              <div className="text-zinc-500 text-xs">🔥 {streak} day streak</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSwitchUniverse}
              className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
              🎨
            </button>
            <button className="text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-xl px-3 h-9 hover:bg-zinc-800">
              Parent →
            </button>
          </div>
        </div>

        <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-4">

          {/* Hero Défi — néon style */}
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative">
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Objectif</div>
              <div className="text-white font-bold text-lg mb-3">🎁 Cadeau Surprise</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(challengeDays/challengeTotal)*100}%` }} />
                </div>
                <span className="text-white text-xs font-bold">{challengeDays}/{challengeTotal}j</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Streak", value: `${streak}🔥`, sub: "jours" },
              { label: "Aujourd'hui", value: `${doneCount}/${totalCount}`, sub: "missions" },
              { label: "Défi", value: `${challengeDays}/${challengeTotal}`, sub: "jours" },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-lg leading-tight">{s.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Missions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-zinc-300 font-bold text-sm uppercase tracking-wide">Missions</div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                allDone ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"
              }`}>{pct}% done</div>
            </div>
            <div className="flex flex-col gap-2">
              {missions.map(m => (
                <button key={m.id} onClick={() => toggleMission(m.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-[0.98] text-left
                    ${m.done
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"
                    } ${justDone === m.id ? "scale-95" : ""}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
                    m.done ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800"
                  }`}>
                    {m.done ? "✓" : m.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${m.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                      {m.title}
                    </div>
                    <div className={`text-xs mt-0.5 ${m.done ? "text-emerald-500" : "text-zinc-600"}`}>
                      {m.done ? "Complété ✓" : `🕐 ${m.time}`}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
                    m.done ? "bg-emerald-500 border-emerald-500 text-white text-xs" : "border-zinc-700"
                  }`}>
                    {m.done && "✓"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── KID LAYOUT (rainbow / cosmos / champion) ──
  return (
    <div className={`min-h-screen bg-gradient-to-br ${u.bg}`}
      style={{ fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-2 flex items-center justify-between">
        <div className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 ${
          u.isDark ? "bg-white/10 backdrop-blur-sm" : "bg-white/40 backdrop-blur-sm"
        }`}>
          <AvatarDisplay avatar={avatar} />
          <div>
            <div className={`font-black text-sm ${u.isDark ? "text-white" : "text-slate-800"}`}>{childName}</div>
            <div className={`text-xs font-bold ${u.isDark ? "text-white/60" : "text-slate-500"}`}>🔥 {streak} jours !</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onSwitchUniverse}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              u.isDark ? "bg-white/10 border border-white/20" : "bg-white/60"
            }`}>🎨</button>
          <button className={`flex items-center gap-1.5 text-xs font-bold px-3 h-10 rounded-xl ${
            u.isDark ? "bg-white/10 border border-white/20 text-white" : "bg-white/60 text-slate-700"
          }`}>👨‍👩‍👧 Parent</button>
        </div>
      </div>

      <div className="px-4 pt-2 pb-8 flex flex-col gap-4 max-w-lg mx-auto">

        {/* Hero défi */}
        <div className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br ${u.heroBg} shadow-xl`}>
          <div className="absolute -top-6 -right-6 text-8xl opacity-10 select-none">🏆</div>
          <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 select-none">⭐</div>
          <div className="relative">
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Défi en cours</div>
            <div className="text-white font-black text-xl mb-1">🎁 Cadeau Surprise</div>
            <div className="text-white/80 text-sm font-semibold mb-4">{challengeDays}/{challengeTotal} jours réussis</div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(challengeDays/challengeTotal)*100}%` }} />
            </div>
            <div className="flex justify-between text-white/60 text-xs font-bold">
              <span>Jour {challengeDays}</span>
              <span>{challengeTotal - challengeDays} jours restants 🚀</span>
            </div>
          </div>
        </div>

        {/* Progress today */}
        <div className={`${u.cardBg} rounded-2xl p-4 flex items-center gap-4`}>
          <div className="flex-1">
            <div className={`font-black text-sm mb-2 ${u.isDark ? "text-white" : "text-slate-800"}`}>
              Aujourd'hui — {doneCount}/{totalCount} missions
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${u.isDark ? "bg-white/10" : "bg-slate-100"}`}>
              <div className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-400" : "bg-violet-400"}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className={`text-2xl font-black ${allDone ? "text-emerald-400" : u.isDark ? "text-white/50" : "text-slate-300"}`}>
            {pct}%
          </div>
        </div>

        {/* Missions */}
        <div>
          <div className={`font-black text-base mb-3 px-1 ${u.isDark ? "text-white" : "text-white"}`}>
            Missions du jour
          </div>
          <div className="flex flex-col gap-2.5">
            {missions.map(m => (
              <button key={m.id} onClick={() => toggleMission(m.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]
                  ${justDone === m.id ? "scale-95" : ""}
                  ${m.done
                    ? u.isDark ? "bg-emerald-500/20 border border-emerald-400/30" : "bg-emerald-50 border-2 border-emerald-300"
                    : u.cardBg
                  }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  m.done ? "bg-emerald-400 text-white" : u.isDark ? "bg-white/10" : "bg-slate-100"
                }`}>
                  {m.done ? "✓" : m.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-black text-sm ${
                    m.done
                      ? u.isDark ? "text-emerald-300 line-through" : "text-emerald-600 line-through"
                      : u.isDark ? "text-white" : "text-slate-800"
                  }`}>{m.title}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${
                    m.done ? "text-emerald-500" : u.isDark ? "text-white/40" : "text-slate-400"
                  }`}>
                    {m.done ? "✓ Fait !" : `🕐 ${m.time}`}
                  </div>
                </div>
                {m.done && <div className="text-2xl flex-shrink-0">⭐</div>}
                {!m.done && (
                  <div className={`w-8 h-8 rounded-xl border-2 flex-shrink-0 ${
                    u.isDark ? "border-white/20" : "border-slate-200"
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className={`rounded-3xl p-4 bg-gradient-to-r ${u.streakBg} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <div className="text-white font-black text-lg">{streak} jours de suite !</div>
              <div className="text-white/80 text-sm font-semibold">Continue, t'es au top !</div>
            </div>
            <div className="ml-auto text-3xl font-black text-white/30">×{streak}</div>
          </div>
        </div>

        {allDone && (
          <div className="rounded-3xl p-6 text-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl">
            <div className="text-5xl mb-2">🎉</div>
            <div className="text-white font-black text-xl mb-1">Mission accomplie !</div>
            <div className="text-white/80 text-sm font-semibold">En attente de validation parent…</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────
export default function ChildApp() {
  const [step, setStep] = useState("universe");
  const [universeKey, setUniverseKey] = useState("rainbow");
  const [avatar, setAvatar] = useState({ type: "emoji", value: "🦁" });

  if (step === "universe") return (
    <UniversePicker onSelect={(k) => { setUniverseKey(k); setStep("avatar"); }} />
  );
  if (step === "avatar") return (
    <AvatarPicker universeKey={universeKey} onSelect={(a) => { setAvatar(a); setStep("dashboard"); }} />
  );
  return (
    <ChildDashboard
      universeKey={universeKey}
      avatar={avatar}
      childName="John"
      onSwitchUniverse={() => setStep("universe")}
    />
  );
}
