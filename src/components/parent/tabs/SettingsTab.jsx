import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, X, Trophy, User, Edit2 } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import IconPicker from '../IconPicker'
import Toast from '../Toast' // 👈 Import du nouveau composant

export default function SettingsTab({ profile, challenge, missions, refresh }) {
  const [childName, setChildName] = useState('')
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(3)
  const [malusMessage, setMalusMessage] = useState('')
  
  // États pour les notifications
  const [toastMessage, setToastMessage] = useState(null)

  // États Missions CRUD
  const [newMissionTitle, setNewMissionTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('✨')
  const [showPickerForAdd, setShowPickerForAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [showPickerForEdit, setShowPickerForEdit] = useState(false)

  useEffect(() => {
    if (profile?.child_name) setChildName(profile.child_name)
    if (challenge) {
      setRewardName(challenge.reward_name)
      setSeriesLength(challenge.duration_days)
      setMalusMessage(challenge.malus_message)
    }
  }, [profile, challenge])

  // Fonction pour afficher le toast temporairement
  const showSuccess = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const saveChildName = async () => {
    if (!profile?.id) return
    const { error } = await supabase.from('profiles').update({ child_name: childName }).eq('id', profile.id)
    if (!error) { 
      showSuccess("Prénom mis à jour !") // 👈 Plus d'alert
      refresh(true) 
    }
  }

  const saveChallengeSettings = async () => {
    if (!challenge?.id) return
    const { error } = await supabase.from('challenges').update({ 
      reward_name: rewardName, 
      duration_days: parseInt(seriesLength), 
      malus_message: malusMessage 
    }).eq('id', challenge.id)
    if (!error) { 
      showSuccess("Challenge enregistré !") // 👈 Plus d'alert
      refresh(true) 
    }
  }

  // --- CRUD Missions ---
  const addMission = async (e) => {
    e.preventDefault(); if (!newMissionTitle.trim()) return
    const { error } = await supabase.from('missions').insert([{ parent_id: profile.id, title: newMissionTitle, icon: selectedIcon, order_index: missions.length }])
    if (!error) {
      setNewMissionTitle('')
      setSelectedIcon('✨')
      setShowPickerForAdd(false)
      showSuccess("Mission ajoutée !")
      refresh(true)
    }
  }

  const saveMissionEdit = async (id) => {
    const { error } = await supabase.from('missions').update({ title: editTitle, icon: editIcon }).eq('id', id)
    if (!error) {
      setEditingId(null)
      setShowPickerForEdit(false)
      showSuccess("Mission modifiée !")
      refresh(true)
    }
  }

  const deleteMission = async (id) => {
    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) {
      showSuccess("Mission supprimée")
      refresh(true)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-10">
      
      {/* 🌟 AFFICHAGE DU TOAST */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* Identité */}
      <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] tracking-widest"><User size={16} /> Identité Enfant</div>
        <div className="flex gap-3">
          <input value={childName} onChange={(e) => setChildName(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none focus:border-indigo-500" />
          <button onClick={saveChildName} className="bg-indigo-600 p-3 rounded-2xl hover:bg-indigo-500 shadow-lg transition-all active:scale-90"><Check size={20}/></button>
        </div>
      </section>

      {/* Challenge */}
      <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-[10px] tracking-widest"><Trophy size={16} /> Réglages du Challenge</div>
        <div className="space-y-4">
          <div><label className="text-[9px] text-slate-500 uppercase font-black ml-1">Cadeau</label><input value={rewardName} onChange={(e) => setRewardName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[9px] text-slate-500 uppercase font-black ml-1">Série (jours)</label><input type="number" value={seriesLength} onChange={(e) => setSeriesLength(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none" /></div>
            <div className="py-3 px-4 bg-slate-800/50 rounded-2xl text-center font-black text-indigo-400 flex flex-col justify-center leading-none"><span className="text-[8px] uppercase mb-1">Actuel</span>Jour {challenge?.current_streak || 0}</div>
          </div>
          <div><label className="text-[9px] text-slate-500 uppercase font-black ml-1">Message Malus</label><input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-red-400" /></div>
          <button onClick={saveChallengeSettings} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all">Sauvegarder les réglages</button>
        </div>
      </section>

      {/* Missions CRUD */}
      <section className="space-y-4">
        <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-4">Édition des Missions</h3>
        <div className="relative mb-6">
          <form onSubmit={addMission} className="flex gap-2">
            <button type="button" onClick={() => setShowPickerForAdd(!showPickerForAdd)} className="bg-slate-900 border border-white/5 w-14 h-14 rounded-2xl text-xl flex items-center justify-center transition-all active:scale-90">{selectedIcon}</button>
            <input type="text" value={newMissionTitle} onChange={(e) => setNewMissionTitle(e.target.value)} placeholder="Ajouter..." className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 outline-none font-bold focus:border-indigo-500 transition-colors" />
            <button type="submit" className="bg-indigo-600 p-4 rounded-2xl shadow-lg active:scale-90 transition-all"><Plus size={20}/></button>
          </form>
          <AnimatePresence>{showPickerForAdd && <IconPicker onSelect={(icon) => { setSelectedIcon(icon); setShowPickerForAdd(false); }} />}</AnimatePresence>
        </div>

        <div className="space-y-3">
          {missions?.map((m) => (
            <div key={m.id} className="bg-slate-900/40 p-4 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-md">
              {editingId === m.id ? (
                <div className="flex-1 flex items-center gap-3 relative">
                  <button onClick={() => setShowPickerForEdit(!showPickerForEdit)} className="text-2xl w-10 h-10 bg-slate-800 rounded-lg">{editIcon}</button>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 bg-transparent border-b border-indigo-500 text-white font-bold outline-none" autoFocus />
                  <div className="flex gap-1"><button onClick={() => saveMissionEdit(m.id)} className="p-2 text-emerald-400"><Check size={20}/></button><button onClick={() => setEditingId(null)} className="p-2 text-red-400"><X size={20}/></button></div>
                  <AnimatePresence>{showPickerForEdit && <IconPicker onSelect={(icon) => { setEditIcon(icon); setShowPickerForEdit(false); }} />}</AnimatePresence>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3"><span className="text-2xl bg-slate-800 w-10 h-10 flex items-center justify-center rounded-xl">{m.icon}</span><span className="text-white font-bold text-sm">{m.title}</span></div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(m.id); setEditTitle(m.title); setEditIcon(m.icon); }} className="p-3 text-slate-500 hover:text-white transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => deleteMission(m.id)} className="p-3 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}