import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import { useFamily } from './hooks/useFamily'
import { AnimatePresence } from 'framer-motion'
import ChildDashboard from './components/child/ChildDashboard'
import ParentDashboard from './components/parent/ParentDashboard'
import ParentPinModal from './components/ui/ParentPinModal' // Nouveau composant

export default function App() {
  const [session, setSession] = useState(null)
  const [isParentMode, setIsParentMode] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false) // État pour le modal de sécurité

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const { profile, challenge, missions, isLoading, refresh } = useFamily(session?.user?.id)

  if (!session) return <Auth />
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-widest">
        Chargement...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
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
            onParentMode={() => setShowPinModal(true)} // Déclenche le modal au lieu du switch direct
            refresh={refresh}
          />
        )}
      </AnimatePresence>

      {/* Modal de sécurité pour l'accès parent */}
      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal 
            onSuccess={() => {
              setShowPinModal(false)
              setIsParentMode(true)
            }}
            onClose={() => setShowPinModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}