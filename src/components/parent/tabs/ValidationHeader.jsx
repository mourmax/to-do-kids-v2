import { Trophy, RefreshCw, ListChecks, Clock, Gift, Skull, AlertCircle, Edit2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ValidationHeader({ theme, isChallengeFinished, allMissionsDone, isDaySuccess, challenge, missionsCount, onStartNewChallenge, onDayResult, onEditSettings, childColor }) {
  const { t } = useTranslation()

  const streakPercent = challenge
    ? Math.min(100, Math.round(((challenge.current_streak || 0) / (challenge.duration_days || 1)) * 100))
    : 0

  // Recap item for the challenge-finished view
  const RecapItem = ({ icon: Icon, label, value, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${theme.bg} hover:bg-violet-50 p-3 rounded-xl border ${theme.borderLight} hover:border-violet-200 transition-all group`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-gray-500 group-hover:text-violet-500 transition-colors" />
        </div>
        <div className="text-left">
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{label}</p>
          <p className="text-sm font-bold text-gray-700">{value}</p>
        </div>
      </div>
      <div className={`${theme.progressBg} group-hover:bg-violet-100 p-2 rounded-lg transition-colors`}>
        <Edit2 size={12} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
      </div>
    </button>
  )

  return (
    <section className={`rounded-2xl border ${theme.borderLight} bg-white shadow-sm overflow-hidden`}>
      {isChallengeFinished ? (
        // --- CHALLENGE FINISHED VIEW ---
        <>
          <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy size={24} className="text-white" />
            </div>
            <h3 className="text-white font-black text-xl leading-tight">{t('validation.streak_finished')}</h3>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mt-1">{t('validation.reward_unlocked')}</p>
          </div>

          <div className="p-4 space-y-2">
            <RecapItem icon={ListChecks} label={t('common.missions')} value={t('validation.active_count', { count: missionsCount })} onClick={() => onEditSettings('missions')} />
            <RecapItem icon={Clock} label={t('validation.duration_label')} value={`${challenge?.duration_days} ${t('child.days')}`} onClick={() => onEditSettings('challenge')} />
            <RecapItem icon={Gift} label={t('validation.reward_label')} value={challenge?.reward_name} onClick={() => onEditSettings('challenge')} />
            <RecapItem icon={Skull} label={t('validation.malus_label')} value={challenge?.malus_message} onClick={() => onEditSettings('challenge')} />

            <button
              onClick={onStartNewChallenge}
              className="w-full mt-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <RefreshCw size={16} /> {t('validation.start_new')}
            </button>
          </div>
        </>
      ) : (
        // --- DAILY VERDICT VIEW ---
        <>
          {/* Streak progress bar */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('validation.verdict')}</h3>
              <span className="text-xs font-bold text-gray-500">
                {challenge?.current_streak || 0} / {challenge?.duration_days} {t('child.days')}
              </span>
            </div>
            <div className={`h-1.5 ${theme.progressBg} rounded-full overflow-hidden`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${streakPercent}%`, background: childColor ? `linear-gradient(90deg, ${childColor}cc, ${childColor})` : 'linear-gradient(90deg, #a78bfa, #7c3aed)' }}
              />
            </div>
          </div>

          {/* Verdict content */}
          {isDaySuccess ? (
            <div className="bg-emerald-50 border-t border-emerald-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 animate-bounce">
                <Trophy size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-black text-emerald-700 text-sm sm:text-base">{t('dashboard.day_validated')}</p>
                {challenge?.reward_name && (
                  <p className="text-xs text-emerald-600/70 mt-0.5">{challenge.reward_name}</p>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-4 border-t ${!allMissionsDone ? 'bg-amber-50 border-amber-100' : `bg-white border-gray-100`}`}>
              {!allMissionsDone && (
                <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-3 bg-amber-100 rounded-lg px-3 py-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {t('validation.waiting_validations')}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onDayResult(true)}
                  disabled={!allMissionsDone}
                  className={`min-h-[52px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    allMissionsDone
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-sm'
                      : `${theme.progressBg} text-gray-400 cursor-not-allowed`
                  }`}
                >
                  ✓ {t('validation.success')}
                </button>
                <button
                  onClick={() => onDayResult(false)}
                  className="min-h-[52px] bg-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-600 active:scale-[0.98] transition-all shadow-sm"
                >
                  ✗ {t('validation.fail')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
