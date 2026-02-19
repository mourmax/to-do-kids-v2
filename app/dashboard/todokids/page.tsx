'use client'

/* ============================================================
   TodoKids — Page /dashboard/todokids
   Récupère les données depuis Supabase et monte <ChildApp>.

   Tables Supabase attendues :
     - todokids_profiles   : id, restaurant_id, name, gender (text, default 'boy')
     - todokids_missions   : id, profile_id, title, icon, child_done,
                             pending_validation, time, date
     - todokids_challenges : id, profile_id, reward_text, malus_text,
                             days_completed, days_total, status, streak
   ============================================================ */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ChildApp from '@/components/child/ChildApp'

// ── Types ──────────────────────────────────────────────────────
type Profile = {
  id: string
  name: string
  gender: 'boy' | 'girl'
}

type Mission = {
  id: string
  title: string
  icon: string
  done: boolean
  time: string
  pendingValidation: boolean
}

type Challenge = {
  rewardText: string
  malusText: string
  daysCompleted: number
  daysTotal: number
  status: 'active' | 'won' | 'lost'
} | null

// ── Paramètre profileId via query string : ?profileId=xxx ──────
function getProfileIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('profileId')
}

export default function TodoKidsPage() {
  const [profile, setProfile]     = useState<Profile | null>(null)
  const [missions, setMissions]   = useState<Mission[]>([])
  const [streak, setStreak]       = useState(0)
  const [challenge, setChallenge] = useState<Challenge>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const profileId = getProfileIdFromUrl()

  // ── Chargement initial ─────────────────────────────────────
  useEffect(() => {
    if (!profileId) {
      setError('Aucun profil sélectionné')
      setLoading(false)
      return
    }
    loadAll(profileId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  async function loadAll(pid: string) {
    setLoading(true)
    try {
      await Promise.all([
        loadProfile(pid),
        loadMissions(pid),
        loadChallenge(pid),
      ])
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile(pid: string) {
    const { data, error: err } = await supabase
      .from('todokids_profiles')
      .select('id, name, gender')
      .eq('id', pid)
      .single()

    if (err || !data) {
      setError('Profil introuvable')
      return
    }
    setProfile({ id: data.id, name: data.name, gender: data.gender ?? 'boy' })
  }

  async function loadMissions(pid: string) {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('todokids_missions')
      .select('id, title, icon, child_done, pending_validation, time')
      .eq('profile_id', pid)
      .eq('date', today)
      .order('time', { ascending: true })

    setMissions(
      (data ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        icon: m.icon ?? '⭐',
        done: m.child_done ?? false,
        time: m.time ?? '',
        pendingValidation: m.pending_validation ?? false,
      }))
    )
  }

  async function loadChallenge(pid: string) {
    const { data } = await supabase
      .from('todokids_challenges')
      .select('reward_text, malus_text, days_completed, days_total, status, streak')
      .eq('profile_id', pid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) {
      setChallenge(null)
      return
    }
    setStreak(data.streak ?? 0)
    setChallenge({
      rewardText:    data.reward_text    ?? '',
      malusText:     data.malus_text     ?? '',
      daysCompleted: data.days_completed ?? 0,
      daysTotal:     data.days_total     ?? 7,
      status:        data.status         ?? 'active',
    })
  }

  // ── Mission toggle ─────────────────────────────────────────
  const handleMissionToggle = useCallback((missionId: string) => {
    // Mise à jour optimiste locale
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, done: true, pendingValidation: true } : m
      )
    )
  }, [])

  // ── États d'attente ────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg,#1a1a2e,#16213e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTop: '3px solid #A78BFA',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg,#1a1a2e,#16213e)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, fontFamily: "'Nunito', sans-serif", padding: 24,
      }}>
        <span style={{ fontSize: 48 }}>😕</span>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
          {error ?? 'Profil introuvable'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
          Demande à papa ou maman de t&apos;envoyer le bon lien.
        </p>
      </div>
    )
  }

  return (
    <ChildApp
      profileId={profile.id}
      childName={profile.name}
      gender={profile.gender}
      missions={missions}
      streak={streak}
      challenge={challenge}
      onMissionToggle={handleMissionToggle}
    />
  )
}
