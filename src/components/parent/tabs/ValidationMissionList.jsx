import { CheckCircle } from 'lucide-react'

export default function ValidationMissionList({ missions, onValidate }) {
  return (
    <section className="space-y-4">
      <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-4">Contrôle des Missions</h3>
      <div className="space-y-3">
        {missions?.map((m) => {
          const isWaitingForParent = m.is_completed && !m.parent_validated
          return (
            <div key={m.id} className={`p-4 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${isWaitingForParent ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/40 border-white/5'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl bg-slate-800 w-10 h-10 flex items-center justify-center rounded-xl">{m.icon}</span>
                <div>
                  <span className="text-white font-bold text-sm block">{m.title}</span>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase ${m.is_completed ? 'text-emerald-400' : 'text-slate-600'}`}>{m.is_completed ? '● Enfant OK' : '○ En attente enfant'}</span>
                    {isWaitingForParent && <span className="text-[8px] font-black uppercase text-indigo-400 animate-pulse">| À VALIDER</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onValidate(m.id, m.parent_validated)} 
                className={`p-3 rounded-xl transition-all ${m.parent_validated ? 'bg-emerald-500 text-white shadow-lg' : isWaitingForParent ? 'bg-indigo-600 text-white shadow-lg animate-bounce-subtle' : 'bg-slate-800 text-slate-500'}`}
              >
                <CheckCircle size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}