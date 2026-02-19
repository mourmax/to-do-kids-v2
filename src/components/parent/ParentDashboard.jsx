import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Sliders } from 'lucide-react'
import ValidationTab from './tabs/ValidationTab'
import SettingsTab from './tabs/SettingsTab'
import NotificationBanner from '../ui/NotificationBanner'
import OnboardingStepper from '../ui/OnboardingStepper'
import OnboardingCompletionModal from '../ui/OnboardingCompletionModal'
import { supabase } from '../../supabaseClient'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../../services/notificationService'
import { getProfileColorClasses } from '../../utils/colors'

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
    <div className="max-w-4xl lg:max-w-6xl mx-auto space-y-6 relative z-10">
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

      {/* Background Decorative Element (Subtle) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

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

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white [.light-theme_&]:text-slate-900 mb-1">
            {t('dashboard.parent_title')}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {family?.name || t('common.family_active')}
              </span>
            </div>

            {/* Selector Profile Child for Parent (Validation context) */}
            <div className="flex items-center gap-2">
              {filteredProfilesForUI.length > 1 && (
                <div className="flex gap-1.5 p-1 bg-slate-900/60 border border-white/5 rounded-xl">
                  {filteredProfilesForUI.map(p => {
                    const isActive = profile?.id === p.id
                    const colors = getProfileColorClasses(p.color)
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSwitchProfile(p.id)
                          setActiveTab('validation')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isActive
                          ? `${colors.active} shadow-lg`
                          : `${colors.inactive} hover:bg-white/5 opacity-50`
                          }`}
                      >
                        {p.child_name}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 🔔 Button to activate notifications for parents */}
              {NotificationService.getPermissionStatus() !== 'granted' && (
                <button
                  onClick={() => NotificationService.requestPermission().then(refresh)}
                  className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/30 transition-all flex items-center gap-2"
                  title="Activer les alertes de validation"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                  🔔 Alertes
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Tab Switcher - Premium Look - Masqué pendant l'onboarding */}
        {(!isNewUser || !onboardingStep || onboardingStep === 'done') && (
          <div className="bg-slate-900/40 [.light-theme_&]:bg-indigo-500/15 backdrop-blur-xl border border-white/5 [.light-theme_&]:border-indigo-500/10 p-1 rounded-2xl flex relative shadow-2xl max-w-sm mx-auto">
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] z-0"
              animate={{ x: activeTab === 'settings' ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ left: '4px' }}
            />

            <button
              onClick={() => {
                manualTabChangeRef.current = true
                setActiveTab('validation')
              }}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl relative z-10 transition-colors ${activeTab === 'validation' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ClipboardCheck size={20} className={activeTab === 'validation' ? 'text-white' : 'text-slate-600'} />
              <span className="font-bold uppercase text-[11px] tracking-[0.15em]">{t('tabs.validation')}</span>
            </button>

            <button
              onClick={() => {
                manualTabChangeRef.current = true
                setActiveTab('settings')
              }}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl relative z-10 transition-colors ${activeTab === 'settings' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sliders size={20} className={activeTab === 'settings' ? 'text-white' : 'text-slate-600'} />
              <span className="font-bold uppercase text-[11px] tracking-[0.15em]">{t('tabs.settings')}</span>
            </button>
          </div>
        )}
      </header>

      <main className={isNewUser && onboardingStep && onboardingStep !== 'done' ? 'mt-4' : 'mt-8'}>
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
    </div >
  )
}