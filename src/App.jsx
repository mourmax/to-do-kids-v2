import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import { useFamily } from './hooks/useFamily'
import { AnimatePresence, motion } from 'framer-motion'
import ChildApp from './components/child/ChildApp'
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

  // todokids_* data for ChildApp
  const [tkMissions, setTkMissions] = useState([])
  const [tkChallenge, setTkChallenge] = useState(null)
  const [tkProfile, setTkProfile] = useState(null)

  // Onboarding stepper state (will be calculated dynamically)
  const [onboardingStep, setOnboardingStep] = useState('pin')

  // Track manual step changes to prevent auto-recalculation from overriding
  const manualStepChangeRef = useRef(false)

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
      const profilesList = profiles || []
      const isDefaultFamily = profilesList.length === 0 || (profilesList.length <= 2 && profilesList.some(p => p.child_name === "Mon enfant"))
      const dismissed = localStorage.getItem('onboarding_invite_dismissed') === 'true'

      // CRITICAL: Once dismissed, NEVER re-enter onboarding
      if (dismissed) {
        if (isOnboardingSession) setIsOnboardingSession(false)
        if (onboardingStep !== 'done') setOnboardingStep('done')
      } else if (!isOnboardingSession && onboardingStep !== 'done') {
        setIsOnboardingSession(true)
      }
    }
  }, [isLoading, !!session, !!family, isOnboardingSession, onboardingStep])

  // Handle manual onboarding termination
  const finishOnboarding = () => {
    localStorage.setItem('onboarding_invite_dismissed', 'true')
    setPinSuccessfullySet(true) // 🛡️ IMPORTANT: Prevent PinSetup screen from showing up if data is stale
    setIsOnboardingSession(false)
    setOnboardingStep('done')
    loadFamilyData()
  }

  // 3. Derived states for onboarding (Safe to use profiles here)
  const hasSeenTuto = localStorage.getItem('hasSeenTutorial_v1') === 'true'
  const parentProfile = profiles?.find(p => p.is_parent)
  const needsPinSetup = parentProfile && !pinSuccessfullySet && (!parentProfile.pin_code || localStorage.getItem('reset_pin_mode') === 'true')

  // Tutorial should show if hasn't been seen in this session OR not in localStorage
  // AND PIN setup is NOT active. New families ALWAYS get a chance to see it.
  const isDefaultFamily = (profiles || []).length <= 2 && (profiles || []).some(p => p.child_name === "Mon enfant")
  const shouldShowTutorial = (!hasSeenTuto || isDefaultFamily) && !tutorialShownInSession && !isLoading && !!session

  // Step order for onboarding - numeric values to prevent going backwards
  const STEP_ORDER = { 'pin': 1, 'child': 2, 'mission': 3, 'challenge': 4, 'done': 5 }

  // Calculate current onboarding step based on completion status
  // CRITICAL: This logic NEVER goes backwards AND never auto-advances to 'done'
  useEffect(() => {
    // Skip auto-calculation if a manual step change just happened
    if (manualStepChangeRef.current) {
      manualStepChangeRef.current = false
      return
    }

    // Don't recalculate if already at done - user must explicitly complete
    if (onboardingStep === 'done') {
      return
    }

    if (!isLoading && profiles && isOnboardingSession) {
      const childProfiles = profiles.filter(p => !p.is_parent)
      const hasConfiguredChild = childProfiles.some(p => p.child_name !== "Mon enfant")
      const hasMissions = allMissions && allMissions.length > 0
      const missionsConfirmed = localStorage.getItem('onboarding_missions_confirmed') === 'true'
      const hasConfiguredChallenge = challenge && challenge.reward_name && challenge.reward_name !== 'Cadeau Surprise' && challenge.reward_name !== 'Surprise Gift'

      // Calculate what step SHOULD be based on completion
      // NEVER auto-calculate to 'done' - max is 'invite'
      let targetStep = 'pin'
      if (parentProfile?.pin_code || pinSuccessfullySet) {
        targetStep = 'child'
        if (hasConfiguredChild) {
          targetStep = 'mission'
          if (hasMissions && missionsConfirmed) {
            targetStep = 'challenge'
          }
        }
      }

      // CRITICAL: Only update if we're moving FORWARD, never backwards
      const currentStepOrder = STEP_ORDER[onboardingStep] || 1
      const targetStepOrder = STEP_ORDER[targetStep] || 1

      if (targetStepOrder > currentStepOrder) {
        setOnboardingStep(targetStep)
      }
    }
  }, [isLoading, profiles, allMissions, challenge, parentProfile, pinSuccessfullySet, isOnboardingSession, onboardingStep])

  // 4. Tutorial trigger - NO DELAY to prevent dashboard flash
  useEffect(() => {
    if (shouldShowTutorial) {
      setShowTutorial(true)
      setTutorialShownInSession(true)
    }
  }, [shouldShowTutorial])

  // --- TODOKIDS DATA (ChildApp) ---

  const fetchChildData = useCallback(async (activeProf, familyId) => {
    if (!activeProf?.id || !familyId) return

    console.log(`[ChildData] Fetching for profile: ${activeProf.id} (${activeProf.child_name})`)

    const today = new Date().toISOString().split('T')[0]

    // Étape 1 : Charger les missions de la famille (originales) et les logs du jour
    const [missionsRes, logsRes, challengeRes] = await Promise.all([
      supabase.from('missions').select('*').eq('family_id', familyId).order('order_index'),
      supabase.from('daily_logs').select('*').eq('profile_id', activeProf.id).eq('date', today),
      supabase.from('challenges').select('*').eq('family_id', familyId).maybeSingle(),
    ])

    if (missionsRes.error) console.error('[ChildData] Erreur missions:', missionsRes.error)

    // Filtrer les missions assignées à cet enfant (ou à tous)
    const rawMissions = missionsRes.data || []
    const filteredMissions = rawMissions.filter(m => !m.assigned_to || m.assigned_to === activeProf.id)

    // Merger avec les logs (is_completed, child_validated, etc.)
    const mergedMissions = filteredMissions.map(m => {
      const log = logsRes.data?.find(l => l.mission_id === m.id)
      return {
        ...m,
        child_done: log?.child_validated || false,
        parent_validated: log?.parent_validated || false
      }
    })

    console.log('[ChildData] missions trouvées:', mergedMissions.length)

    setTkMissions(mergedMissions)
    setTkChallenge(challengeRes.data ?? null)
    setTkProfile(activeProf)
  }, [])

  useEffect(() => {
    if (!isParentMode && activeProfile && family?.id) {
      fetchChildData(activeProfile, family.id)
    }
  }, [isParentMode, activeProfile, family?.id, fetchChildData])

  const handleMissionToggle = useCallback(async (missionId, done) => {
    const today = new Date().toISOString().split('T')[0]

    // Utiliser daily_logs pour la persistance unified
    const { error } = await supabase.from('daily_logs').upsert({
      mission_id: missionId,
      profile_id: activeProfile.id,
      child_validated: done,
      date: today
    }, { onConflict: 'mission_id, profile_id, date' })

    if (error) console.error("[App] Erreur mission toggle:", error)
    setTkMissions(prev => prev.map(m => m.id === missionId ? { ...m, child_done: done } : m))
  }, [activeProfile?.id])

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
    // Reset onboarding flags to ensure fresh start after tutorial
    localStorage.removeItem('onboarding_invite_dismissed')
    localStorage.removeItem('onboarding_missions_confirmed')
    // Force onboarding mode and start at step 1
    setIsOnboardingSession(true)
    setOnboardingStep('pin')
  }

  // --- LOGIQUE D'AFFICHAGE ET SÉCURITÉ ---
  const debug = new URLSearchParams(window.location.search).get('debug') === 'true'
  if (debug) {
    console.log("[DEBUG] State:", { isLoading, session: !!session, family: !!family, profiles: profiles?.length, isParentMode, onboardingStep, isOnboardingSession })
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

  // B.5 Prevent Flicker: If we are about to show the tutorial but it hasn't triggered yet
  // This avoids seeing the PIN setup for 500ms.
  if (shouldShowTutorial && !showTutorial) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
            <img src="/icon-192.png" className="w-8 h-8 opacity-50" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">To-Do Kids</span>
        </div>
      </div>
    )
  }

  // C. Condition for PIN Setup (Only for Parent)
  // 💡 Note: During onboarding (isNewUser), we render PIN setup INSIDE ParentDashboard to keep the stepper.
  if (isParentMode && parentProfile && needsPinSetup && !showTutorial && !isOnboardingSession) {
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

  // Wrapper to handle manual step changes
  const handleManualStepChange = (step) => {
    manualStepChangeRef.current = true
    setOnboardingStep(step)
  }

  // Function to prevent automatic step recalculation (for mission/challenge operations)
  const preventStepRecalc = () => {
    manualStepChangeRef.current = true
  }

  const handleLogout = async () => {
    localStorage.removeItem('child_family_id')
    localStorage.removeItem('active_profile_id')
    localStorage.removeItem('hasSeenTutorial_v1')
    localStorage.removeItem('reset_pin_mode')
    await supabase.auth.signOut()
    window.location.reload()
  }

  // --- RENDU PRINCIPAL DE L'APPLICATION ---
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isParentMode ? 'bg-[#020617] text-slate-100 dark' : 'bg-[#F8FAFF] text-indigo-950'} font-sans selection:bg-indigo-500/30`}>

      {/* Tuto Modal (s'affiche par dessus tout) */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      {/* HEADER FIXE — masqué en mode parent (ParentDashboard gère son propre header) */}
      <div className={isParentMode ? 'hidden' : 'fixed top-0 left-0 right-0 z-50 bg-transparent'}>
        <div className={`p-4 mx-auto flex justify-between items-center transition-all ${isParentMode ? 'max-w-4xl lg:max-w-6xl' : 'max-w-3xl lg:max-w-6xl'}`}>
          {/* Logo/Title (Discret) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-white/10">
              <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`text-sm font-black uppercase italic tracking-tighter ${isParentMode ? 'text-white' : 'text-indigo-950'}`}>To-Do Kids</span>
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
                className={`${isParentMode ? 'bg-slate-900 border-white/10 text-slate-400' : 'bg-white border-indigo-100 text-indigo-400'} border px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center gap-2 group shadow-sm`}
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
              className={`${isParentMode ? 'bg-slate-900 border-white/10 text-slate-400' : 'bg-white border-indigo-100 text-indigo-400'} border p-2 rounded-xl hover:opacity-80 transition-colors shadow-sm`}
              title="Aide"
            >
              <HelpCircle size={18} />
            </button>

            {/* Bouton Déconnexion */}
            <button
              onClick={handleLogout}
              className={`border p-2 rounded-xl transition-all shadow-sm ${isParentMode ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-rose-400' : 'bg-white border-indigo-100 text-indigo-400 hover:text-rose-500'}`}
              title={t('actions.logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL (Dashboard) - Hide during tutorial OR if tutorial should show */}
      {!showTutorial && !shouldShowTutorial && (
        <div>
          <AnimatePresence mode="wait">
            {isParentMode ? (
              family ? (
                <ParentDashboard
                  key={isOnboardingSession ? 'onboarding' : 'normal'}
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
                  initialTab={(isOnboardingSession && onboardingStep !== 'done') ? 'settings' : 'validation'}
                  initialSubTab={(isOnboardingSession && onboardingStep !== 'done') ? (
                    onboardingStep === 'pin' ? 'pin' :
                      onboardingStep === 'child' ? 'children' :
                        onboardingStep === 'mission' ? 'missions' :
                          onboardingStep === 'challenge' ? 'challenge' :
                            'missions'
                  ) : 'missions'}
                  onboardingStep={onboardingStep}
                  setOnboardingStep={handleManualStepChange}
                  preventStepRecalc={preventStepRecalc}
                  onLogout={handleLogout}
                  onFinishOnboarding={finishOnboarding}
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
              <ChildApp
                key="child"
                profileId={activeProfile?.id}
                childName={tkProfile?.child_name ?? activeProfile?.child_name ?? ''}
                gender={activeProfile?.gender ?? 'boy'}
                missions={tkMissions}
                streak={tkChallenge?.streak ?? 0}
                challenge={tkChallenge ? {
                  reward_text: tkChallenge.reward_text,
                  malus_text: tkChallenge.malus_text,
                  days_completed: tkChallenge.days_completed,
                  days_total: tkChallenge.days_total,
                  status: tkChallenge.status,
                } : null}
                onMissionToggle={handleMissionToggle}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER DISCRET — masqué en mode parent */}
      {!isParentMode && (
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
      )}

      {/* MODAL PIN (pour passer en mode parent) */}
      <AnimatePresence>
        {showPinModal && (
          <ParentPinModal
            profileId={parentProfile?.id}
            hasPinSet={!!parentProfile?.pin_code}
            onSuccess={() => { setShowPinModal(false); setIsParentMode(true); }}
            onClose={() => setShowPinModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
