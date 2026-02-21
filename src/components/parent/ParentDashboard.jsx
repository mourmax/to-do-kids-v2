import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Sparkles, Trophy, Users, Baby, Bell, Menu, X, LogOut } from 'lucide-react'
import ValidationTab from './tabs/ValidationTab'
import SettingsTab from './tabs/SettingsTab'
import NotificationBanner from '../ui/NotificationBanner'
import OnboardingStepper from '../ui/OnboardingStepper'
import OnboardingCompletionModal from '../ui/OnboardingCompletionModal'
import { supabase } from '../../supabaseClient'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../../services/notificationService'
import { useTheme } from '../../hooks/useTheme'

// Hex colors for child avatar pills (inline style)
const CHILD_COLORS = {
  rose: '#f43f5e',
  sky: '#0ea5e9',
  emerald: '#22c55e',
  amber: '#f59e0b',
  violet: '#8b5cf6',
}

// Hex swatches for theme selector
const SWATCH_COLORS = {
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  emerald: '#22c55e',
  rose: '#f43f5e',
  amber: '#f59e0b',
  indigo: '#6366f1',
}

export default function ParentDashboard({
  family,
  profile,
  profiles,
  challenge,
  missions,
  allMissions,
  onExit,
  onSwitchProfile,
  refresh,
  updateProfile,
  isNewUser,
  initialTab = 'validation',
  initialSubTab = 'missions',
  onboardingStep = 'child',
  setOnboardingStep,
  preventStepRecalc,
  onFinishOnboarding,
  onLogout
}) {
  const { t } = useTranslation()
  const { theme, themeKey, setTheme, THEMES } = useTheme()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab)
  const [notifications, setNotifications] = useState([])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const manualTabChangeRef = useRef(false)

  // 🛡️ CRITICAL: Sync activeTab when isNewUser changes after mount
  useEffect(() => {
    if (activeTab !== initialTab) {
      console.log("[DEBUG] Syncing activeTab:", initialTab)
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    if (isNewUser && onboardingStep !== 'done' && activeTab === 'settings' && initialSubTab !== activeSubTab) {
      console.log("[DEBUG] Syncing activeSubTab:", initialSubTab)
      setActiveSubTab(initialSubTab)
    }
  }, [initialSubTab, isNewUser, onboardingStep, activeTab])

  // 🛡️ Track dismissed notifications to prevent reappearance during session
  const dismissedIdsRef = useRef(new Set())

  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  const isConfigured = (p) => p.child_name && p.child_name !== "Mon enfant"
  const hasConfiguredAny = childProfiles.some(isConfigured)

  const filteredProfilesForUI = isNewUser && hasConfiguredAny
    ? childProfiles.filter(isConfigured)
    : childProfiles

  // ECOUTEUR TEMPS RÉEL (DEMANDES DE VALIDATION)
  useEffect(() => {
    if (!family?.id) return

    const familyChildIds = new Set(childProfiles.map(p => p.id))

    const checkPendingValidations = async () => {
      const today = new Date().toISOString().split('T')[0]
      const childIds = childProfiles.map(p => p.id)
      if (childIds.length === 0) return

      const { data } = await supabase
        .from('daily_logs')
        .select('profile_id, validation_requested, validation_result')
        .in('profile_id', childIds)
        .eq('date', today)
        .eq('validation_requested', true)
        .is('validation_result', null)

      if (data && data.length > 0) {
        const uniqueIds = [...new Set(data.map(d => d.profile_id))]
        const newNotifs = uniqueIds.map(id => {
          if (dismissedIdsRef.current.has(id)) return null
          const child = childProfiles.find(p => p.id === id)
          return child ? { profile_id: id, child_name: child.child_name } : null
        }).filter(Boolean)

        setNotifications(prev => {
          const combined = [...prev]
          newNotifs.forEach(n => {
            if (!combined.find(c => c.profile_id === n.profile_id)) {
              combined.push(n)
            }
          })
          return combined
        })
      }
    }

    checkPendingValidations()

    const channel = supabase
      .channel(`parent-sync-${family.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs',
        },
        async (payload) => {
          const childId = payload.new?.profile_id || payload.old?.profile_id
          if (!familyChildIds.has(childId)) return

          console.log('[ParentDashboard] Realtime change detected for child:', childId)

          refresh(true)

          const child = childProfiles.find(p => p.id === childId)
          if (!child) return

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            if (payload.new.validation_requested && !payload.new.validation_result) {
              if (dismissedIdsRef.current.has(child.id)) return

              setNotifications(prev => {
                if (prev.find(n => n.profile_id === child.id)) return prev

                NotificationService.sendLocalNotification(`Bravo ! ${child.child_name} a fini ! ✨`, {
                  body: "Il ou elle attend ta validation pour ses missions.",
                  tag: `validation-${child.id}`
                })

                return [...prev, { profile_id: child.id, child_name: child.child_name }]
              })
            }
            if (payload.new.validation_result) {
              setNotifications(prev => prev.filter(n => n.profile_id !== child.id))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenges',
          filter: `family_id=eq.${family.id}`
        },
        () => { refresh(true) }
      )
      .subscribe()

    const handleVisibilityChange = () => {
      if (!document.hidden) refresh(true)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [family?.id, childProfiles, refresh])

  // Synchroniser l'onglet actif avec l'étape d'onboarding
  useEffect(() => {
    if (isNewUser && onboardingStep && activeTab === 'settings') {
      const stepToSubTab = {
        'pin': 'pin',
        'child': 'children',
        'mission': 'missions',
        'challenge': 'challenge'
      }
      const targetSubTab = stepToSubTab[onboardingStep]
      if (targetSubTab && activeSubTab !== targetSubTab) {
        setActiveSubTab(targetSubTab)
      }
    }
  }, [onboardingStep, isNewUser, activeTab])

  // 🛡️ CRITICAL: Sync activeTab when isNewUser changes after mount
  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_invite_dismissed') === 'true'
    console.log("[DEBUG] Sync Effect:", { isNewUser, onboardingStep, activeTab, dismissed })

    if (isNewUser && !dismissed && onboardingStep !== 'done') {
      if (activeTab !== 'settings') {
        console.log("[DEBUG] Forcing settings")
        setActiveTab('settings')
      }
    } else if (onboardingStep === 'done' || dismissed || !isNewUser) {
      if (activeTab !== 'validation' && !manualTabChangeRef.current) {
        console.log("[DEBUG] Forcing validation")
        setActiveTab('validation')
      }
    }
  }, [isNewUser, onboardingStep, activeTab])

  // ── Sidebar nav items ──
  const NAV_ITEMS = [
    { id: 'validation', tab: 'validation', subTab: null, icon: ClipboardCheck, labelKey: 'tabs.validation' },
    { id: 'missions', tab: 'settings', subTab: 'missions', icon: Sparkles, labelKey: 'common.missions' },
    { id: 'challenge', tab: 'settings', subTab: 'challenge', icon: Trophy, labelKey: 'common.challenge' },
    { id: 'children', tab: 'settings', subTab: 'children', icon: Users, labelKey: 'common.children_tab' },
  ]

  const activeNavId =
    activeTab === 'validation' ? 'validation'
      : activeSubTab === 'missions' ? 'missions'
        : activeSubTab === 'challenge' ? 'challenge'
          : 'children'

  const handleNavClick = (item) => {
    manualTabChangeRef.current = true
    setActiveTab(item.tab)
    if (item.subTab) setActiveSubTab(item.subTab)
    setMobileNavOpen(false)
  }

  return (
    <div className={`min-h-screen ${theme.bg} font-nunito`}>

      {/* Onboarding Completion Modal */}
      {isNewUser && onboardingStep === 'done' && (
        <OnboardingCompletionModal
          isOpen={true}
          onClose={() => { if (onFinishOnboarding) onFinishOnboarding() }}
          inviteCode={childProfiles.find(isConfigured)?.invite_code || childProfiles[0]?.invite_code || ''}
          onComplete={() => {
            if (onFinishOnboarding) onFinishOnboarding()
            setActiveTab('validation')
          }}
        />
      )}

      <NotificationBanner
        notifications={notifications}
        onSelect={(childId) => {
          onSwitchProfile(childId)
          setActiveTab('validation')
          setNotifications(prev => prev.filter(n => n.profile_id !== childId))
        }}
        onDismiss={(childId) => {
          dismissedIdsRef.current.add(childId)
          setNotifications(prev => prev.filter(n => n.profile_id !== childId))
        }}
      />

      {/* ── STICKY HEADER ── */}
      <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-sm border-b ${theme.borderLight}`}>
        <div className="px-4 h-14 flex items-center justify-between gap-2">

          {/* Left: hamburger (mobile only) + logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              className={`lg:hidden w-9 h-9 rounded-xl bg-white/70 border ${theme.border} flex items-center justify-center text-slate-500`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">T</div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-800 text-base">{t('dashboard.parent_title')}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400 font-semibold">{family?.name || t('common.family_active')}</span>
              </div>
            </div>
          </div>

          {/* Right: child pills + alerts + mode enfant */}
          <div className="flex items-center gap-1.5 min-w-0">

            {/* Child pills (only when multiple children) */}
            {filteredProfilesForUI.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {filteredProfilesForUI.map(p => {
                  const isActive = profile?.id === p.id
                  const hasPending = notifications.some(n => n.profile_id === p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => { onSwitchProfile(p.id); setActiveTab('validation') }}
                      className={`relative flex items-center gap-1.5 h-9 px-3 rounded-xl font-bold text-sm transition-all shrink-0 ${isActive
                          ? 'text-white shadow-sm'
                          : `bg-white/70 border ${theme.border} text-slate-600 hover:bg-white`
                        }`}
                      style={isActive ? { background: CHILD_COLORS[p.color] || '#8b5cf6' } : {}}
                    >
                      <span className="text-xs font-black">{p.child_name?.[0]?.toUpperCase()}</span>
                      <span className="hidden sm:inline">{p.child_name}</span>
                      {hasPending && (
                        <span className={`text-[10px] font-black px-1 rounded-full ${isActive ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-600'
                          }`}>!</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Alerts bell */}
            {NotificationService.getPermissionStatus() !== 'granted' && (
              <button
                onClick={() => NotificationService.requestPermission().then(refresh)}
                className={`min-h-[36px] px-2.5 py-1.5 bg-white border ${theme.border} hover:bg-amber-50 hover:border-amber-200 text-gray-600 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shrink-0`}
                title="Activer les alertes de validation"
              >
                <Bell size={15} className="text-amber-500" />
                <span className="hidden sm:inline text-gray-600">Alertes</span>
              </button>
            )}

            {/* Mode Enfant */}
            <button
              onClick={onExit}
              className="min-h-[36px] px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-violet-200 shrink-0"
            >
              <Baby size={15} />
              <span className="hidden sm:inline">Mode Enfant</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: sidebar + main content ── */}
      <div className="flex min-h-[calc(100vh-56px)]">

        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/10 z-40 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* ── SIDEBAR ──
            Mobile: fixed drawer, slides in/out
            Desktop: static, always visible */}
        <aside className={`
          fixed lg:static
          top-14 left-0 bottom-0
          z-50
          w-52 flex-shrink-0
          ${theme.bg} lg:bg-transparent
          border-r ${theme.borderLight} lg:border-0
          transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
          px-3 py-5
        `}>

          {/* Desktop title */}
          <div className="hidden lg:block px-3 mb-5">
            <h1 className="text-base font-black text-slate-800">{t('dashboard.parent_title')}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400 font-semibold">{family?.name || t('common.family_active')}</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left w-full ${activeNavId === item.id
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-200'
                    : `text-slate-600 ${theme.sidebarHover} hover:shadow-sm`
                  }`}
              >
                <item.icon
                  size={16}
                  className={activeNavId === item.id ? 'text-white' : 'text-slate-400'}
                />
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.id === 'validation' && notifications.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${activeNavId === 'validation'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-100 text-amber-600'
                    }`}>{notifications.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Theme switcher — right after nav links */}
          <div className={`mt-3 pt-3 border-t ${theme.border}`}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Thème
            </div>
            <div className="flex gap-2 flex-wrap px-3 py-1">
              {Object.entries(THEMES).map(([key, tItem]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  title={tItem.name}
                  className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${themeKey === key ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''
                    }`}
                  style={{ background: SWATCH_COLORS[key] }}
                />
              ))}
            </div>
          </div>

          {/* Logout — at the very bottom */}
          <div className="mt-auto pt-4">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 text-sm font-semibold transition-all w-full"
              >
                <LogOut size={15} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Déconnexion</span>
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──
            Takes all remaining space. Inner content centred at max-w-2xl. */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 pt-3 lg:pt-4 pb-5 lg:pb-6">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Onboarding Stepper */}
            {isNewUser && !localStorage.getItem('onboarding_invite_dismissed') && onboardingStep && onboardingStep !== 'done' && (
              <OnboardingStepper
                currentStep={onboardingStep}
                onStepClick={(step) => {
                  if (setOnboardingStep) {
                    setOnboardingStep(step)
                    setActiveTab('settings')
                    if (step === 'child') setActiveSubTab('children')
                    else if (step === 'mission') setActiveSubTab('missions')
                    else if (step === 'challenge') setActiveSubTab('challenge')
                  }
                }}
              />
            )}

            {/* Mobile page title */}
            <div className="lg:hidden">
              <h1 className="text-lg font-black text-slate-800">
                {t(NAV_ITEMS.find(n => n.id === activeNavId)?.labelKey || 'tabs.validation')}
              </h1>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'validation' ? (
                <motion.div
                  key="validation"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ValidationTab
                    theme={theme}
                    challenge={challenge}
                    missions={missions}
                    profile={profile}
                    profiles={profiles}
                    childName={profile?.child_name}
                    refresh={refresh}
                    onExit={onExit}
                    onEditSettings={(target) => {
                      manualTabChangeRef.current = true
                      setActiveTab('settings')
                      if (target) setActiveSubTab(target)
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsTab
                    theme={theme}
                    family={family}
                    profile={profile}
                    profiles={profiles}
                    challenge={challenge}
                    missions={allMissions}
                    refresh={refresh}
                    updateProfile={updateProfile}
                    activeSubMenu={activeSubTab}
                    onSubMenuChange={setActiveSubTab}
                    isNewUser={isNewUser}
                    onTabChange={setActiveTab}
                    onboardingStep={onboardingStep}
                    setOnboardingStep={setOnboardingStep}
                    preventStepRecalc={preventStepRecalc}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  )
}
