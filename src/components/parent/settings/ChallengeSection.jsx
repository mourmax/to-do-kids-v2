import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Check } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'

export default function ChallengeSection({ challenge, onShowSuccess, refresh, isNewUser, onNextStep }) {
  const { t } = useTranslation()
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(3)
  const [malusMessage, setMalusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Show onboarding if streak is 0 and no reward set
  const showOnboarding = isNewUser || (challenge?.current_streak === 0 && (!challenge?.reward_name || challenge?.reward_name === "Cadeau Surprise"))

  useEffect(() => {
    if (challenge && !isSaving) {
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
          step={null} // Remove step number
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

      {/* Finish Setup Button for Onboarding */}
      {isNewUser && challenge?.reward_name && challenge?.reward_name !== "Cadeau Surprise" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-600/10 border border-orange-500/20 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center mt-8"
        >
          <div className="bg-orange-500 p-3 rounded-full text-white shadow-lg shadow-orange-500/20">
            <Check size={24} />
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-black uppercase text-orange-400 tracking-widest">Configuration Terminée !</h4>
            <p className="text-xs text-slate-300 max-w-md">
              Tout est prêt ! Suivez les étapes ci-dessous pour connecter vos enfants.
            </p>
          </div>

          {/* Instructions pour connecter les enfants */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
              <span className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px]">1</span>
              Sur l'appareil de votre enfant
            </h5>
            <ul className="text-left text-[10px] text-slate-400 space-y-2 pl-7">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>Ouvrez l'application <strong className="text-white">To Do Kids</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>Cliquez sur <strong className="text-white">"Je suis un enfant"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>Entrez le <strong className="text-white">code d'activation</strong> de l'enfant</span>
              </li>
            </ul>

            <div className="border-t border-white/5 pt-4">
              <h5 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2 mb-3">
                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px]">2</span>
                Où trouver le code d'activation ?
              </h5>
              <p className="text-[10px] text-slate-400 text-left pl-7">
                Rendez-vous dans <strong className="text-white">Réglages → Identité</strong> pour copier le code unique de chaque enfant.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNextStep('done')}
            className="bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            Aller au tableau de bord
          </button>
        </motion.div>
      )}
    </div>
  )
}
