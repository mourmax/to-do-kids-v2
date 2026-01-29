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

const getColorClasses = (colorName) => {
  const maps = {
    rose: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    sky: 'bg-sky-500/20 border-sky-500/30 text-sky-300',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    violet: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  }
  const mapsActive = {
    rose: 'bg-rose-500 text-white shadow-rose-500/20',
    sky: 'bg-sky-500 text-white shadow-sky-500/20',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/20',
    amber: 'bg-amber-500 text-white shadow-amber-500/20',
    violet: 'bg-indigo-500 text-white shadow-indigo-500/20',
  }
  return {
    inactive: maps[colorName] || maps.violet,
    active: mapsActive[colorName] || mapsActive.violet
  }
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
  preventStepRecalc
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab)
  const [notifications, setNotifications] = useState([])

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

    // Charger l'état initial des notifications
    const checkPendingValidations = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_logs')
        .select('profile_id, validation_requested, validation_result')
        .eq('date', today)
        .eq('validation_requested', true)
        .is('validation_result', null)

      if (data && data.length > 0) {
        // Regrouper par enfant unique
        const uniqueIds = [...new Set(data.map(d => d.profile_id))]
        const newNotifs = uniqueIds.map(id => {
          // If explicitly dismissed in this session, skip
          if (dismissedIdsRef.current.has(id)) return null

          const child = childProfiles.find(p => p.id === id)
          return child ? { profile_id: id, child_name: child.child_name } : null
        }).filter(Boolean)

        // Update state avoiding duplicates (and re-checking dismissed just in case)
        setNotifications(prev => {
          // Merge pending
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

    // Abonnement aux changements
    const channel = supabase
      .channel(`parent-sync-${family?.id || 'no-family'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs',
        },
        async (payload) => {
          const childId = payload.new?.profile_id || payload.old?.profile_id
          const child = childProfiles.find(p => p.id === childId)
          if (!child) return

          // 🔄 Refresh global pour mettre à jour la liste des missions
          refresh(true)

          // Gestion des notifications
          if (payload.eventType === 'UPDATE') {
            if (payload.new.validation_requested && !payload.new.validation_result) {
              // Check blocked
              if (dismissedIdsRef.current.has(child.id)) return

              setNotifications(prev => {
                if (prev.find(n => n.profile_id === child.id)) return prev
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
        () => {
          refresh(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [family?.id, childProfiles])

  // Synchroniser l'onglet actif avec l'étape d'onboarding
  useEffect(() => {
    if (isNewUser && onboardingStep && activeTab === 'settings') {
      if (onboardingStep === 'pin') setActiveSubTab('pin')
      else if (onboardingStep === 'child') setActiveSubTab('children')
      else if (onboardingStep === 'mission') setActiveSubTab('missions')
      else if (onboardingStep === 'challenge') setActiveSubTab('challenge')
      else if (onboardingStep === 'invite') setActiveSubTab('children')
    }
  }, [onboardingStep, isNewUser, activeTab])

  // 🛡️ SÉCURITÉ : Forcer l'onglet settings tant que l'onboarding n'est pas "done"
  useEffect(() => {
    if (isNewUser && activeTab !== 'settings' && onboardingStep !== 'done' && onboardingStep !== 'invite') {
      setActiveTab('settings')
    }
  }, [isNewUser, activeTab, onboardingStep])


  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      {/* Onboarding Completion Modal - Step 5 */}
      {isNewUser && onboardingStep === 'invite' && (
        <OnboardingCompletionModal
          isOpen={true}
          onClose={() => {
            if (setOnboardingStep) setOnboardingStep('done')
          }}
          inviteCode={childProfiles.find(isConfigured)?.invite_code || childProfiles[0]?.invite_code || ''}
          onComplete={() => {
            localStorage.setItem('onboarding_invite_dismissed', 'true')
            if (setOnboardingStep) setOnboardingStep('done')
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

      <header className="space-y-6">
        {/* Onboarding Stepper - Hide completely when done */}
        {isNewUser && onboardingStep && onboardingStep !== 'done' && onboardingStep !== 'invite' && (
          <OnboardingStepper
            currentStep={onboardingStep}
            onStepClick={(step) => {
              if (setOnboardingStep) {
                setOnboardingStep(step)
                setActiveTab('settings')
                // Map step to sub-tab
                if (step === 'child' || step === 'invite') setActiveSubTab('children')
                else if (step === 'mission') setActiveSubTab('missions')
                else if (step === 'challenge') setActiveSubTab('challenge')
              }
            }}
          />
        )}

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white [.light-theme_&]:text-slate-900 mb-2">
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
            {filteredProfilesForUI.length > 1 && (
              <div className="flex gap-1.5 p-1 bg-slate-900/60 border border-white/5 rounded-xl">
                {filteredProfilesForUI.map(p => {
                  const isActive = profile?.id === p.id
                  const colors = getColorClasses(p.color) || { active: '', inactive: '' }
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
          </div>
        </div>
        {/* Tab Switcher - Premium Look - Masqué pendant l'onboarding */}
        {(!isNewUser || !onboardingStep || onboardingStep === 'done') && (
          <div className="bg-slate-900/40 [.light-theme_&]:bg-indigo-500/15 backdrop-blur-xl border border-white/5 [.light-theme_&]:border-indigo-500/10 p-1.5 rounded-[2.5rem] flex relative shadow-2xl max-w-md mx-auto">
            <motion.div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-[2.2rem] shadow-[0_0_20px_rgba(79,70,229,0.4)] z-0"
              animate={{ x: activeTab === 'settings' ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ left: '6px' }}
            />

            <button
              onClick={() => setActiveTab('validation')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] relative z-10 transition-colors ${activeTab === 'validation' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ClipboardCheck size={20} className={activeTab === 'validation' ? 'text-white' : 'text-slate-600'} />
              <span className="font-bold uppercase text-[11px] tracking-[0.15em]">{t('tabs.validation')}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] relative z-10 transition-colors ${activeTab === 'settings' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sliders size={20} className={activeTab === 'settings' ? 'text-white' : 'text-slate-600'} />
              <span className="font-bold uppercase text-[11px] tracking-[0.15em]">{t('tabs.settings')}</span>
            </button>
          </div>
        )}
      </header>

      <main className={isNewUser && onboardingStep && onboardingStep !== 'done' ? 'mt-4' : 'mt-12'}>
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
                childName={profile?.child_name}
                refresh={refresh}
                onExit={onExit}
                onEditSettings={(target) => {
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