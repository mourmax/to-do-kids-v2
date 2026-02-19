import { CheckCircle, Timer as TimerIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ValidationMissionList({ theme, missions, onValidate }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t('validation.mission_control')}</h3>
      <div className="space-y-2 sm:space-y-3">
        {missions?.map((m) => {
          const isWaitingForParent = m.is_completed && !m.parent_validated
          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 transition-all duration-300 ${
                isWaitingForParent
                  ? 'border-violet-200 shadow-violet-50'
                  : m.parent_validated
                    ? 'border-emerald-100'
                    : `${theme.borderLight}`
              }`}
            >
              {/* Mission icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                isWaitingForParent ? 'bg-violet-50' : m.parent_validated ? 'bg-emerald-50' : theme.bg
              }`}>
                {m.icon}
              </div>

              {/* Mission info */}
              <div className="flex-1 min-w-0">
                <span className="text-gray-800 font-semibold text-sm block">{t(m.title)}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {m.is_completed ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      ✓ {t('validation.child_ok')}
                    </span>
                  ) : (
                    <span className={`text-xs text-slate-500 ${theme.progressBg} px-2 py-0.5 rounded-full`}>
                      ○ {t('validation.child_waiting')}
                    </span>
                  )}
                  {isWaitingForParent && (
                    <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      {t('validation.to_validate')}
                    </span>
                  )}
                  {(m.scheduled_times || []).map((time, idx) => (
                    <span key={idx} className={`text-xs text-slate-400 ${theme.bg} px-2 py-0.5 rounded-full flex items-center gap-1`}>
                      <TimerIcon size={10} /> {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Validate button — min 44px touch target */}
              <button
                onClick={() => onValidate(m.id, m.parent_validated)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                  m.parent_validated
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100'
                    : isWaitingForParent
                      ? 'bg-violet-100 text-violet-600 hover:bg-violet-500 hover:text-white'
                      : `${theme.progressBg} text-slate-400 hover:bg-gray-200`
                }`}
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
