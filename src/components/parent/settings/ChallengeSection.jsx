import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import { useTranslation } from 'react-i18next'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'
import InviteCodeGuideModal from '../../ui/InviteCodeGuideModal'
import OnboardingCompletionModal from '../../ui/OnboardingCompletionModal'

export default function ChallengeSection({ theme = {}, challenge, profile, onShowSuccess, refresh, isNewUser, onNextStep, profiles, onNavigateToValidation }) {
  const { t } = useTranslation()
  const profileId = profile?.id || '__default__'

  const [settingsByChild, setSettingsByChild] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showInviteGuide, setShowInviteGuide] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Derived settings for the current profile (fall back to empty defaults)
  const settings = settingsByChild[profileId] || { rewardName: '', seriesLength: 2, malusMessage: '' }
  const { rewardName, seriesLength, malusMessage } = settings

  const updateSetting = (key, val) => {
    setSettingsByChild(prev => ({
      ...prev,
      [profileId]: { ...(prev[profileId] || { rewardName: '', seriesLength: 2, malusMessage: '' }), [key]: val }
    }))
  }

  // Show onboarding if streak is 0 and no reward set
  const showOnboarding = isNewUser || (challenge?.current_streak === 0 && (!challenge?.reward_name || challenge?.reward_name === t('completion_modal.default_reward')))

  useEffect(() => {
    if (challenge) {
      // Only seed defaults when no draft exists for this profile yet
      setSettingsByChild(prev => {
        if (prev[profileId]) return prev // keep existing draft

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
      const { data, error } = await supabase.from('challenges').update({
        reward_name: rewardName.trim(),
        duration_days: finalLength,
        malus_message: malusMessage.trim(),
        is_active: true,
        current_streak: challenge.current_streak >= challenge.duration_days ? 0 : challenge.current_streak
      }).eq('id', challenge.id).select()

      if (error) throw error
      onShowSuccess(t('actions.save_success'))
      refresh(true)
      // Advance to step 5 (invite) after saving challenge
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

      {/* ── Hero banner — remplace l'OnboardingInfoBlock pâle ── */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #0ea5e9 100%)" }}>
        <div className="absolute -top-4 -right-4 text-7xl opacity-10 select-none">🏆</div>
        <div className="absolute -bottom-2 -left-2 text-5xl opacity-10 select-none">⭐</div>
        <div className="relative">
          <div className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-1">{t('onboarding.challenge_step') || 'Étape 4'}</div>
          <div className="text-white font-black text-xl sm:text-2xl mb-2">Le Grand Défi 🏆</div>
          <div className="text-violet-200 text-xs sm:text-sm leading-relaxed">
            {t('onboarding.challenge_description') || 'Définissez la récompense et ce qui se passe si le défi n\'est pas relevé.'}
          </div>
        </div>
      </div>

      {/* ── Durée ── */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📅</span>
          <div>
            <div className="font-black text-slate-800 text-sm sm:text-base">{t('settings.duration_label') || 'Durée du défi'}</div>
            <div className="text-xs text-slate-400">Combien de jours consécutifs ?</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => updateSetting('seriesLength', d)}
              className={`py-3.5 rounded-xl font-black text-lg transition-all border-2 min-h-[52px] ${
                seriesLength === d
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
          <div>
            <div className="font-black text-slate-800 text-sm sm:text-base">{t('settings.reward_label') || 'Récompense'}</div>
            <div className="text-xs text-emerald-600 font-semibold">Si le défi est relevé ✓</div>
          </div>
        </div>
        <input
          value={rewardName}
          onChange={(e) => updateSetting('rewardName', e.target.value)}
          placeholder={t('settings.reward_placeholder')}
          className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white min-h-[48px]"
        />
      </div>

      {/* ── Conséquence ── */}
      <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200 p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-400 flex items-center justify-center text-xl flex-shrink-0">⚡</div>
          <div>
            <div className="font-black text-slate-800 text-sm sm:text-base">{t('settings.malus_label') || 'Conséquence'}</div>
            <div className="text-xs text-rose-500 font-semibold">Si une journée est ratée ✗</div>
          </div>
        </div>
        <input
          value={malusMessage}
          onChange={(e) => updateSetting('malusMessage', e.target.value)}
          placeholder={t('settings.malus_placeholder')}
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
