import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Sparkles, Trophy, ChevronRight, ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import Toast from '../Toast'

// Imports des sous-sections
import IdentitySection from '../settings/IdentitySection'
import SecuritySection from '../settings/SecuritySection'
import FamilySection from '../settings/FamilySection'
import ChallengeSection from '../settings/ChallengeSection'
import MissionsSection from '../settings/MissionsSection'

export default function SettingsTab({ family, profile, profiles, challenge, missions, refresh, updateProfile, activeSubMenu: propSubMenu, onSubMenuChange, isNewUser, onTabChange, onboardingStep, setOnboardingStep, preventStepRecalc }) {
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState(null)
  const [localPin, setLocalPin] = useState('')

  // Si on a des props contrôlées, on les utilise, sinon on reste en local
  const [localSubMenu, setLocalSubMenu] = useState('children')
  const activeSubMenu = propSubMenu || localSubMenu
  const setActiveSubMenu = onSubMenuChange || setLocalSubMenu

  const handleNextStep = (step) => {
    if (step === 'done') {
      // Onboarding complete, switch to validation tab
      if (onTabChange) onTabChange('validation')
      if (setOnboardingStep) setOnboardingStep('done')
    } else {
      // Navigate to the next step
      setActiveSubMenu(step)
      if (setOnboardingStep) {
        // Update onboarding step based on the target
        if (step === 'children') setOnboardingStep('child')
        else if (step === 'missions') setOnboardingStep('mission')
        else if (step === 'challenge') setOnboardingStep('challenge')
      }
    }
  }

  const showSuccess = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const subTabs = [
    { id: 'missions', label: t('common.missions'), icon: <Sparkles size={16} /> },
    { id: 'challenge', label: t('common.challenge'), icon: <Trophy size={16} /> },
    { id: 'children', label: t('common.children_tab'), icon: <Users size={16} /> },
  ]

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* 🟢 SUB-NAVIGATION PERSISTANTE - Masquée pendant l'onboarding */}
      {(!isNewUser || !onboardingStep || onboardingStep === 'done') && (
        <div className="flex justify-center -mt-4 mb-8">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-900/60 [.light-theme_&]:bg-indigo-500/15 backdrop-blur-md border border-white/5 [.light-theme_&]:border-indigo-500/10 rounded-2xl shadow-xl">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubMenu(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${activeSubMenu === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 [.light-theme_&]:text-slate-600 hover:text-white [.light-theme_&]:hover:text-indigo-800 hover:bg-white/5 [.light-theme_&]:hover:bg-indigo-500/5'
                  }`}
              >
                <span className={`${activeSubMenu === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubMenu}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          {activeSubMenu === 'pin' && (
            <div className="max-w-md mx-auto space-y-8 py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                  <Lock size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">{t('pin_setup.title')}</h2>
                  <p className="text-slate-400 text-sm mt-2">{t('pin_setup.description')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <input
                  type="tel"
                  maxLength={4}
                  value={localPin || ''}
                  onChange={(e) => setLocalPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-900 border-2 border-indigo-500/50 text-center text-4xl font-black tracking-[1rem] rounded-2xl py-6 text-white focus:outline-none focus:border-indigo-400 transition-all shadow-inner"
                  placeholder="••••"
                  autoFocus
                />

                <button
                  onClick={async () => {
                    if (localPin.length !== 4) return
                    try {
                      const { error } = await supabase.from('profiles').update({ pin_code: localPin }).eq('id', profile.id)
                      if (error) throw error
                      showSuccess(t('actions.save_success'))
                      // Wait for refresh to complete BEFORE advancing to next step
                      await refresh(true)
                      // Now advance to the next step
                      if (setOnboardingStep) setOnboardingStep('child')
                      setActiveSubMenu('children')
                    } catch (err) {
                      console.error("PIN Save Error:", err)
                      showSuccess("Erreur lors de l'enregistrement")
                    }
                  }}
                  disabled={!localPin || localPin.length !== 4}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase py-5 rounded-2xl tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  {t('pin_setup.validate')}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[10px] font-bold text-amber-200/60 uppercase leading-relaxed">
                  Ce code vous servira à accéder à cet espace parent depuis l'interface de votre enfant. Notez-le bien !
                </p>
              </div>
            </div>
          )}

          {activeSubMenu === 'children' && (
            <div className="space-y-8">
              <IdentitySection
                familyId={family?.id}
                profile={profile}
                profiles={profiles}
                onShowSuccess={showSuccess}
                refresh={refresh}
                updateProfile={updateProfile}
                isNewUser={isNewUser}
                onboardingStep={onboardingStep}
                onNextStep={handleNextStep}
              />
              {(!isNewUser || !onboardingStep || onboardingStep === 'done') && (
                <>
                  <FamilySection family={family} />
                  <SecuritySection profile={profile} onShowSuccess={showSuccess} />
                </>
              )}
            </div>
          )}

          {activeSubMenu === 'missions' && (
            <MissionsSection
              missions={missions}
              profiles={profiles}
              familyId={family?.id}
              profileId={profile?.id}
              onShowSuccess={showSuccess}
              refresh={refresh}
              isNewUser={isNewUser}
              preventStepRecalc={preventStepRecalc}
              onNextStep={handleNextStep}
            />
          )}

          {activeSubMenu === 'challenge' && (
            <ChallengeSection
              challenge={challenge}
              onShowSuccess={showSuccess}
              refresh={refresh}
              isNewUser={isNewUser}
              profiles={profiles}
              onNavigateToValidation={() => {
                // Navigate to validation tab
                if (onTabChange) {
                  onTabChange('validation')
                }
              }}
              onNextStep={handleNextStep}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* LIEN LÉGAL DISCRET */}
      {!isNewUser && (
        <div className="pt-12 text-center border-t border-white/5 [.light-theme_&]:border-indigo-500/10">
          <a
            href="/legal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-400 transition-colors"
          >
            Mentions Légales & Confidentialité
          </a>
        </div>
      )}
    </div>
  )
}
