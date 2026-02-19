import { useState } from "react";

const missions = [
  { id: 1, icon: "📚", title: "Faire ses devoirs", status: "pending", time: "16:00" },
  { id: 2, icon: "🧸", title: "Ranger ses jouets", status: "pending", time: "16:01" },
  { id: 3, icon: "🍽️", title: "Mettre la table", status: "validated", time: "16:00" },
  { id: 4, icon: "🎸", title: "Pratiquer un instrument", status: "pending", time: "17:00" },
];

const children = [
  { id: 1, name: "Marie", color: "#f43f5e", initials: "M", pending: 3 },
  { id: 2, name: "John",  color: "#22c55e", initials: "J", pending: 0 },
];

const STATUS = {
  pending:   { label: "En attente", bg: "bg-amber-50",   text: "text-amber-600" },
  validated: { label: "Validée ✓",  bg: "bg-emerald-50", text: "text-emerald-600" },
  rejected:  { label: "Rejetée",    bg: "bg-rose-50",    text: "text-rose-500" },
};

const NAV_ITEMS = [
  { id: "validation", icon: "✅", label: "Validation" },
  { id: "missions",   icon: "⭐", label: "Missions" },
  { id: "defi",       icon: "🏆", label: "Défi" },
  { id: "enfants",    icon: "👶", label: "Enfants" },
];

