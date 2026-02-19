import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Check, Crown } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'
import InviteCodeGuideModal from '../../ui/InviteCodeGuideModal'
import OnboardingCompletionModal from '../../ui/OnboardingCompletionModal'

export default function ChallengeSection({ theme = {}, challenge, onShowSuccess, refresh, isNewUser, onNextStep, profiles, onNavigateToValidation }) {
  const { t } = useTranslation()
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(2)
  const [malusMessage, setMalusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showInviteGuide, setShowInviteGuide] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Show onboarding if streak is 0 and no reward set
  const showOnboarding = isNewUser || (challenge?.current_streak === 0 && (!challenge?.reward_name || challenge?.reward_name === t('completion_modal.default_reward')))

  useEffect(() => {
    if (challenge) {
      // Logic to translate default presets if they are in French (legacy)
      let rName = challenge.reward_name || ''
      if (rName === 'Cadeau Surprise' || rName === 'Surprise Gift' || rName === t('completion_modal.default_reward')) {
        rName = ''
      }
      setRewardName(rName)

      const rawDuration = challenge.duration_days || 2
      setSeriesLength(rawDuration > 3 ? 3 : rawDuration)

      let mMsg = challenge.malus_message || ''
      if (mMsg === 'Zut ! On recommence au début' || mMsg === 'Zut ! On recommence au début.' || mMsg === 'Oops! Back to the start.' || mMsg === t('completion_modal.default_malus')) {
        mMsg = ''
      }
      setMalusMessage(mMsg)
    }
  }, [challenge?.id]) // On ne synchronise qu'au montage ou si le challenge change d'ID



  const saveChallengeSettings = async () => {
    if (!challenge?.id || isSaving) return
    setIsSaving(true)
    const finalLength = Math.max(1, parseInt(seriesLength) || 7)

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
    <div className="space-y-6">
      {showOnboarding && (
        <OnboardingInfoBlock
          step="4"
          title={t('onboarding.challenge_title')}
          description={t('onboarding.challenge_description')}
          icon={Trophy}
        />
      )}
      <SectionCard theme={theme} icon={Trophy} colorClass="text-orange-500" title={t('settings.challenge_title')}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] text-orange-500 uppercase font-black ml-1 mb-1 block">{t('settings.reward_label')}</label>
              <input
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                placeholder={t('settings.reward_placeholder')}
                className={`w-full bg-white border ${theme.border || 'border-violet-200'} rounded-xl px-4 py-2.5 font-bold outline-none text-emerald-600 focus:border-emerald-400 transition-colors`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-orange-500 uppercase font-black ml-1 mb-1 block">{t('settings.duration_label')}</label>
              <input
                type="number"
                min="1"
                max="3"
                value={seriesLength}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setSeriesLength(val > 3 ? 3 : val)
                }}
                className={`w-full bg-white border ${theme.border || 'border-violet-200'} rounded-xl px-4 py-2.5 font-bold outline-none text-slate-800 focus:border-orange-400 transition-colors`}
              />
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <Crown size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                  Limité à 3 jours max en version gratuite
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-orange-500 uppercase font-black ml-1 mb-1 block">{t('settings.malus_label')}</label>
            <input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} placeholder={t('settings.malus_placeholder')} className={`w-full bg-white border ${theme.border || 'border-violet-200'} rounded-xl px-4 py-2.5 font-bold outline-none text-rose-600 focus:border-rose-400 transition-colors`} />
          </div>

          <button
            onClick={saveChallengeSettings}
            disabled={isSaving}
            className={`w-full py-4 rounded-xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all text-white mt-2 ${isSaving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>
        </div>
      </SectionCard>

    </div>
  )
}
