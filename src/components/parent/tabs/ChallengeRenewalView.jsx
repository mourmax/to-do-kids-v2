import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Flame, Timer, Sparkles, Play, Edit3 } from 'lucide-react'
import SectionCard from '../settings/SectionCard'

export default function ChallengeRenewalView({ challenge, missionsCount, onStart, onEditMissions }) {
    const { t } = useTranslation()

    const [rewardName, setRewardName] = useState('')
    const [malusMessage, setMalusMessage] = useState('')
    const [durationDays, setDurationDays] = useState(7)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize with current challenge values
    useEffect(() => {
        if (challenge) {
            setRewardName(challenge.reward_name || '')
            setMalusMessage(challenge.malus_message || '')
            setDurationDays(challenge.duration_days || 7)
        }
    }, [challenge])

    const handleStart = async () => {
        setIsSubmitting(true)
        await onStart({
            reward_name: rewardName,
            malus_message: malusMessage,
            duration_days: durationDays
        })
        setIsSubmitting(false)
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Prêt pour la suite ?</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Configurez le prochain défi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reward */}
                <SectionCard icon={Trophy} title={t('settings.reward_title')} color="amber">
                    <input
                        value={rewardName}
                        onChange={(e) => setRewardName(e.target.value)}
                        placeholder={t('settings.reward_placeholder')}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-bold text-amber-400 focus:border-amber-500 transition-colors outline-none"
                    />
                </SectionCard>

                {/* Malus */}
                <SectionCard icon={Flame} title={t('settings.malus_title')} color="orange">
                    <input
                        value={malusMessage}
                        onChange={(e) => setMalusMessage(e.target.value)}
                        placeholder={t('settings.malus_placeholder')}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-bold text-orange-400 focus:border-orange-500 transition-colors outline-none"
                    />
                </SectionCard>

                {/* Duration */}
                <SectionCard icon={Timer} title={t('settings.duration_label')} color="indigo">
                    <div className="flex items-center gap-4 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2">
                        <button
                            onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 font-bold text-white transition-colors"
                        >
                            -
                        </button>
                        <span className="flex-1 text-center font-black text-xl text-white">{durationDays} {t('common.day_plural')}</span>
                        <button
                            onClick={() => setDurationDays(durationDays + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 font-bold text-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                </SectionCard>

                {/* Missions Summary */}
                <SectionCard icon={Sparkles} title={t('common.missions')} color="emerald">
                    <div className="flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3">
                        <span className="font-bold text-emerald-400">{missionsCount} {t('common.missions')} active(s)</span>
                        <button
                            onClick={onEditMissions}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                            title={t('actions.edit')}
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>
                </SectionCard>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleStart}
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                    {isSubmitting ? (
                        <span className="animate-spin text-xl">⏳</span>
                    ) : (
                        <>
                            <span>{t('actions.start_challenge')}</span>
                            <Play size={20} className="fill-current group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
