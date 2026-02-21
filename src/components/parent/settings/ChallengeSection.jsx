import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { useTranslation } from 'react-i18next'
import OnboardingCompletionModal from '../../ui/OnboardingCompletionModal'

const BONUS_IDEAS = [
  '🎬 Soirée ciné — choix du film en famille',
  '🍕 Pizza party — commande de son choix',
  '🎮 +1h de jeu vidéo ce week-end',
  '🛍️ Sortie shopping — petit budget perso',
  '🌟 Coucher 30 min plus tard',
  "🎡 Sortie parc d'attraction",
  '🧁 Atelier cuisine — dessert préféré',
  '🎨 Activité créative au choix',
  '📱 +30 min d\'écran par jour',
  '🏊 Piscine ou bowling avec un ami',
]

const MALUS_IDEAS = [
  '📱 Privé d\'écran pendant 24h',
  '🛁 Une corvée supplémentaire',
  '🎮 Console rangée pendant 2 jours',
  '🌜 Coucher 30 min plus tôt',
  '🍭 Pas de dessert au repas suivant',
  '📺 Pas de dessin animé aujourd\'hui',
  '🚴 20 min de sport obligatoire',
  '🤫 Pas d\'amis ce week-end',
  '🎉 Sortie prévue repoussée',
  '📚 20 min de lecture imposée',
]

