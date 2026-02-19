import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, User, Copy, Plus, Crown } from 'lucide-react'
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
  const [copiedId, setCopiedId] = useState(null)

  const handleCopyCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
    onShowSuccess(t('actions.save_success'))
  }

  // Local state for onboarding drafts to prevent DB syncing issues during typing/color selection
  const [onboardingDrafts, setOnboardingDrafts] = useState({})

  const COLORS = [
    { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', shadow: 'shadow-rose-500/20' },
    { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/30', shadow: 'shadow-sky-500/20' },
    { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20' },
    { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20' },
    { name: 'violet', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30', shadow: 'shadow-indigo-500/20' },
  ]

  const handleUpdateProfile = async (id, updates) => {
    // During onboarding, we just update the local draft to be snappy
    if (isNewUser) {
      setOnboardingDrafts(prev => ({
        ...prev,
        [id]: { ...(prev[id] || profiles.find(p => p.id === id)), ...updates }
      }))
      return
    }

    if (updatingId === id) return
    try {
      setUpdatingId(id)
      await updateProfile(id, updates)
      setEditingId(null)
      onShowSuccess(t('actions.save_success'))
      await refresh(true)
    } catch (err) {
      console.error("Error updating profile:", err)
      onShowSuccess("Erreur de mise à jour")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleOnboardingFinalSave = async () => {
    try {
      setUpdatingId('saving-all')
      const profileToSave = profiles.find(p => !p.is_parent)
      if (!profileToSave) return

      const draft = onboardingDrafts[profileToSave.id] || {}
      const finalUpdates = {
        child_name: draft.child_name || profileToSave.child_name,
        color: draft.color || profileToSave.color
      }

      await updateProfile(profileToSave.id, finalUpdates)
      await refresh(true)
      // Navigate immediately to missions during onboarding
      if (onNextStep) onNextStep('missions')
    } catch (err) {
      console.error("Error during final onboarding save:", err)
      onShowSuccess("Erreur lors de la sauvegarde")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAddChild = () => {
    onShowSuccess("Fonctionnalité Premium uniquement")
  }

  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  // LOGIQUE DE VISIBILITÉ :
  // On considère un profil "configuré" s'il a un prénom différent de "Mon enfant" ou s'il y a un brouillon local.
  const isConfigured = (p) => p.child_name !== "Mon enfant" || onboardingDrafts[p.id]?.child_name
  const hasConfiguredAny = childProfiles.some(isConfigured)

  // Pendant l'onboarding, on ne montre que :
  // 1. Les profils déjà configurés (ou en cours de saisie)
  // 2. Le tout premier profil si absolument rien n'a encore été commencé (état initial)
  // Cela permet de cacher les doublons "Mon enfant" hérités de sessions précédentes.
  const displayedChildren = isNewUser
    ? childProfiles.filter((p, index) => isConfigured(p) || (index === 0 && !hasConfiguredAny))
    : childProfiles

  const showOnboardingHeader = isNewUser && !hasConfiguredAny

  return (
    <div className="space-y-4">
      {showOnboardingHeader && (
        <OnboardingInfoBlock
          step="1"
          title={t('onboarding.identity_title')}
          description={t('onboarding.identity_description')}
          icon={User}
        />
      )}
      <SectionCard icon={User} colorClass="text-violet-500" title={t('settings.identity_title')}>
        <div className="space-y-4">
          {displayedChildren.map(p => {
            const draft = onboardingDrafts[p.id] || p
            return (
              <div key={p.id} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] text-violet-600 uppercase font-bold tracking-widest leading-none">
                        {t('settings.child_name_label')}
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        value={editingId === p.id ? editName : (draft.child_name === "Mon enfant" ? "" : draft.child_name)}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditName(val)
                          if (isNewUser) {
                            handleUpdateProfile(p.id, { child_name: val })
                          }
                        }}
                        onFocus={() => {
                          setEditingId(p.id)
                          setEditName(draft.child_name === "Mon enfant" ? "" : draft.child_name)
                        }}
                        onBlur={() => {
                          if (!isNewUser) {
                            handleUpdateProfile(p.id, { child_name: editName || "Mon enfant" })
                          }
                          setEditingId(null)
                        }}
                        placeholder="Ex: Arthur"
                        className={`w-full bg-white border-2 rounded-2xl px-5 py-4 font-bold outline-none transition-all text-gray-800 ${editingId === p.id
                          ? 'border-violet-400 shadow-sm'
                          : 'border-violet-200'
                          }`}
                      />

                      {editingId === p.id && !isNewUser && (
                        <button
                          onClick={() => handleUpdateProfile(p.id, { child_name: editName })}
                          className="absolute right-2 top-2 bottom-2 bg-violet-500 hover:bg-violet-600 px-5 rounded-xl text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                        >
                          {t('actions.save')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Selector & Invite Code */}
                <div className="flex flex-col md:flex-row gap-6 md:items-end">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-bold ml-1 tracking-widest">
                      {t('settings.associated_color') || 'Couleur associée'}
                    </label>
                    <div className="flex gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color.name}
                          disabled={updatingId === p.id}
                          onClick={() => handleUpdateProfile(p.id, { color: color.name })}
                          className={`w-10 h-10 rounded-full transition-all border-4 ${(draft.color || 'violet') === color.name
                            ? `${color.bg} border-white/30 scale-110 shadow-lg ${color.shadow}`
                            : 'bg-gray-100 border-gray-200 hover:border-gray-300'
                            } ${updatingId === p.id ? 'opacity-50 animate-pulse' : ''}`}
                        >
                          {(draft.color || 'violet') !== color.name && <div className={`w-3 h-3 rounded-full mx-auto ${color.bg} opacity-20`} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Prominent Code Block */}
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] text-violet-500 uppercase font-bold ml-1 tracking-widest">
                      {t('settings.invite_code_description')}
                    </label>
                    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest mb-1">Code enfant</p>
                        <span className="text-2xl font-black text-violet-700 tracking-[0.25em]">
                          {p.invite_code || '------'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(p.invite_code)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${copiedId === p.invite_code
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100'
                          : 'bg-white border border-violet-200 text-violet-500 hover:bg-violet-100'
                          }`}
                      >
                        {copiedId === p.invite_code ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {(!isNewUser || (hasConfiguredAny && !childProfiles.some(p => !isConfigured(p)))) && (
            <button
              onClick={handleAddChild}
              disabled={isAdding}
              className={`w-full bg-white border-2 border-dashed border-gray-200 py-4 rounded-2xl flex items-center justify-center gap-2 group hover:border-violet-200 hover:bg-violet-50 transition-all active:scale-[0.98] mt-2 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={18} className={`text-gray-400 group-hover:text-violet-500 group-hover:scale-110 transition-all ${isAdding ? 'animate-spin' : ''}`} />
              <span className="font-bold text-xs text-gray-500 group-hover:text-violet-600 transition-colors">
                {isAdding ? t('common.creating') : t('settings.add_child')}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <Crown size={12} className="text-amber-500" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-amber-600">Premium</span>
              </div>
            </button>
          )}

          {isNewUser && hasConfiguredAny && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-violet-50 border border-violet-100 p-6 rounded-2xl flex flex-col items-center gap-4 text-center mt-4"
            >
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-sm shadow-emerald-100">
                <Check size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-violet-700">{t('onboarding.profile_configured')}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t('onboarding.profile_configured_subtitle')}</p>
              </div>
              <button
                disabled={updatingId === 'saving-all'}
                onClick={handleOnboardingFinalSave}
                className="bg-violet-500 hover:bg-violet-600 text-white px-8 min-h-[48px] rounded-xl font-bold text-sm shadow-sm shadow-violet-200 transition-all active:scale-95 disabled:opacity-50 animate-heartbeat"
              >
                {updatingId === 'saving-all' ? t('actions.saving') : t('onboarding.next_step_missions')}
              </button>
            </motion.div>
          )}
        </div>
      </SectionCard>

    </div>
  )
}
