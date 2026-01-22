import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import { useFamily } from './hooks/useFamily'
import { AnimatePresence, motion } from 'framer-motion'
import ChildDashboard from './components/child/ChildDashboard'
import ParentDashboard from './components/parent/ParentDashboard'
import ParentPinModal from './components/ui/ParentPinModal'
import PinSetup from './components/ui/PinSetup'
import { Baby, Lock } from 'lucide-react'

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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-widest">
        Chargement...
      </div>
    )
  }

  // Configuration PIN forcée si absent
  if (profile && !profile.pin_code) {
    return <PinSetup userId={session.user.id} onComplete={refresh} />
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* --- SÉLECTEUR EN HAUT (CORRIGÉ Z-INDEX 50) --- */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-[#020617] via-[#020617]/90 to-transparent">
        <div className="bg-slate-900 border border-white/10 p-1 rounded-full flex relative shadow-2xl max-w-xs mx-auto">
          {/* Fond animé du switch */}
          <motion.div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow-lg z-0"
            initial={false}
            animate={{ x: isParentMode ? '100%' : '0%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ left: '4px' }}
          />
          
          {/* Bouton Enfant */}
          <button 
            onClick={() => setIsParentMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${!isParentMode ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Baby size={16} className="mb-0.5" />
            Enfant
          </button>

          {/* Bouton Parent */}
          <button 
            onClick={() => !isParentMode && setShowPinModal(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${isParentMode ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Lock size={14} className="mb-0.5" />
            Parent
          </button>
        </div>
      </div>

      {/* Padding top 32 (pt-32) pour que le contenu ne soit pas caché par le menu */}
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

      {/* Modal PIN */}
      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal 
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