export default function ParentDashboard() {
  const [tab, setTab] = useState("validation");
  const [activeChild, setActiveChild] = useState(0);
  const [selectedDays, setSelectedDays] = useState(2);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [missionStatuses, setMissionStatuses] = useState({
    1: "pending", 2: "pending", 3: "validated", 4: "pending"
  });

  const validate = (id) => setMissionStatuses(s => ({ ...s, [id]: "validated" }));
  const reject   = (id) => setMissionStatuses(s => ({ ...s, [id]: "rejected" }));
  const pendingCount = Object.values(missionStatuses).filter(s => s === "pending").length;
  const allValidated = pendingCount === 0;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}
      className="min-h-screen bg-violet-50">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── HEADER transparent sur fond violet-50 ── */}
      <header className="sticky top-0 z-30 bg-violet-50/80 backdrop-blur-sm border-b border-violet-200/60">
        <div className="px-4 h-14 flex items-center justify-between">

          {/* Left: hamburger (mobile only) + logo */}
          <div className="flex items-center gap-2.5">
            <button
              className="lg:hidden w-9 h-9 rounded-xl bg-white/70 border border-violet-200 flex items-center justify-center text-slate-500"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              ☰
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">T</div>
            <span className="font-black text-slate-800 text-base">To-Do Kids</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400 font-semibold">Famille active</span>
            </div>
          </div>

          {/* Right: child pills + mode enfant + logout */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {children.map((child, i) => (
                <button key={child.id} onClick={() => setActiveChild(i)}
                  className={`relative flex items-center gap-1.5 h-9 px-3 rounded-xl font-bold text-sm transition-all ${
                    activeChild === i ? "text-white shadow-sm" : "bg-white/70 border border-violet-200 text-slate-600 hover:bg-white"
                  }`}
                  style={activeChild === i ? { background: child.color } : {}}>
                  <span className="text-xs font-black">{child.initials}</span>
                  <span className="hidden sm:inline">{child.name}</span>
                  {child.pending > 0 && (
                    <span className={`text-[10px] font-black px-1 rounded-full ${
                      activeChild === i ? "bg-white/30 text-white" : "bg-amber-100 text-amber-600"
                    }`}>{child.pending}</span>
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl h-9 px-3 text-sm transition-all shadow-sm shadow-violet-200">
              <span>👶</span>
              <span className="hidden sm:inline">Mode Enfant</span>
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/70 border border-violet-200 hover:bg-white flex items-center justify-center text-slate-500 transition-all">↪</button>
          </div>
        </div>
      </header>

      {/* ── BODY : sidebar permanente sur lg, drawer sur mobile ── */}
      <div className="flex min-h-[calc(100vh-56px)]">

        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div className="fixed inset-0 bg-black/10 z-20 lg:hidden"
            onClick={() => setMobileNavOpen(false)} />
        )}

        {/* SIDEBAR
            - Mobile  : fixed drawer, translates in/out
            - Desktop : static, always visible, non-overlapping
        */}
        <aside className={`
          fixed lg:static
          top-14 left-0 bottom-0
          z-20
          w-52 flex-shrink-0
          bg-violet-50 lg:bg-transparent
          border-r border-violet-200/60 lg:border-0
          transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col gap-1
          px-3 py-5
        `}>
          {/* Desktop title */}
          <div className="hidden lg:block px-3 mb-5">
            <h1 className="text-lg font-black text-slate-800">Espace Parent</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Gérez les missions</p>
          </div>

          {/* Nav links */}
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => { setTab(item.id); setMobileNavOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left w-full ${
                tab === item.id
                  ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                  : "text-slate-600 hover:bg-white/80 hover:shadow-sm"
              }`}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === "validation" && pendingCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                  tab === "validation" ? "bg-white/30 text-white" : "bg-amber-100 text-amber-600"
                }`}>{pendingCount}</span>
              )}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-violet-200/60 flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-white/80 text-sm font-semibold transition-all">
              <span>❓</span> Aide
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT
            Prend tout l'espace restant sur desktop.
            Le contenu intérieur est centré avec max-w-2xl.
        */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 py-5 lg:py-6">
          <div className="max-w-2xl mx-auto">

            {/* Mobile page title */}
            <div className="lg:hidden mb-4">
              <h1 className="text-lg font-black text-slate-800">
                {NAV_ITEMS.find(n => n.id === tab)?.icon}{" "}
                {NAV_ITEMS.find(n => n.id === tab)?.label}
              </h1>
            </div>

            {/* ══ VALIDATION ══ */}
            {tab === "validation" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verdict du jour</div>
                    <div className="text-xs font-semibold text-slate-400">0 / 2 jours</div>
                  </div>
                  {allValidated ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center mb-3">
                      <div className="text-xl mb-1">🎉</div>
                      <div className="font-bold text-emerald-700 text-sm">Toutes les missions validées !</div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 mb-3">
                      <span className="text-amber-500 flex-shrink-0">⏳</span>
                      <span className="text-amber-700 font-semibold text-sm">
                        {pendingCount} mission{pendingCount > 1 ? "s" : ""} en attente
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button disabled={!allValidated}
                      className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center min-h-[52px] transition-all ${
                        allValidated ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                      }`}>✓ Succès</button>
                    <button className="py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm min-h-[52px] shadow-sm transition-all">✗ Échec</button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Contrôle des missions</div>
                  <div className="flex flex-col gap-2.5">
                    {missions.map(m => {
                      const status = missionStatuses[m.id];
                      const s = STATUS[status];
                      return (
                        <div key={m.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-3.5 sm:p-4 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0">{m.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-sm truncate">{m.title}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                              <span className="text-[10px] text-slate-400">🕐 {m.time}</span>
                            </div>
                          </div>
                          {status === "pending" && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => validate(m.id)} className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg flex items-center justify-center transition-all">✓</button>
                              <button onClick={() => reject(m.id)}   className="w-11 h-11 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-500 font-black text-lg flex items-center justify-center transition-all">✗</button>
                            </div>
                          )}
                          {status === "validated" && <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-500 font-black text-xl flex items-center justify-center flex-shrink-0">✓</div>}
                          {status === "rejected"  && <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-500 font-black text-xl flex items-center justify-center flex-shrink-0">✗</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ MISSIONS ══ */}
            {tab === "missions" && (
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Étape 3</div>
                  <div className="font-black text-slate-800 text-base sm:text-lg">Configurez les missions</div>
                  <div className="text-slate-400 text-xs sm:text-sm mt-0.5">Choisissez ou créez des missions sur mesure</div>
                </div>
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-slate-600">👑 Quota gratuit</div>
                    <div className="font-black text-slate-800">3 <span className="font-medium text-slate-400 text-sm">/ 5</span></div>
                  </div>
                  <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button className="bg-white border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-4 text-center transition-all min-h-[80px]">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="font-bold text-slate-700 text-xs sm:text-sm">Missions populaires</div>
                  </button>
                  <button className="bg-white border-2 border-violet-100 hover:border-violet-200 rounded-2xl p-4 text-center transition-all min-h-[80px]">
                    <div className="text-2xl mb-1">✏️</div>
                    <div className="font-bold text-slate-700 text-xs sm:text-sm">Sur mesure</div>
                  </button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {missions.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl flex-shrink-0">{m.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{m.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">🕐 {m.time} • Tous</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">✏️</button>
                        <button className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 flex items-center justify-center">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ DÉFI ══ */}
            {tab === "defi" && (
              <div className="flex flex-col gap-3">
                <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #0ea5e9 100%)" }}>
                  <div className="absolute -top-4 -right-4 text-7xl opacity-10 select-none">🏆</div>
                  <div className="absolute -bottom-2 -left-2 text-5xl opacity-10 select-none">⭐</div>
                  <div className="relative">
                    <div className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-1">Étape 4</div>
                    <div className="text-white font-black text-xl sm:text-2xl mb-2">Le Grand Défi 🏆</div>
                    <div className="text-violet-200 text-xs sm:text-sm leading-relaxed">Définissez la récompense et ce qui se passe si le défi n'est pas relevé.</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="font-black text-slate-800 text-sm sm:text-base">Durée du défi</div>
                      <div className="text-xs text-slate-400">Combien de jours consécutifs ?</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[1, 2, 3].map(d => (
                      <button key={d} onClick={() => setSelectedDays(d)}
                        className={`py-3.5 rounded-xl font-black text-lg transition-all border-2 min-h-[52px] ${
                          selectedDays === d ? "bg-violet-500 text-white border-violet-500 shadow-md" : "bg-white text-slate-400 border-violet-100 hover:border-violet-300"
                        }`}>{d}j</button>
                    ))}
                    <button className="py-2 rounded-xl border-2 border-amber-200 bg-amber-50 flex flex-col items-center justify-center min-h-[52px] gap-0.5">
                      <span>👑</span>
                      <span className="text-[10px] font-bold text-amber-500">Plus</span>
                    </button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-semibold">
                    👑 Version gratuite : 3 jours max
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
                    <div>
                      <div className="font-black text-slate-800 text-sm sm:text-base">Récompense</div>
                      <div className="text-xs text-emerald-600 font-semibold">Si le défi est relevé ✓</div>
                    </div>
                  </div>
                  <input className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white min-h-[48px]"
                    placeholder="Ex : Un ticket de cinéma 🎬" />
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-400 flex items-center justify-center text-xl flex-shrink-0">⚡</div>
                    <div>
                      <div className="font-black text-slate-800 text-sm sm:text-base">Conséquence</div>
                      <div className="text-xs text-rose-500 font-semibold">Si une journée est ratée ✗</div>
                    </div>
                  </div>
                  <input className="w-full border-2 border-rose-200 rounded-xl px-4 py-3 text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white min-h-[48px]"
                    placeholder="Ex : Privé d'écran pendant 24h 📵" />
                </div>

                <button className="w-full text-white font-black py-4 rounded-2xl text-base shadow-lg shadow-violet-200 min-h-[56px]"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                  🚀 Lancer le défi !
                </button>
              </div>
            )}

            {/* ══ ENFANTS ══ */}
            {tab === "enfants" && (
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="text-sm font-bold text-slate-700 mb-4">👶 Gestion des enfants</div>
                  {children.map((child, i) => (
                    <div key={child.id} className={`mb-4 ${i < children.length - 1 ? "pb-5 border-b border-violet-100" : ""}`}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Prénom</label>
                      <input className="w-full border border-violet-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-violet-300 mb-3 min-h-[48px] bg-violet-50/30"
                        defaultValue={child.name} />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Couleur</div>
                      <div className="flex gap-2 mb-3">
                        {["#f43f5e","#8b5cf6","#22c55e","#f59e0b","#0ea5e9"].map(c => (
                          <button key={c} className="w-9 h-9 rounded-full border-2 border-white shadow-sm transition-all hover:scale-110"
                            style={{ background: c, outline: c === child.color ? "2px solid #7c3aed" : "none", outlineOffset: "2px" }} />
                        ))}
                      </div>
                      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>🔑</span>
                          <div className="font-bold text-violet-700 text-sm">Code d'activation enfant</div>
                        </div>
                        <div className="text-xs text-violet-500 mb-3">Donnez ce code à votre enfant pour rejoindre l'app</div>
                        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-violet-200">
                          <span className="font-black text-violet-700 tracking-widest text-xl flex-1">{child.id === 1 ? "1FELVY" : "RY690X"}</span>
                          <button className="bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all">📋 Copier</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full border-2 border-dashed border-violet-200 hover:border-violet-400 text-violet-400 hover:text-violet-600 rounded-xl py-3 text-sm font-bold transition-all min-h-[48px]">
                    + Ajouter un enfant
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-violet-500">🔒</span>
                    <div className="text-sm font-bold text-slate-700">Code d'accès parent</div>
                  </div>
                  <div className="flex gap-2">
                    <input type="password" maxLength={4}
                      className="flex-1 border border-violet-200 rounded-xl px-4 py-3 text-center text-slate-800 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-300 min-h-[48px] bg-violet-50/30"
                      placeholder="• • • •" />
                    <button className="w-12 h-12 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0">✓</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
                  <div className="text-sm font-bold text-slate-500 mb-0.5">👨‍👩‍👧 Code accès famille</div>
                  <div className="text-xs text-slate-400 mb-3">Pour un 2ème parent, une nounou ou un aidant</div>
                  <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3 border border-violet-100">
                    <span className="font-black text-slate-600 tracking-widest flex-1">2C3DF3</span>
                    <button className="text-slate-400 hover:text-violet-500 text-lg">📋</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
