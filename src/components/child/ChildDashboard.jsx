import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { supabase } from '../../supabaseClient'
import MissionCard from './MissionCard'
import ChildProgressBar from './ChildProgressBar'
import { LogOut, HelpCircle, Trophy, Clock, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../../services/notificationService'

export default function ChildDashboard({
  family,
  profile,
  challenge,
  missions,
  onExit,
  refresh
}) {
  const { t } = useTranslation()
  const [isSyncing, setIsSyncing] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [showIntro, setShowIntro] = useState(false)
  const [lastCompletedMission, setLastCompletedMission] = useState(null)

  // 1. Calcul de l'état local (Optimistic)
  const isVictory = useMemo(() => {
    if (!challenge?.is_active) return false
    return missions.length > 0 && missions.every(m => m.parent_validated)
  }, [missions, challenge])

  const allDoneNotValidated = useMemo(() => {
    if (isVictory) return false
    return missions.length > 0 && missions.every(m => m.is_completed)
  }, [missions, isVictory])

  // Confetti effect and scheduling on mount
  useEffect(() => {
    if (isVictory) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)
        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } })
      }, 250)
    }

    // Schedule notifications for today's missions
    if (missions && missions.length > 0) {
      missions.forEach(mission => {
        if (!mission.is_completed && mission.scheduled_times) {
          mission.scheduled_times.forEach(time => {
            NotificationService.scheduleLocalReminder(
              t(mission.title),
              time,
              mission.id
            )
          })
        }
      })
    }
  }, [isVictory, missions, t])

  // Realtime subscription for parent validation
  useEffect(() => {
    if (!family?.id) return

    const channel = supabase
      .channel(`child-sync-${family.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_logs',
          filter: `profile_id=eq.${profile.id}`
        },
        (payload) => {
          console.log("Realtime update received (Child):", payload)
          if (payload.new.validation_result === 'success') {
            setValidationResult('success')
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
            setTimeout(() => setValidationResult(null), 5000)
          } else if (payload.new.validation_result === 'failure') {
            setValidationResult('failure')
            setTimeout(() => setValidationResult(null), 5000)
          }
          refresh(true)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `family_id=eq.${family.id}`
        },
        () => {
          console.log("Realtime challenge update received (Child)")
          refresh(true)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [family?.id, profile.id, refresh])

  const toggleMission = async (id, currentStatus) => {
    if (isSyncing) return
    setIsSyncing(true)
    const newStatus = !currentStatus

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: logs, error: fetchError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('mission_id', id)
        .eq('date', today)

      if (fetchError) throw fetchError

      if (logs && logs.length > 0) {
        const { error: updateError } = await supabase
          .from('daily_logs')
          .update({ is_completed: newStatus, parent_validated: false })
          .eq('id', logs[0].id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('daily_logs')
          .insert({
            profile_id: profile.id,
            mission_id: id,
            date: today,
            is_completed: newStatus,
            parent_validated: false
          })
        if (insertError) throw insertError
      }

      if (newStatus) {
        setLastCompletedMission(id)
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ['#fbbf24', '#f59e0b', '#ffffff'] })
      }

      await refresh(true)
    } catch (err) {
      console.error("Error toggling mission:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  const requestValidation = async () => {
    if (isSyncing) return
    setIsSyncing(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('daily_logs')
        .update({ validation_requested: true })
        .eq('profile_id', profile.id)
        .eq('date', today)

      if (error) throw error
      await refresh(true)
    } catch (err) {
      console.error("Error requesting validation:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  const optimisticMissions = missions

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* HEADER PREMIUM GLASSMORPHISM */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <header className="relative flex flex-col items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-indigo-600/90 to-violet-700/90 [.light-theme_&]:from-indigo-500 [.light-theme_&]:to-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.3)] rounded-[3.5rem] overflow-hidden mb-10 border-b-8 border-indigo-800/50 backdrop-blur-xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={() => setShowIntro(true)}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-[1.2rem] flex items-center justify-center transition-all border border-white/10 hover:border-white/30 active:scale-95"
            >
              <HelpCircle size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={onExit}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-[1.2rem] flex items-center justify-center transition-all border border-white/10 hover:border-white/30 active:scale-95"
            >
              <LogOut size={22} strokeWidth={2.5} />
            </button>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-3 z-10"
          >
            <div className="px-5 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
              <span className="text-[10px] sm:text-xs font-black text-indigo-100 uppercase tracking-[0.3em]">
                {t('common.dashboard')}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">
              {profile.child_name || 'HÉROS'}
            </h1>
          </motion.div>
        </header>
      </div>

      {/* SUCCESS/FAILURE OVERLAY */}
      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`max-w-sm w-full p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden flex flex-col items-center gap-6 border-2 ${validationResult === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'}`}
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl">
                {validationResult === 'success' ? '🚀' : '💫'}
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  {validationResult === 'success' ? 'MISSION RÉUSSIE !' : 'OUPS !'}
                </h3>
                <p className="text-white/90 font-bold text-sm leading-relaxed">
                  {validationResult === 'success'
                    ? "Tes missions ont été validées bravo ! On continue comme ça ! ✨"
                    : "Papa ou Maman aimeraient que tu revérifies tes missions. Tu peux le faire ! 💪"}
                </p>
              </div>
              <button
                onClick={() => setValidationResult(null)}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
              >
                C'EST REPARTI !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHALLENGE PROGRESS SECTION */}
      <div id="challenge-progress" className="max-w-6xl mx-auto px-4 mb-12">
        <ChildProgressBar
          current={challenge?.current_streak || 0}
          total={challenge?.duration_days || 7}
          reward={challenge?.reward_name || "Surprise !"}
        />
      </div>

      {/* MISSION GRID TITLE */}
      {!isVictory && (
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <h2 className="text-sm font-black text-slate-500 [.light-theme_&]:text-indigo-900/40 uppercase tracking-[0.4em] flex items-center gap-4">
            {t('common.missions')}
            <div className="h-px flex-1 bg-slate-800/50 [.light-theme_&]:bg-indigo-100" />
          </h2>
        </div>
      )}

      {/* MISSION GRID */}
      {!isVictory && challenge?.is_active && (
        <div id="mission-grid" className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-4 pb-12">
          {optimisticMissions.map((mission, index) => {
            const displayMission = validationResult === 'success'
              ? { ...mission, is_completed: false, parent_validated: false }
              : mission

            return (
              <MissionCard
                key={mission.id}
                mission={displayMission}
                onToggle={toggleMission}
                disabled={isSyncing}
              />
            )
          })}
        </div>
      )}

      {/* VALIDATION REQUEST BUTTON */}
      {!isVictory && allDoneNotValidated && challenge?.is_active && (
        <div className="max-w-lg mx-auto px-6 mt-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-indigo-400 font-black text-sm uppercase tracking-widest">{t('child.all_done')}</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">{t('child.request_validation_desc')}</p>
            </div>
            <button
              onClick={requestValidation}
              disabled={isSyncing}
              className="w-full py-6 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black uppercase text-base tracking-[0.2em] rounded-[2.5rem] shadow-[0_20px_40px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? '...' : t('child.request_validation').toUpperCase()}
            </button>
          </motion.div>
        </div>
      )}

      {/* 🏆 ÉCRAN DE VICTOIRE (Mode "WOW") */}
      {isVictory && (
        <div className="max-w-4xl mx-auto px-4 pb-20 mt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 [.light-theme_&]:from-white [.light-theme_&]:to-white border-2 border-white/20 [.light-theme_&]:border-indigo-100 p-10 sm:p-16 rounded-[4rem] shadow-[0_30px_60px_rgba(79,70,229,0.3)] [.light-theme_&]:shadow-indigo-500/10 text-center space-y-8 relative overflow-hidden"
          >
            {/* Arrière-plan décoratif */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-400 rounded-full blur-[80px]" />
            </div>

            <div className="flex flex-col items-center gap-6 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-32 h-32 sm:w-40 sm:h-40 bg-white/20 [.light-theme_&]:bg-indigo-50 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-inner border border-white/30"
              >
                🏆
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white [.light-theme_&]:text-indigo-950">
                  {t('child.victory_title')}
                </h2>
                <p className="text-lg sm:text-xl font-bold text-indigo-100/80 [.light-theme_&]:text-indigo-600 uppercase tracking-[0.2em]">
                  {t('child.victory_subtitle')}
                </p>
              </div>

              <div className="pt-4 w-full max-w-sm mx-auto">
                <div className="p-6 bg-white/10 [.light-theme_&]:bg-white rounded-[2.5rem] border border-white/20 [.light-theme_&]:border-indigo-50 shadow-xl">
                  <p className="text-[10px] font-black text-indigo-200 [.light-theme_&]:text-slate-400 uppercase tracking-widest mb-1">
                    Cadeau actuel
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white [.light-theme_&]:text-indigo-950 uppercase tracking-tight">
                    🎁 {challenge?.reward_name || "Surprise !"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton pour voir les détails (Optionnel) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-8 relative z-10"
            >
              <button
                onClick={() => {
                  const el = document.getElementById('challenge-progress');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white/60 [.light-theme_&]:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
              >
                Découvre ta progression ci-dessous ↓
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* 🕐 MESSAGE PENDING CONFIG SI CHALLENGE FINI MAIS PAS ENCORE RE-CONFIGURÉ */}
      {challenge && !challenge.is_active && (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 [.light-theme_&]:bg-white border border-white/10 [.light-theme_&]:border-indigo-100 p-6 rounded-[2.5rem] shadow-xl [.light-theme_&]:shadow-indigo-500/10 text-center space-y-4 relative overflow-hidden"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 bg-white/5 [.light-theme_&]:bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                <Clock size={28} className="text-slate-400 [.light-theme_&]:text-indigo-400 animate-pulse" />
              </div>
              <p className="text-sm font-black uppercase text-slate-300 [.light-theme_&]:text-indigo-950 tracking-widest opacity-80">
                {t('child.waiting_parent_config')}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- BOUTON TEST NOTIF — DEV UNIQUEMENT --- */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            if (NotificationService.getPermissionStatus() !== 'granted') {
              NotificationService.requestPermission().then(res => {
                if (res === 'granted') {
                  NotificationService.sendLocalNotification("Gagné ! ✨", {
                    body: "Tes notifications sont maintenant activées."
                  })
                } else {
                  alert("Les notifications sont bloquées. Autorise-les dans les réglages de ton navigateur.");
                }
              })
            } else {
              NotificationService.sendLocalNotification("C'est l'heure ! 🔔", {
                body: "Ta mission 'Mettre la table' t'attend ! ✨",
              })
            }
          }}
          className="fixed bottom-6 right-6 z-[999] bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-full font-black uppercase text-xs shadow-2xl active:scale-95 transition-all"
        >
          🔔 Test Alerte
        </button>
      )}
    </div>
  )
}