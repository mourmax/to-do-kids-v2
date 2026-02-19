import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../supabaseClient'
import IconPicker from '../IconPicker'
import MissionLibrary from '../MissionLibrary'
import { useTranslation } from 'react-i18next'
import { Sparkles, Crown, Plus, Trash2, Check, X, Edit2, Library, Timer as TimerIcon, Clock, Bell } from 'lucide-react'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'
import TimePicker from '../../ui/TimePicker'

// Sous-composant MissionItem interne
const MissionItem = ({ theme = {}, mission, profiles, isEditing, onEditStart, onEditSave, onEditCancel, onDelete, editState, setEditState, setShowPicker, showPicker, onIconSelect }) => {
  const { t } = useTranslation()
  const getTargetStyle = (assigned_to) => {
    if (!assigned_to) return "text-indigo-600 bg-indigo-50 border-indigo-200"

    const profile = profiles?.find(p => p.id === assigned_to)
    const colorName = profile?.color || 'violet'

    const colorMap = {
      rose: "text-rose-600 bg-rose-50 border-rose-200",
      sky: "text-sky-600 bg-sky-50 border-sky-200",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
      amber: "text-amber-600 bg-amber-50 border-amber-200",
      violet: "text-indigo-600 bg-indigo-50 border-indigo-200"
    }

    return colorMap[colorName] || colorMap.violet
  }

  const targetStyle = getTargetStyle(mission.assigned_to)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const addTime = (time) => {
    if ((editState.scheduled_times || []).length >= 2) return
    const times = [...(editState.scheduled_times || []), time].sort()
    setEditState({ ...editState, scheduled_times: times })
  }

  const removeTime = (index) => {
    const times = [...(editState.scheduled_times || [])]
    times.splice(index, 1)
    setEditState({ ...editState, scheduled_times: times })
  }

  return (
    <div className={`bg-white p-3 rounded-2xl border ${theme.border || 'border-violet-200'} flex flex-col gap-3 shadow-sm`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 relative">
            <button onClick={() => setShowPicker(!showPicker)} className={`text-xl w-10 h-10 bg-white rounded-xl flex items-center justify-center border ${theme.border || 'border-violet-200'}`}>
              {editState.icon}
            </button>
            <input
              value={editState.title}
              onChange={(e) => setEditState({ ...editState, title: e.target.value })}
              className="flex-1 bg-transparent border-b border-violet-400 text-slate-800 font-bold text-lg outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Rappels (max 2) :</span>
              {(editState.scheduled_times || []).length < 2 && (
                <button
                  onClick={() => setShowTimePicker(true)}
                  className={`p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 border ${theme.borderLight || 'border-violet-100'} rounded-xl transition-all flex items-center gap-2 group`}
                >
                  <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Ajouter</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(editState.scheduled_times || []).map((t, idx) => (
                <div key={idx} className={`flex items-center gap-2 bg-violet-50 border ${theme.borderLight || 'border-violet-100'} rounded-xl px-3 py-2 group`}>
                  <Bell size={14} className="text-violet-500" />
                  <span className="text-xs font-black text-violet-600">{t}</span>
                  <button onClick={() => removeTime(idx)} className="p-1 hover:text-red-400 text-slate-400 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(editState.scheduled_times || []).length === 0 && (
                <p className="text-[10px] text-slate-400 italic px-2">Aucun rappel configuré</p>
              )}
            </div>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${theme.borderLight || 'border-gray-100'}`}>
            <div className="flex gap-2">
              <button
                onClick={() => setEditState({ ...editState, assigned_to: null })}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${!editState.assigned_to ? 'bg-violet-500 text-white' : 'bg-gray-100 text-slate-500 border border-gray-200'}`}
              >
                {t('common.all')}
              </button>
              {profiles?.filter(p => !p.is_parent).map(p => (
                <button
                  key={p.id}
                  onClick={() => setEditState({ ...editState, assigned_to: p.id })}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${editState.assigned_to === p.id ? 'bg-violet-500 text-white' : 'bg-gray-100 text-slate-500 border border-gray-200'}`}
                >
                  {p.child_name}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onEditSave(mission.id)}
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl"
              >
                <Check size={24} />
              </button>
              <button
                type="button"
                onClick={onEditCancel}
                className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Time Picker Modal */}
          <AnimatePresence>
            {showTimePicker && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowTimePicker(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <TimePicker onClose={() => setShowTimePicker(false)} onChange={addTime} />
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>{showPicker && <IconPicker onSelect={onIconSelect} />}</AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-2xl ${theme.bg || 'bg-violet-50'} w-12 h-12 flex items-center justify-center rounded-2xl border ${theme.borderLight || 'border-violet-100'}`}>{mission.icon}</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-800 font-black text-base leading-tight">{t(mission.title)}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${targetStyle}`}>
                  {mission.assigned_to ? profiles?.find(p => p.id === mission.assigned_to)?.child_name : t('common.all')}
                </span>
                {(mission.scheduled_times || []).map((t, idx) => (
                  <span key={idx} className="text-[10px] font-black text-violet-600 bg-violet-50 px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-violet-200 shadow-sm">
                    <Bell size={13} className="shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEditStart(mission)} className="p-2.5 rounded-2xl border-2 border-gray-200 hover:border-violet-300 text-slate-400 hover:text-slate-700 transition-all"><Edit2 size={16} /></button>
            <button onClick={() => onDelete(mission.id)} className="p-2.5 rounded-2xl border-2 border-gray-200 hover:border-rose-400 text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MissionsSection({ theme = {}, missions, profiles, familyId, onShowSuccess, refresh, isNewUser, onNextStep, preventStepRecalc }) {
  const { t } = useTranslation()
  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  const [activeTab, setActiveTab] = useState('all') // Onglet de FILTRE d'affichage
  const [newMissionTitle, setNewMissionTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('✨')
  const [newScheduledTimes, setNewScheduledTimes] = useState([])
  const [showTimePickerForAdd, setShowTimePickerForAdd] = useState(false)
  const [targetId, setTargetId] = useState(null) // Qui va avoir la NOUVELLE mission
  const [showPickerForAdd, setShowPickerForAdd] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Optimistic UI state
  const [optimisticMissions, setOptimisticMissions] = useState(missions)
  useEffect(() => { setOptimisticMissions(missions) }, [missions])

  const [editState, setEditState] = useState({ title: '', icon: '', assigned_to: null, scheduled_times: [] })
  const [showPickerForEdit, setShowPickerForEdit] = useState(false)

  // On synchronise le targetId par défaut quand on change d'onglet
  useEffect(() => {
    setTargetId(activeTab === 'all' ? null : activeTab)
  }, [activeTab])

  // Calcul du nombre de missions pour la cible  // Filtrage
  const filteredMissions = (optimisticMissions || []).filter(m => {
    if (activeTab === 'all') return true
    // Si activeTab est un ID d'enfant
    return m.assigned_to === activeTab || m.assigned_to === null // null = pour tous
  })

  // Calcul du nombre de missions pour la cible choisie (Reactive version using optimistic state)
  const getMissionCountFor = (pid) => {
    if (!pid || pid === 'all') return (optimisticMissions || []).length
    return (optimisticMissions || []).filter(m => !m.assigned_to || m.assigned_to === pid).length
  }

  const currentLevelCount = getMissionCountFor(targetId)
  const isLimitReached = currentLevelCount >= 5

  const addMission = async (title = newMissionTitle, icon = selectedIcon, times = newScheduledTimes) => {
    if (!title.trim()) return
    if (isLimitReached) {
      onShowSuccess(t('errors.mission_limit_reached'))
      return
    }

    const { error } = await supabase.from('missions').insert([{
      family_id: familyId,
      title: title,
      icon: icon,
      assigned_to: targetId,
      scheduled_times: times || [],
      order_index: (missions || []).length
    }])
    if (error) {
      console.error("Error adding mission:", error)
      onShowSuccess(`Erreur: ${error.message || "Impossible d'ajouter"}`)
    } else {
      setNewMissionTitle(''); setSelectedIcon('✨'); setNewScheduledTimes([]); setShowPickerForAdd(false); setShowLibrary(false); setShowCustomModal(false);
      onShowSuccess(t('actions.add_success'));
      if (preventStepRecalc) preventStepRecalc();
      refresh(true);
    }
  }

  const deleteMission = async (id) => {
    // Optimistic update - immediately remove from UI
    setOptimisticMissions(prev => prev.filter(m => m.id !== id));

    if (preventStepRecalc) preventStepRecalc();

    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) {
      onShowSuccess("Mission supprimée");
      // No refresh needed - optimistic state will sync when missions prop updates naturally
    } else {
      // Revert if error
      setOptimisticMissions(missions);
      onShowSuccess("Erreur lors de la suppression");
    }
  }

  const saveMissionEdit = async (id) => {
    const { error } = await supabase.from('missions').update({
      title: editState.title,
      icon: editState.icon,
      assigned_to: editState.assigned_to,
      scheduled_times: editState.scheduled_times || []
    }).eq('id', id)

    if (error) {
      console.error("Error updating mission:", error)
      onShowSuccess(`Erreur: ${error.message || "Impossible de sauvegarder"}`)
    } else {
      setEditingId(null); setShowPickerForEdit(false);
      onShowSuccess("Mission modifiée !");
      if (preventStepRecalc) preventStepRecalc();
      refresh(true);
    }
  }

  const getColorClasses = (colorName) => {
    const maps = {
      rose: 'bg-rose-500 shadow-rose-500/20',
      sky: 'bg-sky-500 shadow-sky-500/20',
      emerald: 'bg-emerald-500 shadow-emerald-500/20',
      amber: 'bg-amber-500 shadow-amber-500/20',
      violet: 'bg-indigo-500 shadow-indigo-500/20',
    }
    return maps[colorName] || maps.violet
  }

  // Show onboarding if few missions exist
  const showOnboarding = isNewUser || missions.length <= 3

  return (
    <div className="space-y-6">
      {showOnboarding && (
        <OnboardingInfoBlock
          step="3"
          title={t('onboarding.missions_title')}
          description={t('onboarding.missions_description')}
          icon={Library}
        />
      )}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t('settings.missions_title')}</h3>
        </div>

        {/* 🟢 NAVIGATION DES MISSIONS (TABS) */}
        <div className={`flex gap-2 p-1.5 bg-white border ${theme.border || 'border-violet-200'} rounded-2xl overflow-x-auto no-scrollbar`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex flex-col items-center ${activeTab === 'all' ? 'bg-violet-500 text-white shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{t('common.all')}</span>
            <span className={`text-xs font-semibold ${activeTab === 'all' ? 'text-violet-100' : 'text-slate-400'}`}>
              {getMissionCountFor(null)} mission{getMissionCountFor(null) > 1 ? 's' : ''}
            </span>
          </button>
          {childProfiles.map(p => {
            const colorClass = getColorClasses(p.color)
            const count = getMissionCountFor(p.id)
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex flex-col items-center ${activeTab === p.id ? `${colorClass} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{p.child_name}</span>
                <span className={`text-xs font-semibold ${activeTab === p.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {count} mission{count > 1 ? 's' : ''}
                </span>
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {/* 🟣 ACTIONS PRINCIPALES : BIBLIOTHÈQUE & CUSTOM */}
          <div className="grid grid-cols-2 gap-2">
            {/* Bibliothèque - Violet */}
            <button
              onClick={() => !isLimitReached && setShowLibrary(true)}
              disabled={isLimitReached}
              className={`border-2 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 group transition-all active:scale-[0.98] ${isLimitReached
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                : 'bg-violet-500 border-violet-500 hover:bg-violet-600 shadow-md shadow-violet-500/20'
                }`}
            >
              <Sparkles size={24} className={isLimitReached ? 'text-slate-400' : 'text-white group-hover:rotate-12 transition-transform'} />
              <span className={`font-black uppercase text-[10px] tracking-widest ${isLimitReached ? 'text-slate-400' : 'text-white'}`}>{t('library.library_button')}</span>
            </button>

            {/* Custom - Contour violet */}
            <button
              onClick={() => !isLimitReached && setShowCustomModal(true)}
              disabled={isLimitReached}
              className={`border-2 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 group transition-all active:scale-[0.98] ${isLimitReached
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                : 'bg-white border-violet-400 hover:border-violet-500 shadow-sm'
                }`}
            >
              <Plus size={24} className={isLimitReached ? 'text-slate-400' : 'text-violet-600 group-hover:scale-110 transition-transform'} />
              <span className={`font-black uppercase text-[10px] tracking-widest ${isLimitReached ? 'text-slate-400' : 'text-violet-600'}`}>{t('library.custom_button')}</span>
            </button>
          </div>

          {/* Mission Counter & Limit Notice */}
          {isLimitReached ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-amber-700 flex-1">
                Limite gratuite atteinte (5/5) — Passez en Premium pour en ajouter plus 🚀
              </p>
              <button className="bg-violet-500 text-white text-xs px-3 py-1 rounded-lg font-bold shrink-0 hover:bg-violet-600 transition-colors">
                Voir Premium
              </button>
            </div>
          ) : (
            <div className={`flex items-center justify-between px-4 py-2.5 bg-white border ${theme.borderLight || 'border-violet-100'} rounded-xl`}>
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quota gratuit</span>
              </div>
              <div>
                <span className={`text-sm font-black tabular-nums ${currentLevelCount >= 4 ? 'text-orange-500' : 'text-indigo-500'}`}>{currentLevelCount}</span>
                <span className="text-xs text-slate-400 font-medium"> / 5</span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showLibrary && (
              <MissionLibrary
                currentCount={getMissionCountFor(targetId)}
                onClose={() => setShowLibrary(false)}
                onSelect={(libMission) => addMission(libMission.title, libMission.icon)}
              />
            )}

            {showCustomModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowCustomModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={`bg-white border ${theme.border || 'border-violet-200'} w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-800 font-black uppercase text-xs tracking-widest">Nouvelle mission</h3>
                    <button onClick={() => setShowCustomModal(false)} className="p-2 text-slate-400 hover:text-slate-700"><X size={20} /></button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowPickerForAdd(!showPickerForAdd)} className={`bg-white border ${theme.border || 'border-violet-200'} w-16 h-16 rounded-2xl text-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0`}>
                        {selectedIcon}
                      </button>
                      <input
                        type="text"
                        value={newMissionTitle}
                        onChange={(e) => setNewMissionTitle(e.target.value)}
                        placeholder={t('actions.add_placeholder')}
                        className={`flex-1 bg-white border ${theme.border || 'border-violet-200'} rounded-2xl px-5 py-3 outline-none font-bold focus:border-violet-400 transition-colors text-slate-800 text-sm`}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Rappels (max 2) :</span>
                        {newScheduledTimes.length < 2 && (
                          <button
                            type="button"
                            onClick={() => setShowTimePickerForAdd(true)}
                            className={`p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 border ${theme.borderLight || 'border-violet-100'} rounded-xl transition-all flex items-center gap-2 group`}
                          >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Ajouter</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {newScheduledTimes.map((t, idx) => (
                          <div key={idx} className={`flex items-center gap-2 bg-violet-50 border ${theme.borderLight || 'border-violet-100'} rounded-xl px-3 py-2`}>
                            <Bell size={14} className="text-violet-500" />
                            <span className="text-xs font-black text-violet-600">{t}</span>
                            <button
                              type="button"
                              onClick={() => setNewScheduledTimes(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 hover:text-red-400 text-slate-400"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest ml-1">Affecter à :</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTargetId(null)}
                          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${!targetId ? 'bg-violet-100 border-violet-400 text-violet-700' : `bg-white ${theme.borderLight || 'border-violet-100'} text-slate-500`}`}
                        >
                          {t('common.all')}
                        </button>
                        {childProfiles.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setTargetId(p.id)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${targetId === p.id ? 'bg-violet-100 border-violet-400 text-violet-700' : `bg-white ${theme.borderLight || 'border-violet-100'} text-slate-500`}`}
                          >
                            {p.child_name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>{showPickerForAdd && <IconPicker onSelect={(icon) => { setSelectedIcon(icon); setShowPickerForAdd(false); }} />}</AnimatePresence>

                    <AnimatePresence>
                      {showTimePickerForAdd && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTimePickerForAdd(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                          />
                          <TimePicker onClose={() => setShowTimePickerForAdd(false)} onChange={(time) => {
                            if (newScheduledTimes.length < 2) {
                              setNewScheduledTimes(prev => [...prev, time].sort())
                            }
                          }} />
                        </div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => addMission()}
                      className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] bg-violet-500 hover:bg-violet-600 text-white shadow-md shadow-violet-200 transition-all active:scale-95"
                    >
                      Valider la mission
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 🔵 LISTE DES MISSIONS FILTRÉE */}
          <div className="space-y-3 pt-2 no-scrollbar" >
            {filteredMissions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Aucune mission dans cet onglet</p>
              </div>
            ) : (
              filteredMissions.map((m) => (
                <MissionItem
                  key={m.id}
                  theme={theme}
                  mission={m}
                  isEditing={editingId === m.id}
                  editState={editState}
                  setEditState={setEditState}
                  onEditStart={(mission) => {
                    setEditingId(mission.id)
                    setEditState({
                      title: t(mission.title),
                      icon: mission.icon,
                      assigned_to: mission.assigned_to,
                      scheduled_times: mission.scheduled_times || []
                    })
                    setShowPickerForEdit(false)
                  }}
                  onEditSave={saveMissionEdit}
                  onEditCancel={() => setEditingId(null)}
                  onDelete={deleteMission}
                  showPicker={showPickerForEdit}
                  setShowPicker={setShowPickerForEdit}
                  onIconSelect={(icon) => { setEditState(prev => ({ ...prev, icon })); setShowPickerForEdit(false); }}
                  profiles={profiles}
                />
              ))
            )}
          </div >

          {/* Next Step Button for Onboarding */}
          {isNewUser && missions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${theme.bg || 'bg-violet-50'} border ${theme.border || 'border-violet-200'} p-6 rounded-2xl flex flex-col items-center gap-4 text-center mt-8`}
            >
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-sm shadow-emerald-200">
                <Check size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-violet-600 tracking-widest">{t('onboarding.missions_configured')}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('onboarding.missions_configured_subtitle')}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('onboarding_missions_confirmed', 'true')
                  onNextStep('challenge')
                }}
                className="bg-violet-500 hover:bg-violet-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm shadow-violet-200 transition-all active:scale-95 animate-heartbeat"
              >
                {t('onboarding.next_step_challenge')}
              </button>
            </motion.div>
          )}
        </div >
      </section >
    </div >
  )
}
