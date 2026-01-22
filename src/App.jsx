import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import { useFamily } from './hooks/useFamily'
import { AnimatePresence } from 'framer-motion'
import ChildDashboard from './components/child/ChildDashboard'
import ParentDashboard from './components/parent/ParentDashboard'
import ParentPinModal from './components/ui/ParentPinModal'
import PinSetup from './components/ui/PinSetup' // <--- NOUVEAU

export default function App() {
  const [session, setSession] = useState(null)
  const [isParentMode, setIsParentMode] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const { profile, challenge, missions, isLoading, refresh } = useFamily(session?.user?.id)

  if (!session) return <Auth />
  
  // Chargement global
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-widest">
        Chargement...
      </div>
    )
  }

  // 🚨 NOUVEAU : Si le profil existe mais n'a pas de PIN, on force la configuration
  if (profile && !profile.pin_code) {
    return <PinSetup userId={session.user.id} onComplete={refresh} />
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
            onParentMode={() => setShowPinModal(true)}
            refresh={refresh}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal 
            // On passe le vrai code PIN stocké dans le profil (ou 0000 par sécurité si bug)
            correctPin={profile?.pin_code || "0000"} 
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