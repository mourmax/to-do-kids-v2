import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Sliders, Baby, Bell } from 'lucide-react'
import ValidationTab from './tabs/ValidationTab'
import SettingsTab from './tabs/SettingsTab'
import NotificationBanner from '../ui/NotificationBanner'
import OnboardingStepper from '../ui/OnboardingStepper'
import OnboardingCompletionModal from '../ui/OnboardingCompletionModal'
import { supabase } from '../../supabaseClient'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../../services/notificationService'
import { getProfileColorClasses } from '../../utils/colors'

const AVATAR_COLORS = {
  rose:    'bg-rose-100 text-rose-600',
  sky:     'bg-sky-100 text-sky-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber:   'bg-amber-100 text-amber-600',
  violet:  'bg-violet-100 text-violet-600',
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
  onFinishOnboarding
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab)
  const [notifications, setNotifications] = useState([])
  const manualTabChangeRef = useRef(false)

  // 🛡️ CRITICAL: Sync activeTab when isNewUser changes after mount
  // This fixes the issue where useState captures 'validation' but user should be in 'settings'
  // Resync tabs when props change (crucial for onboarding -> normal transition)
  // Resync tabs when props change (crucial for onboarding -> normal transition)
  useEffect(() => {
    if (activeTab !== initialTab) {
      console.log("[DEBUG] Syncing activeTab:", initialTab)
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    // ONLY sync sub-tab if we are in onboarding AND in settings tab
    // This prevents jumping to "Gestion des enfants" when the app refreshes or completes onboarding
    if (isNewUser && onboardingStep !== 'done' && activeTab === 'settings' && initialSubTab !== activeSubTab) {
      console.log("[DEBUG] Syncing activeSubTab:", initialSubTab)
      setActiveSubTab(initialSubTab)
    }
  }, [initialSubTab, isNewUser, onboardingStep, activeTab])

  // 🛡️ Track dismissed notifications to prevent reappearance during session
  const dismissedIdsRef = useRef(new Set())

  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  // LOGIQUE DE FILTRAGE DES PROFILS (UI-ONLY)
  // Cache les placeholders "Mon enfant" s'il y a déjà au moins un enfant configuré pendant l'onboarding.
  const isConfigured = (p) => p.child_name && p.child_name !== "Mon enfant"
  const hasConfiguredAny = childProfiles.some(isConfigured)

  const filteredProfilesForUI = isNewUser && hasConfiguredAny
    ? childProfiles.filter(isConfigured)
    : childProfiles

  // ECOUTEUR TEMPS RÉEL (DEMANDES DE VALIDATION)
  useEffect(() => {
    if (!family?.id) return

    // Ensemble des profile_id appartenant à cette famille (guard client-side)
    const familyChildIds = new Set(childProfiles.map(p => p.id))

    // 1. Charger l'état initial des notifications
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

    // 2. Abonnement Realtime aux changements (Daily Logs)
    // Le filtre profile_id limite les events aux enfants de cette famille.
    // Un guard client-side vérifie en plus que l'id appartient bien à nos enfants.
    const channel = supabase
      .channel(`parent-sync-${family.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs',
          filter: `profile_id=in.(${childProfiles.map(p => p.id).join(',')})`,
        },
        async (payload) => {
          const childId = payload.new?.profile_id || payload.old?.profile_id
          // Guard client-side : ignorer les events hors de notre famille
          if (!familyChildIds.has(childId)) return

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

    // 3. Fallback visibilitychange : refresh quand l'onglet redevient actif
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


  return (
    <div className="max-w-4xl lg:max-w-6xl mx-auto space-y-5 relative z-10 font-nunito">
      {/* Onboarding Completion Modal - Final Step */}
      {isNewUser && onboardingStep === 'done' && (
        <OnboardingCompletionModal
          isOpen={true}
          onClose={() => {
            if (onFinishOnboarding) onFinishOnboarding()
          }}
          inviteCode={childProfiles.find(isConfigured)?.invite_code || childProfiles[0]?.invite_code || ''}
          onComplete={() => {
            if (onFinishOnboarding) onFinishOnboarding()
            setActiveTab('validation')
          }}
        />
      )}

      {/* Light gradient background overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-violet-50 via-white to-sky-50 z-[-1]" />

      <NotificationBanner
        notifications={notifications}
        onSelect={(childId) => {
          onSwitchProfile(childId)
          setActiveTab('validation')
          setNotifications(prev => prev.filter(n => n.profile_id !== childId))
        }}
        onDismiss={(childId) => {
          // Add to dismissed list
          dismissedIdsRef.current.add(childId)
          setNotifications(prev => prev.filter(n => n.profile_id !== childId))
        }}
      />

      <header className="space-y-4">
        {/* Onboarding Stepper - Hide immediately if invite dismissed (check localStorage directly for instant hide) */}
        {/* Onboarding Stepper - Hide if done (it shows the modal) */}
        {isNewUser && !localStorage.getItem('onboarding_invite_dismissed') && onboardingStep && onboardingStep !== 'done' && (
          <OnboardingStepper
            currentStep={onboardingStep}
            onStepClick={(step) => {
              if (setOnboardingStep) {
                setOnboardingStep(step)
                setActiveTab('settings')
                // Map step to sub-tab
                if (step === 'child') setActiveSubTab('children')
                else if (step === 'mission') setActiveSubTab('missions')
                else if (step === 'challenge') setActiveSubTab('challenge')
              }
            }}
          />
        )}

        {/* Header row: title left, actions right */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: title + family badge */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">
              {t('dashboard.parent_title')}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">
                {family?.name || t('common.family_active')}
              </span>
            </div>
          </div>

          {/* Right: alert bell + Mode Enfant */}
          <div className="flex items-center gap-2 shrink-0">
            {NotificationService.getPermissionStatus() !== 'granted' && (
              <button
                onClick={() => NotificationService.requestPermission().then(refresh)}
                className="min-h-[44px] px-3 py-2 bg-white border border-gray-200 hover:bg-amber-50 hover:border-amber-200 text-gray-600 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                title="Activer les alertes de validation"
              >
                <Bell size={15} className="text-amber-500" />
                <span className="hidden sm:inline text-gray-600">Alertes</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="min-h-[44px] px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-violet-200"
            >
              <Baby size={15} />
              <span className="hidden sm:inline">Mode Enfant</span>
            </button>
          </div>
        </div>

        {/* Child selector — horizontal scroll with fade on mobile */}
        {filteredProfilesForUI.length > 1 && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {filteredProfilesForUI.map(p => {
                const isActive = profile?.id === p.id
                const colors = getProfileColorClasses(p.color)
                const hasPending = notifications.some(n => n.profile_id === p.id)
                const avatarColors = AVATAR_COLORS[p.color] || AVATAR_COLORS.violet
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchProfile(p.id)
                      setActiveTab('validation')
                    }}
                    className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shrink-0 min-h-[48px] ${
                      isActive
                        ? `${colors.active} shadow-md`
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-violet-200 hover:bg-violet-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${isActive ? 'bg-white/20 text-white' : avatarColors}`}>
                      {p.child_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="leading-none">{p.child_name}</span>
                    {hasPending && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black leading-none">!</span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Fade gradient hint on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none sm:hidden" />
          </div>
        )}

        {/* Tab Switcher - Hidden during onboarding */}
        {(!isNewUser || !onboardingStep || onboardingStep === 'done') && (
          <div className="bg-white border border-gray-100 shadow-sm p-1 rounded-2xl flex relative max-w-sm mx-auto">
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-violet-500 rounded-xl shadow-md z-0"
              animate={{ x: activeTab === 'settings' ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ left: '4px' }}
            />

            <button
              onClick={() => {
                manualTabChangeRef.current = true
                setActiveTab('validation')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${activeTab === 'validation' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardCheck size={18} className={activeTab === 'validation' ? 'text-white' : 'text-gray-400'} />
              <span className="font-semibold text-sm">{t('tabs.validation')}</span>
              {notifications.length > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black leading-none ${activeTab === 'validation' ? 'bg-white/25 text-white' : 'bg-rose-500 text-white'}`}>
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                manualTabChangeRef.current = true
                setActiveTab('settings')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${activeTab === 'settings' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sliders size={18} className={activeTab === 'settings' ? 'text-white' : 'text-gray-400'} />
              <span className="font-semibold text-sm">{t('tabs.settings')}</span>
            </button>
          </div>
        )}
      </header>

      <main className={isNewUser && onboardingStep && onboardingStep !== 'done' ? 'mt-4' : 'mt-6'}>
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
                family={family}
                profile={profile}
                profiles={profiles}
                challenge={challenge}
                missions={allMissions}
                refresh={refresh}
                updateProfile={updateProfile} // Pass the optimistic update helper
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
      </main>
    </div>
  )
}
