import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react'
import { supabase } from '../../../../supabaseClient'
import IconPicker from '../../IconPicker'

// Sous-composant MissionItem interne
const MissionItem = ({ mission, isEditing, onEditStart, onEditSave, onEditCancel, onDelete, editState, setEditState, setShowPicker, showPicker, onIconSelect }) => (
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
        <AnimatePresence>{showPicker && <IconPicker onSelect={onIconSelect} />}</AnimatePresence>
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

export default function MissionsSection({ missions, profileId, onShowSuccess, refresh }) {
  const [newMissionTitle, setNewMissionTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('✨')
  const [showPickerForAdd, setShowPickerForAdd] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editState, setEditState] = useState({ title: '', icon: '' })
  const [showPickerForEdit, setShowPickerForEdit] = useState(false)

  const addMission = async (e) => {
    e.preventDefault(); if (!newMissionTitle.trim()) return
    const { error } = await supabase.from('missions').insert([{ 
      parent_id: profileId, 
      title: newMissionTitle, 
      icon: selectedIcon, 
      order_index: missions.length 
    }])
    if (!error) {
      setNewMissionTitle(''); setSelectedIcon('✨'); setShowPickerForAdd(false);
      onShowSuccess("Mission ajoutée !"); refresh(true);
    }
  }

  const startEditing = (mission) => {
    setEditingId(mission.id)
    setEditState({ title: mission.title, icon: mission.icon })
    setShowPickerForEdit(false)
  }

  const saveMissionEdit = async (id) => {
    const { error } = await supabase.from('missions').update({ title: editState.title, icon: editState.icon }).eq('id', id)
    if (!error) {
      setEditingId(null); setShowPickerForEdit(false);
      onShowSuccess("Mission modifiée !"); refresh(true);
    }
  }

  const deleteMission = async (id) => {
    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) { onShowSuccess("Mission supprimée"); refresh(true); }
  }

  return (
    <section className="space-y-4">
      <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-4">Édition des Missions</h3>
      
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
        <AnimatePresence>{showPickerForAdd && <IconPicker onSelect={(icon) => { setSelectedIcon(icon); setShowPickerForAdd(false); }} />}</AnimatePresence>
      </div>

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
  )
}