export default function ChallengeSection({ theme = {}, challenge, profile, onShowSuccess, refresh, isNewUser, onNextStep, profiles, onNavigateToValidation }) {
  const { t } = useTranslation()
  const profileId = profile?.id || '__default__'

  const [settingsByChild, setSettingsByChild] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showRewardIdeas, setShowRewardIdeas] = useState(false)
  const [showMalusIdeas, setShowMalusIdeas] = useState(false)

  // Derived settings for the current profile
  const settings = settingsByChild[profileId] || { rewardName: '', seriesLength: 2, malusMessage: '' }
  const { rewardName, seriesLength, malusMessage } = settings

  const updateSetting = (key, val) => {
    setSettingsByChild(prev => ({
      ...prev,
      [profileId]: { ...(prev[profileId] || { rewardName: '', seriesLength: 2, malusMessage: '' }), [key]: val }
    }))
  }

  useEffect(() => {
    if (challenge) {
      setSettingsByChild(prev => {
        if (prev[profileId]) return prev

        let rName = challenge.reward_name || ''
        if (rName === 'Cadeau Surprise' || rName === 'Surprise Gift' || rName === t('completion_modal.default_reward')) {
          rName = ''
        }

        const rawDuration = challenge.duration_days || 2
        const dur = rawDuration > 3 ? 3 : rawDuration

        let mMsg = challenge.malus_message || ''
        if (mMsg === 'Zut ! On recommence au début' || mMsg === 'Zut ! On recommence au début.' || mMsg === 'Oops! Back to the start.' || mMsg === t('completion_modal.default_malus')) {
          mMsg = ''
        }

        return { ...prev, [profileId]: { rewardName: rName, seriesLength: dur, malusMessage: mMsg } }
      })
    }
  }, [challenge?.id, profileId])

  const saveChallengeSettings = async () => {
    if (!challenge?.id || isSaving) return
    setIsSaving(true)
    const finalLength = Math.max(1, parseInt(seriesLength) || 2)

    try {
      await supabase.from('challenges').update({
        reward_name: rewardName.trim(),
        duration_days: finalLength,
        malus_message: malusMessage.trim(),
        is_active: true,
        current_streak: challenge.current_streak >= challenge.duration_days ? 0 : challenge.current_streak
      }).eq('id', challenge.id).select()

      onShowSuccess(t('actions.save_success'))
      refresh(true)
      if (isNewUser && onNextStep) {
        onNextStep('done')
      }
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      console.error("Update failed:", error)
      onShowSuccess("Erreur : " + (error.message || "Problème"))
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Hero banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #0ea5e9 100%)" }}
      >
        <div className="absolute -top-4 -right-4 text-7xl opacity-10 select-none">🏆</div>
        <div className="absolute -bottom-2 -left-2 text-5xl opacity-10 select-none">⭐</div>
        <div className="relative">
          <div className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-1">
            {t('onboarding.challenge_step') || 'Étape 4'}
          </div>
          <div className="text-white font-black text-xl sm:text-2xl mb-2">Le Grand Défi 🏆</div>
          <div className="text-violet-200 text-xs sm:text-sm leading-relaxed">
            {t('onboarding.challenge_description') || "Choisissez la durée du challenge, la récompense et le malus si toutes les missions n'ont pas été réalisées"}
          </div>
        </div>
      </div>

      {/* ── Durée ── */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📅</span>
          <div>
            <div className="font-black text-slate-800 text-sm sm:text-base">Durée (jours)</div>
            <div className="text-xs text-slate-400">Combien de jours consécutifs ?</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => updateSetting('seriesLength', d)}
              className={`py-3.5 rounded-xl font-black text-lg transition-all border-2 min-h-[52px] ${seriesLength === d
                  ? 'bg-violet-500 text-white border-violet-500 shadow-md'
                  : 'bg-white text-slate-400 border-violet-100 hover:border-violet-300'
                }`}
            >{d}j</button>
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

      {/* ── Récompense ── */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
            <div>
              <div className="font-black text-slate-800 text-sm sm:text-base">Récompense</div>
              <div className="text-xs text-emerald-600 font-semibold">Si le défi est relevé ✓</div>
            </div>
          </div>
          <button
            onClick={() => { setShowRewardIdeas(v => !v); setShowMalusIdeas(false) }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${showRewardIdeas
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-emerald-600 border-emerald-300 hover:border-emerald-400'
              }`}
          >
            💡 Idées
          </button>
        </div>

        {showRewardIdeas && (
          <div className="mb-3 flex flex-wrap gap-2">
            {BONUS_IDEAS.map((idea, i) => (
              <button
                key={i}
                onClick={() => { updateSetting('rewardName', idea); setShowRewardIdeas(false) }}
                className="text-left text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                {idea}
              </button>
            ))}
          </div>
        )}

        <input
          value={rewardName}
          onChange={(e) => updateSetting('rewardName', e.target.value)}
          placeholder="Ex : Un ticket de cinema"
          className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white min-h-[48px]"
        />
      </div>

      {/* ── Sanction / Malus ── */}
      <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-400 flex items-center justify-center text-xl flex-shrink-0">⚡</div>
            <div>
              <div className="font-black text-slate-800 text-sm sm:text-base">Sanction (Malus)</div>
              <div className="text-xs text-rose-500 font-semibold">Si une journée est ratée ✗</div>
            </div>
          </div>
          <button
            onClick={() => { setShowMalusIdeas(v => !v); setShowRewardIdeas(false) }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${showMalusIdeas
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-white text-rose-600 border-rose-300 hover:border-rose-400'
              }`}
          >
            💡 Idées
          </button>
        </div>

        {showMalusIdeas && (
          <div className="mb-3 flex flex-wrap gap-2">
            {MALUS_IDEAS.map((idea, i) => (
              <button
                key={i}
                onClick={() => { updateSetting('malusMessage', idea); setShowMalusIdeas(false) }}
                className="text-left text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                {idea}
              </button>
            ))}
          </div>
        )}

        <input
          value={malusMessage}
          onChange={(e) => updateSetting('malusMessage', e.target.value)}
          placeholder="Ex : Privé d'écran pendant 24 heures"
          className="w-full border-2 border-rose-200 rounded-xl px-4 py-3 text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white min-h-[48px]"
        />
      </div>

      {/* ── Bouton lancer ── */}
      <button
        onClick={saveChallengeSettings}
        disabled={isSaving}
        className="w-full text-white font-black py-4 rounded-2xl text-base shadow-lg shadow-violet-200 min-h-[56px] transition-all active:scale-95 disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
      >
        {isSaving ? t('actions.saving') : '🚀 Lancer le défi !'}
      </button>
    </div>
  )
}
