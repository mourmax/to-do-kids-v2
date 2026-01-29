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
import { Baby, Lock, HelpCircle, LogOut, Sliders, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import RoleSelection from './components/auth/RoleSelection'
import ErrorBoundary from './components/ui/ErrorBoundary'

export default function App() {
  const { t } = useTranslation()
  const [session, setSession] = useState(null)
  const [childFamilyId, setChildFamilyId] = useState(localStorage.getItem('child_family_id'))
  const [showAuth, setShowAuth] = useState(false)
  const [isParentMode, setIsParentMode] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [error, setError] = useState(null)

  // État du tutoriel
  const [showTutorial, setShowTutorial] = useState(false)
  const [pinSuccessfullySet, setPinSuccessfullySet] = useState(false)

  // Track if this is an onboarding session
  const [isOnboardingSession, setIsOnboardingSession] = useState(false)
  const [tutorialShownInSession, setTutorialShownInSession] = useState(false)

  // Onboarding stepper state (will be calculated dynamically)
  const [onboardingStep, setOnboardingStep] = useState('pin')

  // 1. Session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s && !localStorage.getItem('child_family_id')) {
        setIsParentMode(true)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) {
        setShowAuth(false)
        setIsParentMode(true) // Force parent interface on login
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // 2. Data loading (Call this BEFORE using its values)
  const { family, profiles, activeProfile, challenge, missions, allMissions, isLoading, error: familyError, refresh: loadFamilyData, switchProfile, updateProfile } = useFamily(
    session?.user?.id,
    childFamilyId
  )

  // Update onboarding status based on data (Sticky)
  useEffect(() => {
    if (!isLoading && session && family) {
      const hasSeenTuto = localStorage.getItem('hasSeenTutorial_v1') === 'true'
      const isDefaultFamily = profiles.length <= 2 && profiles.some(p => p.child_name === "Mon enfant")
      const dismissed = localStorage.getItem('onboarding_invite_dismissed') === 'true'

      if ((!hasSeenTuto || isDefaultFamily) && !dismissed) {
        if (!isOnboardingSession) setIsOnboardingSession(true)
      } else if (dismissed && isOnboardingSession) {
        // Force exit if dismissed
        setIsOnboardingSession(false)
      }
    }
  }, [isLoading, !!session, !!family, profiles.length, isOnboardingSession])

  // Force exit onboarding when step becomes done
  useEffect(() => {
    if (onboardingStep === 'done') setIsOnboardingSession(false)
  }, [onboardingStep])

  // 3. Derived states for onboarding (Safe to use profiles here)
  const hasSeenTuto = localStorage.getItem('hasSeenTutorial_v1') === 'true'
  const parentProfile = profiles?.find(p => p.is_parent)
  const needsPinSetup = parentProfile && !pinSuccessfullySet && (!parentProfile.pin_code || localStorage.getItem('reset_pin_mode') === 'true')

  // Tutorial should show if hasn't been seen in this session OR not in localStorage
  // AND PIN setup is NOT active. New families ALWAYS get a chance to see it.
  const isDefaultFamily = profiles.length <= 2 && profiles.some(p => p.child_name === "Mon enfant")
  const shouldShowTutorial = (!hasSeenTuto || isDefaultFamily) && !tutorialShownInSession && !isLoading && !!session

  // Calculate current onboarding step based on completion status
  useEffect(() => {
    if (!isLoading && profiles && isOnboardingSession) {
      const childProfiles = profiles.filter(p => !p.is_parent)
      const hasConfiguredChild = childProfiles.some(p => p.child_name !== "Mon enfant")
      const hasMissions = allMissions && allMissions.length > 0
      const missionsConfirmed = localStorage.getItem('onboarding_missions_confirmed') === 'true'
      const hasConfiguredChallenge = challenge && challenge.reward_name && challenge.reward_name !== 'Cadeau Surprise' && challenge.reward_name !== 'Surprise Gift'

      // Determine current step based on what's completed
      if (!parentProfile?.pin_code && !pinSuccessfullySet) {
        setOnboardingStep('pin')
      } else if (!hasConfiguredChild) {
        setOnboardingStep('child')
      } else if (!hasMissions || !missionsConfirmed) {
        setOnboardingStep('mission')
      } else if (!hasConfiguredChallenge) {
        setOnboardingStep('challenge')
      } else {
        const dismissed = localStorage.getItem('onboarding_invite_dismissed') === 'true'
        if (dismissed) setOnboardingStep('done')
        else setOnboardingStep('invite')
      }
    }
  }, [isLoading, profiles, allMissions, challenge, parentProfile, pinSuccessfullySet, isOnboardingSession])

  // 4. Tutorial trigger
  useEffect(() => {
    if (shouldShowTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true)
        setTutorialShownInSession(true) // Mark as shown for this session
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shouldShowTutorial])

  // --- HANDLERS ---

  const handleInviteCode = async (code) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, family_id')
      .eq('invite_code', code)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profileData) throw new Error('Invalid code')

    setChildFamilyId(profileData.family_id)
    localStorage.setItem('child_family_id', profileData.family_id)
    localStorage.setItem('active_profile_id', profileData.id)
    setIsParentMode(false) // Force Child Mode
    loadFamilyData()
  }

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial_v1', 'true')
  }

  // --- LOGIQUE D'AFFICHAGE ET SÉCURITÉ ---
  const debug = new URLSearchParams(window.location.search).get('debug') === 'true'
  if (debug) {
    console.log("[DEBUG] State:", { isLoading, session: !!session, family: !!family, profiles: profiles?.length, isParentMode })
  }

  // A. Initial Loading State (Global)
  // 💡 FIX: Only show full screen loading if we have NO data yet.
  // This prevents flickering on silent refreshes.
  if (isLoading && !family && !familyError) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">
        {t('auth.loading')}
      </div>
    )
  }

  // B. Auth & Role Selection
  if (!session && !childFamilyId) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} />
    }
    return (
      <RoleSelection
        onSelectParent={() => setShowAuth(true)}
        onSelectChild={handleInviteCode}
      />
    )
  }

  // C. Condition for PIN Setup (Only for Parent)
  // 💡 Note: TutorialModal will render on top of Dashboard if triggered.
  // We allow rendering the main dashboard structure but keep PIN setup as a priority early return IF tutorial is NOT active.
  if (isParentMode && parentProfile && needsPinSetup && !showTutorial) {
    return (
      <PinSetup
        profileId={parentProfile.id}
        onComplete={() => {
          localStorage.removeItem('reset_pin_mode')
          setPinSuccessfullySet(true)
          loadFamilyData()
        }}
      />
    )
  }

  // --- RENDU PRINCIPAL DE L'APPLICATION ---
  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#020617] text-slate-100 dark font-sans selection:bg-indigo-500/30">

      {/* Tuto Modal (s'affiche par dessus tout) */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      {/* HEADER FIXE */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-[#020617] via-[#020617]/90 to-transparent flex justify-between items-center">

        {/* Logo/Title (Discret) */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-white/10">
            <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-black uppercase italic tracking-tighter text-white">To-Do Kids</span>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">

          {/* Toggle Parent/Child (Uniquement si Parent Loggé) */}
          {session && (
            <button
              onClick={() => {
                if (isParentMode) {
                  setIsParentMode(false)
                } else {
                  setShowPinModal(true)
                }
              }}
              className="bg-slate-900 border border-white/10 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 group"
            >
              {isParentMode ? (
                <>
                  <Baby size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('dashboard.parent_exit')}</span>
                </>
              ) : (
                <>
                  <Sliders size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('dashboard.parent_title')}</span>
                </>
              )}
            </button>
          )}

          {/* Bouton pour relancer le Tuto */}
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Aide"
          >
            <HelpCircle size={18} />
          </button>

          {/* Bouton Déconnexion */}
          <button
            onClick={async () => {
              localStorage.removeItem('child_family_id')
              localStorage.removeItem('active_profile_id')
              localStorage.removeItem('hasSeenTutorial_v1') // Nettoyage pour tests
              localStorage.removeItem('reset_pin_mode')
              await supabase.auth.signOut()
              window.location.reload()
            }}
            className="bg-slate-900 border border-white/5 p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            title={t('actions.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL (Dashboard) */}
      <div className={`pt-32 pb-8 px-4 mx-auto transition-all duration-500 ${isParentMode ? 'max-w-4xl' : 'max-w-md'}`}>
        <AnimatePresence mode="wait">
          {isParentMode ? (
            family ? (
              <ParentDashboard
                key={isOnboardingSession ? 'onboarding' : 'classic'}
                family={family}
                profile={activeProfile}
                challenge={challenge}
                missions={missions}
                allMissions={allMissions}
                profiles={profiles}
                onExit={() => setIsParentMode(false)}
                onSwitchProfile={switchProfile}
                refresh={loadFamilyData}
                updateProfile={updateProfile}
                isNewUser={isOnboardingSession}
                initialTab={isOnboardingSession ? 'settings' : 'validation'}
                initialSubTab={isOnboardingSession ? 'children' : 'missions'}
                onboardingStep={onboardingStep}
                setOnboardingStep={setOnboardingStep}
              />
            ) : familyError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="bg-rose-500/10 p-4 rounded-full">
                  <Lock className="text-rose-500" size={32} />
                </div>
                <h2 className="text-xl font-black uppercase text-white">Erreur de chargement</h2>
                <p className="text-slate-400 text-sm max-w-xs uppercase tracking-widest leading-loose">
                  {familyError && (
                    <span className="block text-[10px] text-rose-400/70 mb-2 font-mono">CODE: {familyError}</span>
                  )}
                  {familyError === "Missing family"
                    ? "Impossible de créer votre espace famille. Vérifiez vos permissions SQL."
                    : "Un problème est survenu lors de la récupération des données."}
                </p>
                <button onClick={() => loadFamilyData()} className="px-6 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all font-black uppercase text-[10px]">
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
              </div>
            )
          ) : (
            <ChildDashboard
              key="child"
              profile={activeProfile}
              profiles={profiles}
              challenge={challenge}
              missions={missions}
              onParentMode={() => setShowPinModal(true)}
              onSwitchProfile={switchProfile}
              refresh={loadFamilyData}
              isChildSession={!session && !!childFamilyId}
            />
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DISCRET */}
      <footer className="pb-8 px-4 text-center">
        <a
          href="/legal.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-colors"
        >
          Mentions Légales & Confidentialité
        </a>
      </footer>

      {/* MODAL PIN (pour passer en mode parent) */}
      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal
            correctPin={parentProfile?.pin_code || "0000"}
            onSuccess={() => { setShowPinModal(false); setIsParentMode(true); }}
            onClose={() => setShowPinModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
