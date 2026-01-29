import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../supabaseClient'
import IconPicker from '../IconPicker'
import MissionLibrary from '../MissionLibrary'
import { useTranslation } from 'react-i18next'
import { Sparkles, Crown, Plus, Trash2, Check, X, Edit2, Library } from 'lucide-react'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'

// Sous-composant MissionItem interne
const MissionItem = ({ mission, profiles, isEditing, onEditStart, onEditSave, onEditCancel, onDelete, editState, setEditState, setShowPicker, showPicker, onIconSelect }) => {
  const { t } = useTranslation()
  const getTargetStyle = (assigned_to) => {
    if (!assigned_to) return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20 [.light-theme_&]:text-indigo-600 [.light-theme_&]:bg-white"

    const profile = profiles?.find(p => p.id === assigned_to)
    const colorName = profile?.color || 'violet'

    const colorMap = {
      rose: "text-rose-400 bg-rose-400/10 border-rose-400/20 [.light-theme_&]:text-rose-600 [.light-theme_&]:bg-white",
      sky: "text-sky-400 bg-sky-400/10 border-sky-400/20 [.light-theme_&]:text-sky-600 [.light-theme_&]:bg-white",
      emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 [.light-theme_&]:text-emerald-600 [.light-theme_&]:bg-white",
      amber: "text-amber-400 bg-amber-400/10 border-amber-400/20 [.light-theme_&]:text-amber-600 [.light-theme_&]:bg-white",
      violet: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20 [.light-theme_&]:text-indigo-600 [.light-theme_&]:bg-white"
    }

    return colorMap[colorName] || colorMap.violet
  }

  const targetStyle = getTargetStyle(mission.assigned_to)

  return (
    <div className="bg-slate-900/40 [.light-theme_&]:bg-indigo-600 p-4 rounded-[2rem] border border-white/5 [.light-theme_&]:border-transparent flex flex-col gap-4 shadow-md [.light-theme_&]:shadow-indigo-600/20">
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 relative">
            <button onClick={() => setShowPicker(!showPicker)} className="text-2xl w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              {editState.icon}
            </button>
            <input
              value={editState.title}
              onChange={(e) => setEditState({ ...editState, title: e.target.value })}
              className="flex-1 bg-transparent border-b border-indigo-500 text-white font-bold outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setEditState({ ...editState, assigned_to: null })}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${!editState.assigned_to ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
              >
                {t('common.all')}
              </button>
              {profiles?.filter(p => !p.is_parent).map(p => (
                <button
                  key={p.id}
                  onClick={() => setEditState({ ...editState, assigned_to: p.id })}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${editState.assigned_to === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                >
                  {p.child_name}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEditSave(mission.id)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={20} /></button>
              <button onClick={onEditCancel} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><X size={20} /></button>
            </div>
          </div>
          <AnimatePresence>{showPicker && <IconPicker onSelect={onIconSelect} />}</AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-slate-800 [.light-theme_&]:bg-black/20 w-10 h-10 flex items-center justify-center rounded-xl">{mission.icon}</span>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">{t(mission.title)}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${targetStyle}`}>
                  {mission.assigned_to ? profiles?.find(p => p.id === mission.assigned_to)?.child_name : t('common.all')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEditStart(mission)} className="p-2 rounded-full border-2 border-slate-500 hover:border-white text-slate-500 hover:text-white [.light-theme_&]:border-white [.light-theme_&]:text-white [.light-theme_&]:hover:bg-white [.light-theme_&]:hover:text-emerald-500 transition-all"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(mission.id)} className="p-2 rounded-full border-2 border-slate-500 hover:border-red-400 text-slate-500 hover:text-red-400 [.light-theme_&]:border-white [.light-theme_&]:text-white [.light-theme_&]:hover:bg-white [.light-theme_&]:hover:text-red-500 transition-all"><Trash2 size={14} /></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MissionsSection({ missions, profiles, familyId, onShowSuccess, refresh, isNewUser, onNextStep, preventStepRecalc }) {
  const { t } = useTranslation()
  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  const [activeTab, setActiveTab] = useState('all') // Onglet de FILTRE d'affichage
  const [newMissionTitle, setNewMissionTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('✨')
  const [targetId, setTargetId] = useState(null) // Qui va avoir la NOUVELLE mission
  const [showPickerForAdd, setShowPickerForAdd] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Optimistic UI state
  const [optimisticMissions, setOptimisticMissions] = useState(missions)
  useEffect(() => { setOptimisticMissions(missions) }, [missions])

  const [editState, setEditState] = useState({ title: '', icon: '', assigned_to: null })
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

  // Calcul du nombre de missions pour la cible choisie
  const getMissionCountFor = (pid) => {
    if (!pid || pid === 'all') return (missions || []).length
    return (missions || []).filter(m => !m.assigned_to || m.assigned_to === pid).length
  }

  const currentLevelCount = getMissionCountFor(targetId)
  const isLimitReached = currentLevelCount >= 5

  const addMission = async (title = newMissionTitle, icon = selectedIcon) => {
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
      order_index: (missions || []).length
    }])
    if (error) {
      console.error("Error adding mission:", error)
      onShowSuccess("Erreur lors de l'ajout")
    } else {
      setNewMissionTitle(''); setSelectedIcon('✨'); setShowPickerForAdd(false); setShowLibrary(false); setShowCustomModal(false);
      onShowSuccess(t('actions.add_success'));
      if (preventStepRecalc) preventStepRecalc();
      refresh(true);
    }
  }

  const deleteMission = async (id) => {
    // Optimistic update
    setOptimisticMissions(prev => prev.filter(m => m.id !== id));

    if (preventStepRecalc) preventStepRecalc();

    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) {
      onShowSuccess("Mission supprimée");
      refresh(true);
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
      assigned_to: editState.assigned_to
    }).eq('id', id)
    if (!error) {
      setEditingId(null); setShowPickerForEdit(false);
      onShowSuccess("Mission modifiée !");
      if (preventStepRecalc) preventStepRecalc();
      refresh(true);
    }
  }

  const getColorClasses = (colorName) => {
    const maps = {
      rose: 'bg-rose-600 shadow-rose-600/20',
      sky: 'bg-sky-600 shadow-sky-600/20',
      emerald: 'bg-emerald-600 shadow-emerald-600/20',
      amber: 'bg-amber-600 shadow-amber-600/20',
      violet: 'bg-indigo-600 shadow-indigo-600/20',
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
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t('settings.missions_title')}</h3>
        </div>

        {/* 🟢 NAVIGATION DES MISSIONS (TABS) */}
        <div className="flex gap-2 p-1.5 bg-slate-900/40 [.light-theme_&]:bg-indigo-500/15 border border-white/5 [.light-theme_&]:border-indigo-500/10 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t('common.all')}
          </button>
          {childProfiles.map(p => {
            const colorClass = getColorClasses(p.color)
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === p.id ? `${colorClass} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
              >
                {p.child_name}
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          {/* 🟣 ACTIONS PRINCIPALES : BIBLIOTHÈQUE & CUSTOM */}
          <div className="grid grid-cols-2 gap-3">
            {/* Bibliothèque - Orange pulsant */}
            <button
              onClick={() => setShowLibrary(true)}
              className="bg-orange-500/80 border-2 border-orange-400 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 group hover:bg-orange-500/90 transition-all active:scale-[0.98] shadow-xl shadow-orange-500/40 animate-heartbeat"
            >
              <Sparkles size={24} className="text-orange-400 group-hover:rotate-12 transition-transform" />
              <span className="font-black uppercase text-[10px] tracking-widest text-orange-100">{t('library.library_button')}</span>
            </button>

            {/* Custom - Contour orange */}
            <button
              onClick={() => setShowCustomModal(true)}
              className="bg-slate-900/60 border-2 border-orange-500/50 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 group hover:bg-slate-800 hover:border-orange-500 transition-all active:scale-[0.98] shadow-lg"
            >
              <Plus size={24} className="text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="font-black uppercase text-[10px] tracking-widest text-orange-300">{t('library.custom_button')}</span>
            </button>
          </div>

          {/* Notice: 5 missions maximum */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-2">
            <Crown size={16} className="text-amber-400 shrink-0" />
            <p className="text-[9px] text-amber-200 font-bold uppercase tracking-tight">
              5 missions maximum en version gratuite
            </p>
          </div>

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
                  className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-white/10 w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest">Nouvelle mission</h3>
                    <button onClick={() => setShowCustomModal(false)} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowPickerForAdd(!showPickerForAdd)} className="bg-slate-950 border border-white/10 w-16 h-16 rounded-2xl text-2xl flex items-center justify-center transition-all active:scale-90 text-white shadow-inner shrink-0">
                        {selectedIcon}
                      </button>
                      <input
                        type="text"
                        value={newMissionTitle}
                        onChange={(e) => setNewMissionTitle(e.target.value)}
                        placeholder={t('actions.add_placeholder')}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 outline-none font-bold focus:border-indigo-500 transition-colors text-white text-sm"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest ml-1">Affecter à :</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTargetId(null)}
                          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${!targetId ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                        >
                          {t('common.all')}
                        </button>
                        {childProfiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setTargetId(p.id)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${targetId === p.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                          >
                            {p.child_name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>{showPickerForAdd && <IconPicker onSelect={(icon) => { setSelectedIcon(icon); setShowPickerForAdd(false); }} />}</AnimatePresence>

                    {isLimitReached && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
                        <Crown size={20} className="text-amber-400" />
                        <p className="text-[10px] text-amber-200 font-bold uppercase tracking-tight leading-relaxed">
                          {targetId === null
                            ? "Limite de 5 missions collectives atteinte."
                            : `Limite de 5 missions pour ${childProfiles.find(p => p.id === targetId)?.child_name} atteinte.`}
                        </p>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
                      <Crown size={32} className="text-indigo-400" />
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wide mb-2">
                          Fonctionnalité Premium Uniquement
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Créez des missions personnalisées illimitées avec la version Premium
                        </p>
                      </div>
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] bg-slate-700 text-slate-500 cursor-not-allowed"
                      >
                        Valider la mission
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 🔵 LISTE DES MISSIONS FILTRÉE */}
          <div className="space-y-3 pt-2" >
            {filteredMissions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-slate-900/20">
                <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.2em]">Aucune mission dans cet onglet</p>
              </div>
            ) : (
              filteredMissions.map((m) => (
                <MissionItem
                  key={m.id}
                  mission={m}
                  isEditing={editingId === m.id}
                  editState={editState}
                  setEditState={setEditState}
                  onEditStart={(mission) => {
                    setEditingId(mission.id)
                    setEditState({ title: mission.title, icon: mission.icon, assigned_to: mission.assigned_to })
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
              className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 text-center mt-8"
            >
              <div className="bg-indigo-500 p-2 rounded-full text-white shadow-lg shadow-indigo-600/20">
                <Check size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-indigo-400 tracking-widest">{t('onboarding.missions_configured')}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('onboarding.missions_configured_subtitle')}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('onboarding_missions_confirmed', 'true')
                  onNextStep('challenge')
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/10 transition-all active:scale-95 animate-heartbeat"
              >
                {t('onboarding.next_step_challenge')}
              </button>
            </motion.div>
          )}
        </div >
      </section >
    </div>
  )
}
