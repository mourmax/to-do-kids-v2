import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Flame, Timer, Sparkles, Play, Edit3, Trash2, Check, X, Plus, Library } from 'lucide-react'
import SectionCard from '../settings/SectionCard'
import { supabase } from '../../../supabaseClient'
import IconPicker from '../IconPicker'
import MissionLibrary from '../MissionLibrary'

export default function ChallengeRenewalView({ challenge, missions, profiles, familyId, onStart, onEditMissions, refresh }) {
    const { t } = useTranslation()

    const [rewardName, setRewardName] = useState('')
    const [malusMessage, setMalusMessage] = useState('')
    const [durationDays, setDurationDays] = useState(7)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // States pour l'édition inline
    const [editingId, setEditingId] = useState(null)
    const [editState, setEditState] = useState({ title: '', icon: '', assigned_to: null, scheduled_time: '' })
    const [showPickerForEdit, setShowPickerForEdit] = useState(false)

    // States pour l'ajout inline
    const [showLibrary, setShowLibrary] = useState(false)
    const [showQuickAdd, setShowQuickAdd] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newIcon, setNewIcon] = useState('✨')
    const [newTargetId, setNewTargetId] = useState(null)
    const [newScheduledTime, setNewScheduledTime] = useState('')
    const [showPickerForAdd, setShowPickerForAdd] = useState(false)

    const missionsCount = missions?.length || 0
    const isLimitReached = missionsCount >= 5

    // Initialize with current challenge values
    useEffect(() => {
        if (challenge) {
            setRewardName(challenge.reward_name || '')
            setMalusMessage(challenge.malus_message || '')
            setDurationDays(challenge.duration_days || 7)
        }
    }, [challenge?.id])

    const handleStart = async () => {
        setIsSubmitting(true)
        try {
            await onStart({
                reward_name: rewardName,
                malus_message: malusMessage,
                duration_days: durationDays
            })
        } catch (err) {
            console.error("[ChallengeRenewalView] Error in handleStart:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- Actions Missions ---
    const startEditing = (mission) => {
        setEditingId(mission.id)
        setEditState({
            title: mission.title,
            icon: mission.icon,
            assigned_to: mission.assigned_to,
            scheduled_time: mission.scheduled_time || ''
        })
        setShowPickerForEdit(false)
    }

    const saveEdit = async (id) => {
        const { error } = await supabase.from('missions').update({
            title: editState.title,
            icon: editState.icon,
            assigned_to: editState.assigned_to,
            scheduled_time: editState.scheduled_time || null
        }).eq('id', id)

        if (!error) {
            setEditingId(null)
            refresh(true)
        }
    }

    const deleteMission = async (id) => {
        const { error } = await supabase.from('missions').delete().eq('id', id)
        if (!error) refresh(true)
    }

    const addMission = async (title = newTitle, icon = newIcon, targetId = newTargetId, time = newScheduledTime) => {
        if (!title.trim() || isLimitReached) return

        const { error } = await supabase.from('missions').insert([{
            family_id: familyId,
            title: title,
            icon: icon,
            assigned_to: targetId,
            scheduled_time: time || null,
            order_index: missionsCount
        }])

        if (!error) {
            setNewTitle('')
            setNewIcon('✨')
            setNewTargetId(null)
            setNewScheduledTime('')
            setShowQuickAdd(false)
            setShowLibrary(false)
            refresh(true)
        }
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
                    <div className="flex items-center gap-4 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3">
                        <button
                            onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                            className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl hover:bg-slate-700 font-bold text-white transition-colors"
                        >
                            -
                        </button>
                        <span className="flex-1 text-center font-black text-xl text-white italic">{durationDays} {t('common.day_plural')}</span>
                        <button
                            onClick={() => setDurationDays(durationDays + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl hover:bg-slate-700 font-bold text-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                </SectionCard>

                {/* Missions Inline Management */}
                <SectionCard icon={Sparkles} title={t('common.missions')} color="emerald">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest italic">
                                {missionsCount} / 5 {t('common.missions')}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => !isLimitReached && setShowLibrary(true)}
                                    disabled={isLimitReached}
                                    className={`p-2 rounded-lg transition-colors border ${isLimitReached ? 'bg-slate-800 text-slate-600 border-white/5 opacity-50' : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20'}`}
                                    title={t('library.library_button')}
                                >
                                    <Library size={16} />
                                </button>
                                <button
                                    onClick={() => !isLimitReached && setShowQuickAdd(!showQuickAdd)}
                                    disabled={isLimitReached}
                                    className={`p-2 rounded-lg transition-colors border ${isLimitReached ? 'bg-slate-800 text-slate-600 border-white/5 opacity-50' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}
                                    title={t('library.custom_button')}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modale Bibliothèque (Inline logic) */}
                        <AnimatePresence>
                            {showLibrary && (
                                <MissionLibrary
                                    currentCount={missionsCount}
                                    onClose={() => setShowLibrary(false)}
                                    onSelect={(m) => addMission(m.title, m.icon)}
                                />
                            )}
                        </AnimatePresence>

                        {/* Quick Add Interface */}
                        <AnimatePresence>
                            {showQuickAdd && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3 mb-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowPickerForAdd(!showPickerForAdd)} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/5">
                                                {newIcon}
                                            </button>
                                            <input
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder="Nom de la mission..."
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 text-[10px] font-bold text-white focus:border-emerald-500 outline-none"
                                            />
                                            <input
                                                type="time"
                                                value={newScheduledTime}
                                                onChange={(e) => setNewScheduledTime(e.target.value)}
                                                className="w-20 bg-slate-900 border border-white/10 rounded-xl px-2 text-[10px] font-bold text-indigo-400 outline-none"
                                                title="Heure de rappel"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                                                <button onClick={() => setNewTargetId(null)} className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border transition-all ${!newTargetId ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}>
                                                    Tous
                                                </button>
                                                {profiles?.filter(p => !p.is_parent).map(p => (
                                                    <button key={p.id} onClick={() => setNewTargetId(p.id)} className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border transition-all ${newTargetId === p.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}>
                                                        {p.child_name}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => addMission()} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check size={14} /></button>
                                                <button onClick={() => setShowQuickAdd(false)} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg"><X size={14} /></button>
                                            </div>
                                        </div>
                                        <AnimatePresence>{showPickerForAdd && <IconPicker onSelect={(i) => { setNewIcon(i); setShowPickerForAdd(false); }} />}</AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                            {missions?.map(mission => (
                                <div key={mission.id} className={`transition-all ${editingId === mission.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/30 border-white/5'} border p-2 rounded-xl`}>
                                    {editingId === mission.id ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowPickerForEdit(!showPickerForEdit)} className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-sm shrink-0">
                                                    {editState.icon}
                                                </button>
                                                <input
                                                    value={editState.title}
                                                    onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                                                    className="flex-1 bg-slate-900 border-b border-emerald-500 text-[10px] font-bold text-white outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditState({ ...editState, assigned_to: null })} className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter transition-all border ${!editState.assigned_to ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                                        Tous
                                                    </button>
                                                    {profiles?.filter(p => !p.is_parent).map(p => (
                                                        <button key={p.id} onClick={() => setEditState({ ...editState, assigned_to: p.id })} className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter transition-all border ${editState.assigned_to === p.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                                            {p.child_name}
                                                        </button>
                                                    ))}
                                                    <input
                                                        type="time"
                                                        value={editState.scheduled_time}
                                                        onChange={(e) => setEditState({ ...editState, scheduled_time: e.target.value })}
                                                        className="ml-2 w-16 bg-slate-900 border border-indigo-500/30 rounded-lg px-1 text-[8px] font-bold text-indigo-400 outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => saveEdit(mission.id)} className="p-1 text-emerald-400"><Check size={16} /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-1 text-rose-400"><X size={16} /></button>
                                                </div>
                                            </div>
                                            <AnimatePresence>{showPickerForEdit && <IconPicker onSelect={(i) => { setEditState(prev => ({ ...prev, icon: i })); setShowPickerForEdit(false); }} />}</AnimatePresence>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group">
                                            <span className="text-sm shrink-0 bg-slate-950 w-7 h-7 flex items-center justify-center rounded-lg">{mission.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-[10px] font-bold text-slate-300 truncate lowercase first-letter:uppercase">{t(mission.title)}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest italic">
                                                        {mission.assigned_to ? profiles?.find(p => p.id === mission.assigned_to)?.child_name : 'Tous'}
                                                    </span>
                                                    {mission.scheduled_time && (
                                                        <span className="text-[7px] font-black text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <Timer size={8} /> {mission.scheduled_time}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(mission)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <Edit3 size={12} />
                                                </button>
                                                <button onClick={() => deleteMission(mission.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {missionsCount === 0 && (
                                <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-2xl bg-slate-950/20">
                                    <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Aucune mission configurée</p>
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleStart}
                    disabled={isSubmitting || missionsCount === 0}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group ${isSubmitting || missionsCount === 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'}`}
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
