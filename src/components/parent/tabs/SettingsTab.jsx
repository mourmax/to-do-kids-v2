import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, X, Trophy, User, Edit2 } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import IconPicker from '../IconPicker'
import Toast from '../Toast'

// --- 1. Sous-composant pour le style des cartes (Factorisation CSS) ---
const SectionCard = ({ icon: Icon, colorClass, title, children }) => (
  <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
    <div className={`flex items-center gap-2 ${colorClass} font-black uppercase text-[10px] tracking-widest`}>
      <Icon size={16} /> {title}
    </div>
    {children}
  </section>
)

// --- 2. Sous-composant pour une ligne de mission (Factorisation de la liste) ---
const MissionItem = ({ mission, isEditing, onEditStart, onEditSave, onEditCancel, onDelete, editState, setEditState, setShowPicker, showPicker, onIconSelect }) => {
  return (
    <div className="bg-slate-900/40 p-4 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-md">
      {isEditing ? (
        <div className="flex-1 flex items-center gap-3 relative">
          <button onClick={() => setShowPicker(!showPicker)} className="text-2xl w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            {editState.icon}
          </button>
          <input 
            value={editState.title} 
            onChange={(e) => setEditState({ ...editState, title: e.target.value })} 
            className="flex-1 bg-transparent border-b border-indigo-500 text-white font-bold outline-none" 
            autoFocus 
          />
          <div className="flex gap-1">
            <button onClick={() => onEditSave(mission.id)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={20}/></button>
            <button onClick={onEditCancel} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><X size={20}/></button>
          </div>
          <AnimatePresence>
            {showPicker && <IconPicker onSelect={onIconSelect} />}
          </AnimatePresence>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-slate-800 w-10 h-10 flex items-center justify-center rounded-xl">{mission.icon}</span>
            <span className="text-white font-bold text-sm">{mission.title}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEditStart(mission)} className="p-3 text-slate-500 hover:text-white transition-colors"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(mission.id)} className="p-3 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
          </div>
        </>
      )}
    </div>
  )
}

