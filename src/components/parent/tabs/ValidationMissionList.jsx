import { CheckCircle, Timer as TimerIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ValidationMissionList({ missions, onValidate }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-4">
      <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-4">{t('validation.mission_control')}</h3>
      <div className="space-y-3">
        {missions?.map((m) => {
          const isWaitingForParent = m.is_completed && !m.parent_validated
          return (
            <div key={m.id} className={`p-4 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${isWaitingForParent ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] [.light-theme_&]:bg-indigo-700 [.light-theme_&]:border-indigo-400' : 'bg-slate-900/40 [.light-theme_&]:bg-indigo-600 border-white/5 [.light-theme_&]:border-indigo-500 shadow-sm [.light-theme_&]:shadow-lg [.light-theme_&]:shadow-indigo-500/30'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl bg-slate-800 [.light-theme_&]:bg-white/20 [.light-theme_&]:text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-colors">{m.icon}</span>
                <div>
                  <span className="text-white font-bold text-sm block transition-colors">{t(m.title)}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase ${m.is_completed ? 'text-emerald-400 [.light-theme_&]:text-emerald-300' : 'text-slate-600 [.light-theme_&]:text-indigo-200'}`}>{m.is_completed ? `● ${t('validation.child_ok')}` : `○ ${t('validation.child_waiting')}`}</span>
                    {isWaitingForParent && <span className="text-[8px] font-black uppercase text-indigo-400 [.light-theme_&]:text-white animate-pulse">| {t('validation.to_validate')}</span>}
                    {(m.scheduled_times || []).map((time, idx) => (
                      <span key={idx} className="text-[8px] font-black uppercase text-indigo-400/60 flex items-center gap-1">
                        <TimerIcon size={10} /> {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onValidate(m.id, m.parent_validated)}
                className={`p-3 rounded-xl transition-all ${m.parent_validated ? 'bg-emerald-500 text-white shadow-lg' : isWaitingForParent ? 'bg-indigo-600 text-white shadow-lg animate-bounce-subtle [.light-theme_&]:bg-white [.light-theme_&]:text-indigo-600' : 'bg-slate-800 [.light-theme_&]:bg-black/20 text-slate-500 [.light-theme_&]:text-indigo-300 border border-transparent'}`}
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