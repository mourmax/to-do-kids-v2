import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, User, Copy, Plus } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import { useTranslation } from 'react-i18next'
import SectionCard from './SectionCard'
import OnboardingInfoBlock from '../../ui/OnboardingInfoBlock'
import ProfileCompletionModal from '../../ui/ProfileCompletionModal'

export default function IdentitySection({ familyId, profiles, onShowSuccess, refresh, updateProfile, isNewUser, onNextStep, onboardingStep }) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const COLORS = [
    { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', shadow: 'shadow-rose-500/20' },
    { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/30', shadow: 'shadow-sky-500/20' },
    { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20' },
    { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20' },
    { name: 'violet', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30', shadow: 'shadow-indigo-500/20' },
  ]

  const handleUpdateProfile = async (id, updates) => {
    if (updatingId === id) return // Prevent double-click

    try {
      setUpdatingId(id)
      // Use the injected updateProfile for optimistic UI + DB persistence
      await updateProfile(id, updates)

      setEditingId(null)
      onShowSuccess(t('actions.save_success'))

      // Refresh to ensure changes are persisted
      await refresh(true)

      if (isNewUser) {
        setShowProfileModal(true)
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      onShowSuccess("Erreur de mise à jour")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAddChild = async () => {
    if (isAdding) return
    try {
      setIsAdding(true)
      const childProfiles = profiles?.filter(p => !p.is_parent) || []
      if (childProfiles.length >= 5) {
        onShowSuccess("Limite de profil atteinte")
        return
      }

      if (!familyId) {
        onShowSuccess("Erreur : Famille non identifiée")
        return
      }
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const randomColor = COLORS[childProfiles.length % COLORS.length].name

      const { error } = await supabase.from('profiles').insert([
        {
          family_id: familyId,
          child_name: "Mon enfant",
          role: 'child',
          is_parent: false,
          invite_code: newInviteCode,
          color: randomColor
        }
      ])

      if (error) {
        console.error("Error adding child:", error)
        onShowSuccess(`Erreur : ${error.message}`)
      } else {
        onShowSuccess("Enfant ajouté !")
        refresh(true)
      }
    } catch (err) {
      console.error("Unexpected error in handleAddChild:", err)
    } finally {
      setIsAdding(false)
    }
  }

  const childProfiles = profiles?.filter(p => !p.is_parent) || []
  // Show onboarding block ONLY if there's still a "Mon enfant" profile (not configured yet)
  const showOnboarding = childProfiles.some(p => p.child_name === "Mon enfant")

  // During onboarding, only show the first child profile (the one to configure)
  // After onboarding, show all children
  const displayedChildren = showOnboarding
    ? childProfiles.filter(p => p.child_name === "Mon enfant").slice(0, 1)
    : childProfiles

  return (
    <div className="space-y-6">
      {showOnboarding && (
        <OnboardingInfoBlock
          step="1"
          title={t('onboarding.identity_title')}
          description={t('onboarding.identity_description')}
          icon={User}
        />
      )}
      <SectionCard icon={User} colorClass="text-indigo-400" title={t('settings.identity_title')}>
        <div className="space-y-4">
          {displayedChildren.map(p => (
            <div key={p.id} className="bg-slate-900/40 [.light-theme_&]:bg-indigo-500/5 p-5 rounded-[2.5rem] border border-white/5 [.light-theme_&]:border-indigo-100 space-y-4 shadow-xl">
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">
                      {t('settings.child_name_label')}
                    </label>
                    <span className="text-[10px] text-indigo-400/50 font-black font-mono tracking-widest uppercase">
                      ID: {p.invite_code || '---'}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      value={editingId === p.id ? editName : p.child_name}
                      onChange={(e) => setEditName(e.target.value)}
                      onFocus={() => {
                        setEditingId(p.id)
                        setEditName(p.child_name)
                      }}
                      className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 font-bold outline-none transition-all ${editingId === p.id ? 'border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-white/5 text-slate-300'
                        } [.light-theme_&]:bg-white [.light-theme_&]:text-slate-900 [.light-theme_&]:border-indigo-200`}
                    />

                    {editingId === p.id && (
                      <button
                        onClick={() => handleUpdateProfile(p.id, { child_name: editName })}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 px-5 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                      >
                        {t('actions.save')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-600 uppercase font-black ml-1 tracking-widest">Couleur associée</label>
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color.name}
                        disabled={updatingId === p.id}
                        onClick={() => handleUpdateProfile(p.id, { color: color.name })}
                        className={`w-10 h-10 rounded-full transition-all border-4 ${(p.color || 'violet') === color.name
                          ? `${color.bg} border-white/20 scale-110 shadow-lg ${color.shadow}`
                          : 'bg-slate-950 border-white/5 hover:border-white/10 [.light-theme_&]:bg-white [.light-theme_&]:border-indigo-200'
                          } ${updatingId === p.id ? 'opacity-50 animate-pulse' : ''}`}
                      >
                        {(p.color || 'violet') !== color.name && <div className={`w-3 h-3 rounded-full mx-auto ${color.bg} opacity-20`} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-600 uppercase font-black ml-1 tracking-widest">Thème préféré</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProfile(p.id, { preferred_theme: 'dark' })}
                      className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${p.preferred_theme !== 'light' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 [.light-theme_&]:bg-white [.light-theme_&]:border-indigo-200 [.light-theme_&]:text-indigo-400'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-slate-950 border border-white/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Dark</span>
                    </button>
                    <button
                      onClick={() => handleUpdateProfile(p.id, { preferred_theme: 'light' })}
                      className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${p.preferred_theme === 'light' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 [.light-theme_&]:bg-white [.light-theme_&]:border-indigo-200 [.light-theme_&]:text-indigo-400'}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-white border border-slate-200" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Light</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Invite Code for this child */}
              <div className={`flex items-center justify-between bg-slate-950/50 rounded-xl px-5 py-4 border mt-2 [.light-theme_&]:bg-orange-600 [.light-theme_&]:border-transparent transition-all ${isNewUser && !childProfiles.some(p => p.child_name === "Mon enfant") ? 'border-orange-500 animate-pulse shadow-lg shadow-orange-500/30' : 'border-white/5'}`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest [.light-theme_&]:text-orange-200">{t('settings.invite_code_description')}</span>
                  <span className="text-2xl font-black text-indigo-400 tracking-widest font-mono [.light-theme_&]:text-white">
                    {p.invite_code || '------'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.invite_code)
                    onShowSuccess("Code copié !")
                  }}
                  className="text-slate-500 hover:text-white transition-colors p-2 [.light-theme_&]:text-indigo-200 [.light-theme_&]:hover:text-white"
                  title="Copier le code"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddChild}
            disabled={isAdding}
            className={`w-full bg-indigo-500/10 border border-indigo-500/20 border-dashed py-4 rounded-2xl flex items-center justify-center gap-2 group hover:bg-indigo-500/20 transition-all active:scale-[0.98] mt-2 [.light-theme_&]:bg-orange-50 [.light-theme_&]:border-orange-300 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus size={18} className={`text-indigo-400 group-hover:scale-110 transition-transform [.light-theme_&]:text-orange-500 ${isAdding ? 'animate-spin' : ''}`} />
            <span className="font-black uppercase text-[10px] tracking-widest text-indigo-300 [.light-theme_&]:text-orange-600">
              {isAdding ? t('common.creating') : t('settings.add_child')}
            </span>
          </button>

          {isNewUser && childProfiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 text-center mt-8"
            >
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg shadow-emerald-500/30">
                <Check size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-indigo-400 tracking-widest">{t('onboarding.profile_configured')}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('onboarding.profile_configured_subtitle')}</p>
              </div>
              <button
                onClick={() => onNextStep('missions')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/10 transition-all active:scale-95"
              >
                {t('onboarding.next_step_missions')}
              </button>
            </motion.div>
          )}
        </div>
      </SectionCard>

      {/* Profile Completion Modal - Hide at step 5 (invite) */}
      {isNewUser && childProfiles.length > 0 && !childProfiles.some(p => p.child_name === "Mon enfant") && onboardingStep !== 'invite' && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onNavigateToMissions={() => {
            setShowProfileModal(false)
            onNextStep('missions')
          }}
        />
      )}
    </div>
  )
}
