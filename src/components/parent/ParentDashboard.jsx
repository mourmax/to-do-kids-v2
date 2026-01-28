import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Sliders } from 'lucide-react'
import ValidationTab from './tabs/ValidationTab'
import SettingsTab from './tabs/SettingsTab'
import NotificationBanner from '../ui/NotificationBanner'
import { supabase } from '../../supabaseClient'
import { useTranslation } from 'react-i18next'

export default function ParentDashboard({ family, profile, profiles, challenge, missions, allMissions, onExit, refresh, onSwitchProfile, initialTab = 'validation', initialSubTab = 'missions' }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab)
  const [notifications, setNotifications] = useState([])

  const childProfiles = profiles?.filter(p => !p.is_parent) || []

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
          const child = childProfiles.find(p => p.id === id)
          return child ? { profile_id: id, child_name: child.child_name } : null
        }).filter(Boolean)
        setNotifications(newNotifs)
      } else {
        setNotifications([])
      }
    }

    checkPendingValidations()

    // Abonnement aux changements
    const channel = supabase
      .channel(`parent-sync-${family?.id || 'no-family'}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'daily_logs',
        },
        async (payload) => {
          const childId = payload.new?.profile_id || payload.old?.profile_id
          const child = childProfiles.find(p => p.id === childId)
          if (!child) return

          // 🔄 Refresh global pour mettre à jour la liste des missions
          refresh(true)

          // Gestion des notifications (seulement sur UPDATE pour le point d'exclamation)
          if (payload.eventType === 'UPDATE') {
            // Si validation_requested devient TRUE et result est NULL
            if (payload.new.validation_requested && !payload.new.validation_result) {
              setNotifications(prev => {
                if (prev.find(n => n.profile_id === child.id)) return prev
                return [...prev, { profile_id: child.id, child_name: child.child_name }]
              })
            }
            // Si validation_result passe à quelque chose (success/failure), on retire la notif
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
          filter: challenge?.id ? `id=eq.${challenge.id}` : undefined
        },
        () => {
          refresh(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [family?.id, childProfiles]) // Attention aux dépendances, childProfiles doit être stable

  // Helper for colors
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">

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
          // Retirer la notif localement pour feedback immédiat
          setNotifications(prev => prev.filter(n => n.profile_id !== childId))
        }}
      />

      <header className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">
            {t('dashboard.parent_title')}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {family?.name || "Famille Active"}
              </span>
            </div>

            {/* Selector Profile Child for Parent (Validation context) */}
            {childProfiles.length > 1 && (
              <div className="flex gap-1.5 p-1 bg-slate-900/60 border border-white/5 rounded-xl">
                {childProfiles.map(p => {
                  const isActive = profile?.id === p.id
                  const colors = getColorClasses(p.color)
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

        {/* Tab Switcher - Premium Look */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-1.5 rounded-[2.5rem] flex relative shadow-2xl max-w-md mx-auto">
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
      </header>

      <main className="mt-12">
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
                activeSubMenu={activeSubTab}
                onSubMenuChange={setActiveSubTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}