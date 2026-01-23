import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import { useFamily } from './hooks/useFamily'
import { AnimatePresence, motion } from 'framer-motion'
import ChildDashboard from './components/child/ChildDashboard'
import ParentDashboard from './components/parent/ParentDashboard'
import ParentPinModal from './components/ui/ParentPinModal'
import PinSetup from './components/ui/PinSetup'
import TutorialModal from './components/ui/TutorialModal'
import { Baby, Lock, HelpCircle } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [isParentMode, setIsParentMode] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  
  // État du tutoriel
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    
    // Vérification du tutoriel au chargement (seulement si pas vu)
    const hasSeenTuto = localStorage.getItem('hasSeenTutorial_v1')
    if (!hasSeenTuto) {
      setTimeout(() => setShowTutorial(true), 1000) // Petit délai pour l'effet d'arrivée
    }

    return () => subscription.unsubscribe()
  }, [])

  const { profile, challenge, missions, isLoading, refresh } = useFamily(session?.user?.id)

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial_v1', 'true')
  }

  // --- LOGIQUE D'AFFICHAGE ET SÉCURITÉ ---

  if (!session) return <Auth />
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">
        Chargement...
      </div>
    )
  }

  // 🔥 INTERCEPTION POUR LE "CODE OUBLIÉ" OU PREMIÈRE CONNEXION
  // On vérifie deux choses :
  // 1. Est-ce que le PIN est vide en base de données ? (Première fois)
  // 2. Est-ce que le parent a demandé un reset ? (localStorage 'reset_pin_mode')
  const needsPinSetup = !profile?.pin_code || localStorage.getItem('reset_pin_mode') === 'true'

  if (profile && needsPinSetup) {
    return (
      <PinSetup 
        userId={session.user.id} 
        onComplete={() => {
          // Une fois le nouveau PIN défini, on supprime le drapeau de reset
          localStorage.removeItem('reset_pin_mode')
          refresh() // On rafraîchit les données pour passer à l'écran suivant
        }} 
      />
    )
  }

  // --- RENDU PRINCIPAL DE L'APPLICATION ---

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Tuto Modal (s'affiche par dessus tout) */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      {/* HEADER FIXE */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-[#020617] via-[#020617]/90 to-transparent flex justify-center items-start">
        
        {/* Sélecteur Central (Enfant / Parent) */}
        <div className="bg-slate-900 border border-white/10 p-1 rounded-full flex relative shadow-2xl max-w-xs w-full">
          <motion.div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow-lg z-0"
            animate={{ x: isParentMode ? '100%' : '0%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ left: '4px' }}
          />
          <button 
            onClick={() => setIsParentMode(false)} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${!isParentMode ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Baby size={16} className="mb-0.5" /> Enfant
          </button>
          <button 
            onClick={() => !isParentMode && setShowPinModal(true)} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${isParentMode ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Lock size={14} className="mb-0.5" /> Parent
          </button>
        </div>

        {/* Bouton pour relancer le Tuto (à droite) */}
        <button 
          onClick={() => setShowTutorial(true)}
          className="absolute right-4 top-5 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white border border-white/5 transition-colors active:scale-95"
          title="Revoir le tutoriel"
        >
          <HelpCircle size={20} />
        </button>

      </div>

      {/* CONTENU PRINCIPAL (Dashboard) */}
      <div className="pt-32 pb-12 px-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {isParentMode ? (
            <ParentDashboard 
              key="parent"
              profile={profile}
              challenge={challenge}
              missions={missions}
              onExit={() => setIsParentMode(false)}
              refresh={refresh}
            />
          ) : (
            <ChildDashboard 
              key="child"
              profile={profile}
              challenge={challenge}
              missions={missions}
              onParentMode={() => setShowPinModal(true)} 
              refresh={refresh}
            />
          )}
        </AnimatePresence>
      </div>

      {/* MODAL PIN (pour passer en mode parent) */}
      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal 
            correctPin={profile?.pin_code || "0000"} 
            onSuccess={() => { setShowPinModal(false); setIsParentMode(true); }}
            onClose={() => setShowPinModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}