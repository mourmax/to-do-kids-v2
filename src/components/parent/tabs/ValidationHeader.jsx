import { Trophy, RefreshCw, ListChecks, Clock, Gift, Skull, AlertCircle, Edit2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ValidationHeader({ isChallengeFinished, allMissionsDone, challenge, missionsCount, onStartNewChallenge, onDayResult, onEditSettings }) {
  const { t } = useTranslation()

  // Petit composant interne pour les lignes du récap
  const RecapItem = ({ icon: Icon, label, value, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-white/60 group-hover:text-white transition-colors" />
        <div className="text-left">
          <p className="text-[8px] uppercase text-white/50 font-bold tracking-wider">{label}</p>
          <p className="text-sm font-bold text-white">{value}</p>
        </div>
      </div>
      <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors text-white">
        <Edit2 size={12} />
      </div>
    </button>
  )

  return (
    <section className={`rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden transition-all duration-500 ${isChallengeFinished ? 'bg-gradient-to-br from-orange-500 to-red-600' : allMissionsDone ? 'bg-indigo-600' : 'bg-slate-900 border border-white/5'}`}>

      {isChallengeFinished ? (
        // --- UI FIN DE SÉRIE ---
        <div className="relative z-10 flex flex-col gap-6">
          <div className="text-center space-y-1">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Trophy size={24} className="text-white" />
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-xl">{t('validation.streak_finished')}</h3>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{t('validation.reward_unlocked')}</p>
          </div>

          <div className="space-y-2 bg-black/10 p-4 rounded-3xl border border-white/10">
            <RecapItem icon={ListChecks} label={t('common.missions')} value={t('validation.active_count', { count: missionsCount })} onClick={() => onEditSettings('missions')} />
            <RecapItem icon={Clock} label={t('validation.duration_label')} value={`${challenge?.duration_days} ${t('child.days')}`} onClick={() => onEditSettings('challenge')} />
            <RecapItem icon={Gift} label={t('validation.reward_label')} value={challenge?.reward_name} onClick={() => onEditSettings('challenge')} />
            <RecapItem icon={Skull} label={t('validation.malus_label')} value={challenge?.malus_message} onClick={() => onEditSettings('challenge')} />
          </div>

          <button
            onClick={onStartNewChallenge}
            className="w-full bg-white text-orange-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-orange-50 active:scale-95 transition-all"
          >
            <RefreshCw size={16} /> {t('validation.start_new')}
          </button>
        </div>
      ) : (
        // --- UI VERDICT JOUR ---
        <div className="relative z-10 flex flex-col gap-4 text-center">
          <h3 className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('validation.verdict')}</h3>
          {!allMissionsDone && (
            <div className="flex items-center justify-center gap-2 text-orange-400 text-[8px] font-black uppercase bg-orange-400/10 py-2 rounded-xl">
              <AlertCircle size={12} /> {t('validation.waiting_validations')}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onDayResult(true)} className={`py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl transition-all ${allMissionsDone ? 'bg-white text-indigo-600 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}>{t('validation.success')}</button>
            <button onClick={() => onDayResult(false)} className="bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all">{t('validation.fail')}</button>
          </div>
        </div>
      )}
    </section>
  )
}