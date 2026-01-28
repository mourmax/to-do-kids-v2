import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'

export default function ChallengeSection({ challenge, onShowSuccess, refresh }) {
  const { t } = useTranslation()
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(3)
  const [malusMessage, setMalusMessage] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  const isOnboarding = challenge?.current_streak === 0 && (!challenge?.reward_name || challenge?.reward_name === "Cadeau Surprise")

  useEffect(() => {
    if (challenge && !isSaving) { // Don't reset states while saving or if we just saved
      setRewardName(challenge.reward_name || '')
      setSeriesLength(challenge.duration_days || 7)
      setMalusMessage(challenge.malus_message || '')
    }
  }, [challenge, isSaving])

  const saveChallengeSettings = async () => {
    if (!challenge?.id || isSaving) return

    setIsSaving(true)
    const finalLength = Math.max(1, parseInt(seriesLength) || 7)

    try {
      console.log(`[Challenge] Attempting update for ID: ${challenge.id}`, {
        reward_name: rewardName.trim(),
        duration_days: finalLength,
        malus_message: malusMessage.trim()
      })

      const { data, error, status } = await supabase.from('challenges').update({
        reward_name: rewardName.trim(),
        duration_days: finalLength,
        malus_message: malusMessage.trim(),
        is_active: true,
        current_streak: challenge.current_streak >= challenge.duration_days ? 0 : challenge.current_streak
      }).eq('id', challenge.id).select()

      if (error) throw error

      console.log(`[Challenge] Update successful (Status: ${status}). Data:`, data)
      onShowSuccess(t('actions.save_success'))

      refresh(true)
      setTimeout(() => {
        setIsSaving(false)
        console.log("[Challenge] Saving state reset.")
      }, 1000) // Increased timeout for DB propagation safety
    } catch (error) {
      console.error("[Challenge] Update failed:", error)
      onShowSuccess("Erreur : " + (error.message || "Problème de connexion"))
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {isOnboarding && (
        <OnboardingInfoBlock
          step={5}
          title="Le Grand Défi"
          description="Choisissez la durée du challenge, la récompense et le malus... Pensez à sauvegarder !"
          icon={Trophy}
        />
      )}
      <SectionCard icon={Trophy} colorClass="text-orange-500" title={t('settings.challenge_title')}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.reward_label')}</label>
            <input value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder={t('settings.reward_placeholder')} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-orange-500 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.duration_label')}</label>
              <input
                type="number"
                min="1"
                value={seriesLength}
                onChange={(e) => setSeriesLength(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="py-3 px-4 bg-slate-900/50 rounded-2xl text-center font-black text-indigo-400 flex flex-col justify-center leading-none border border-white/5 shadow-inner">
              <span className="text-[8px] uppercase mb-1 opacity-60 text-slate-400">{t('settings.current_streak')}</span>
              Jour {challenge?.current_streak || 0}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.malus_label')}</label>
            <input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} placeholder={t('settings.malus_placeholder')} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-red-400 focus:border-red-500 transition-colors" />
          </div>

          <button
            onClick={saveChallengeSettings}
            disabled={isSaving}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all text-white mt-2 ${isSaving ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500'
              }`}
          >
            {isSaving ? "Enregistrement..." : t('actions.save')}
          </button>
        </div>
      </SectionCard>
    </div>
  )
}