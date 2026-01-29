import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Check } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'
import InviteCodeGuideModal from '../../ui/InviteCodeGuideModal'
import OnboardingCompletionModal from '../../ui/OnboardingCompletionModal'

export default function ChallengeSection({ challenge, onShowSuccess, refresh, isNewUser, onNextStep, profiles, onNavigateToValidation }) {
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
    if (challenge && !isSaving) {
      // Logic to translate default presets if they are in French (legacy)
      let rName = challenge.reward_name || ''
      if (rName === 'Cadeau Surprise' || rName === 'Surprise Gift') {
        rName = t('completion_modal.default_reward')
      }
      setRewardName(rName)

      setSeriesLength(challenge.duration_days || 2)

      let mMsg = challenge.malus_message || ''
      if (mMsg === 'Zut ! On recommence au début' || mMsg === 'Zut ! On recommence au début.' || mMsg === 'Oops! Back to the start.') {
        mMsg = t('completion_modal.default_malus')
      }
      setMalusMessage(mMsg)
    }
  }, [challenge, isSaving])



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
      if (isNewUser) {
        setShowInviteGuide(true)
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
      <SectionCard icon={Trophy} colorClass="text-orange-500" title={t('settings.challenge_title')}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.reward_label')}</label>
            <input value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder={t('settings.reward_placeholder')} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-orange-500 transition-colors [.light-theme_&]:bg-white [.light-theme_&]:text-slate-900 [.light-theme_&]:border-indigo-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.duration_label')}</label>
              <input
                type="number"
                min="1"
                value={seriesLength}
                onChange={(e) => setSeriesLength(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-orange-500 transition-colors [.light-theme_&]:bg-white [.light-theme_&]:text-slate-900 [.light-theme_&]:border-indigo-200"
              />
            </div>
            <div className="py-3 px-4 bg-slate-900/50 rounded-2xl text-center font-black text-indigo-400 flex flex-col justify-center leading-none border border-white/5 shadow-inner [.light-theme_&]:bg-indigo-600 [.light-theme_&]:text-white [.light-theme_&]:border-transparent">
              <span className="text-[8px] uppercase mb-1 opacity-60 text-slate-400 [.light-theme_&]:text-indigo-200">{t('settings.current_streak')}</span>
              {t('common.day_singular')} {challenge?.current_streak || 0}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.malus_label')}</label>
            <input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} placeholder={t('settings.malus_placeholder')} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-red-400 focus:border-red-500 transition-colors [.light-theme_&]:bg-white [.light-theme_&]:border-red-200" />
          </div>

          <button
            onClick={saveChallengeSettings}
            disabled={isSaving}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all text-white mt-2 ${isSaving ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500'
              }`}
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>
        </div>
      </SectionCard>

      {/* Invite Code Guide Modal */}
      <InviteCodeGuideModal
        isOpen={showInviteGuide}
        onNavigateToChildren={() => {
          setShowInviteGuide(false)
          setShowCompletionModal(true)
        }}
        onClose={() => {
          setShowInviteGuide(false)
          setShowCompletionModal(true)
        }}
      />

      {/* Onboarding Completion Modal */}
      {isNewUser && profiles && (
        <OnboardingCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          inviteCode={profiles.find(p => !p.is_parent)?.invite_code || ''}
          childName={profiles.find(p => !p.is_parent)?.child_name || 'votre enfant'}
          onComplete={() => {
            setShowCompletionModal(false)
            onNextStep('done')
            if (onNavigateToValidation) {
              onNavigateToValidation()
            }
          }}
        />
      )}
    </div>
  )
}
