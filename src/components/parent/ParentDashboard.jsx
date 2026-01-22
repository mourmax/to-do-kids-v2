import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ClipboardCheck, Sliders, LogOut } from 'lucide-react' // Ajout LogOut
import { supabase } from '../../supabaseClient' // Ajout supabase
import ValidationTab from './tabs/ValidationTab'
import SettingsTab from './tabs/SettingsTab'

export default function ParentDashboard({ profile, challenge, missions, onExit, refresh }) {
  const [activeTab, setActiveTab] = useState('validation')

  // Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    // La redirection se fera automatiquement si votre App.js écoute l'état de l'auth
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen bg-[#020617] text-white">
      
      {/* HEADER AVEC LOGOUT */}
      <header className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em]">
            <ChevronLeft size={16} /> Retour Interface Enfant
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-indigo-500">Espace Parent</h1>
            {/* Bouton Déconnexion ICI */}
            <button 
              onClick={handleLogout}
              className="bg-slate-900 border border-white/10 p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 shadow-2xl relative">
          <button 
            onClick={() => setActiveTab('validation')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative ${activeTab === 'validation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <ClipboardCheck size={16} /> Validation
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Sliders size={16} /> Paramètres
          </button>
        </div>
      </header>

      {/* CONTENU */}
      <AnimatePresence mode="wait">
        {activeTab === 'validation' ? (
          <ValidationTab 
            key="validation"
            challenge={challenge}
            missions={missions}
            childName={profile?.child_name} // Important pour la modale de victoire
            refresh={refresh}
            onExit={onExit}
            onEditSettings={() => setActiveTab('settings')}
          />
        ) : (
          <SettingsTab 
            key="settings"
            profile={profile}
            challenge={challenge}
            missions={missions}
            refresh={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  )
}