// --- 3. Composant Principal ---
export default function SettingsTab({ profile, challenge, missions, refresh }) {
  // États Challenge & Profil
  const [childName, setChildName] = useState('')
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(3)
  const [malusMessage, setMalusMessage] = useState('')
  
  // États UI
  const [toastMessage, setToastMessage] = useState(null)

  // États Missions (Ajout)
  const [newMissionTitle, setNewMissionTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('✨')
  const [showPickerForAdd, setShowPickerForAdd] = useState(false)

  // États Missions (Édition)
  const [editingId, setEditingId] = useState(null)
  const [editState, setEditState] = useState({ title: '', icon: '' })
  const [showPickerForEdit, setShowPickerForEdit] = useState(false)

  // Chargement des données
  useEffect(() => {
    if (profile?.child_name) setChildName(profile.child_name)
    if (challenge) {
      setRewardName(challenge.reward_name)
      setSeriesLength(challenge.duration_days)
      setMalusMessage(challenge.malus_message)
    }
  }, [profile, challenge])

  const showSuccess = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // --- LOGIQUE SAUVEGARDE ---

  const saveChildName = async () => {
    if (!profile?.id) return
    const { error } = await supabase.from('profiles').update({ child_name: childName }).eq('id', profile.id)
    if (!error) { showSuccess("Prénom mis à jour !"); refresh(true) }
  }

  const saveChallengeSettings = async () => {
    if (!challenge?.id) return
    
    // 🛡️ SÉCURITÉ CRITIQUE : Force min 1 pour éviter NaN
    const finalLength = Math.max(1, parseInt(seriesLength) || 1)
    
    const { error } = await supabase.from('challenges').update({ 
      reward_name: rewardName, 
      duration_days: finalLength, 
      malus_message: malusMessage 
    }).eq('id', challenge.id)

    if (!error) { 
      setSeriesLength(finalLength) // Mise à jour UI avec valeur sûre
      showSuccess("Challenge enregistré !"); 
      refresh(true) 
    }
  }

  // --- LOGIQUE MISSIONS ---

  const addMission = async (e) => {
    e.preventDefault(); if (!newMissionTitle.trim()) return
    const { error } = await supabase.from('missions').insert([{ 
      parent_id: profile.id, 
      title: newMissionTitle, 
      icon: selectedIcon, 
      order_index: missions.length 
    }])
    if (!error) {
      setNewMissionTitle(''); setSelectedIcon('✨'); setShowPickerForAdd(false);
      showSuccess("Mission ajoutée !"); refresh(true);
    }
  }

  const startEditing = (mission) => {
    setEditingId(mission.id)
    setEditState({ title: mission.title, icon: mission.icon })
    setShowPickerForEdit(false)
  }

  const saveMissionEdit = async (id) => {
    const { error } = await supabase.from('missions').update({ 
      title: editState.title, 
      icon: editState.icon 
    }).eq('id', id)
    if (!error) {
      setEditingId(null); setShowPickerForEdit(false);
      showSuccess("Mission modifiée !"); refresh(true);
    }
  }

  const deleteMission = async (id) => {
    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) { showSuccess("Mission supprimée"); refresh(true); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-10">
      
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* SECTION 1 : IDENTITÉ */}
      <SectionCard icon={User} colorClass="text-indigo-400" title="Identité Enfant">
        <div className="flex gap-3">
          <input 
            value={childName} 
            onChange={(e) => setChildName(e.target.value)} 
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-indigo-500 transition-colors" 
          />
          <button onClick={saveChildName} className="bg-indigo-600 p-3 rounded-2xl hover:bg-indigo-500 shadow-lg text-white active:scale-95 transition-all">
            <Check size={20}/>
          </button>
        </div>
      </SectionCard>

      {/* SECTION 2 : CHALLENGE */}
      <SectionCard icon={Trophy} colorClass="text-orange-500" title="Réglages du Challenge">
        <div className="space-y-4">
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Cadeau</label>
            <input value={rewardName} onChange={(e) => setRewardName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-white" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Série (jours)</label>
              <input 
                type="number" 
                min="1" 
                value={seriesLength} 
                onChange={(e) => setSeriesLength(e.target.value)} 
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-white" 
              />
            </div>
            <div className="py-3 px-4 bg-slate-800/50 rounded-2xl text-center font-black text-indigo-400 flex flex-col justify-center leading-none">
              <span className="text-[8px] uppercase mb-1">Actuel</span>
              Jour {challenge?.current_streak || 0}
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Message Malus</label>
            <input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-red-400" />
          </div>
          
          <button onClick={saveChallengeSettings} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all text-white">
            Sauvegarder les réglages
          </button>
        </div>
      </SectionCard>

      {/* SECTION 3 : MISSIONS */}
      <section className="space-y-4">
        <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-4">Édition des Missions</h3>
        
        {/* Formulaire d'ajout */}
        <div className="relative mb-6">
          <form onSubmit={addMission} className="flex gap-2">
            <button type="button" onClick={() => setShowPickerForAdd(!showPickerForAdd)} className="bg-slate-900 border border-white/5 w-14 h-14 rounded-2xl text-xl flex items-center justify-center transition-all active:scale-90 text-white">
              {selectedIcon}
            </button>
            <input 
              type="text" 
              value={newMissionTitle} 
              onChange={(e) => setNewMissionTitle(e.target.value)} 
              placeholder="Ajouter une mission..." 
              className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 outline-none font-bold focus:border-indigo-500 transition-colors text-white" 
            />
            <button type="submit" className="bg-indigo-600 p-4 rounded-2xl shadow-lg active:scale-90 transition-all text-white">
              <Plus size={20}/>
            </button>
          </form>
          <AnimatePresence>
            {showPickerForAdd && <IconPicker onSelect={(icon) => { setSelectedIcon(icon); setShowPickerForAdd(false); }} />}
          </AnimatePresence>
        </div>

        {/* Liste des missions */}
        <div className="space-y-3">
          {missions?.map((m) => (
            <MissionItem 
              key={m.id}
              mission={m}
              isEditing={editingId === m.id}
              editState={editState}
              setEditState={setEditState}
              onEditStart={startEditing}
              onEditSave={saveMissionEdit}
              onEditCancel={() => setEditingId(null)}
              onDelete={deleteMission}
              showPicker={showPickerForEdit}
              setShowPicker={setShowPickerForEdit}
              onIconSelect={(icon) => { setEditState(prev => ({ ...prev, icon })); setShowPickerForEdit(false); }}
            />
          ))}
        </div>
      </section>
    </motion.div>
  )
}