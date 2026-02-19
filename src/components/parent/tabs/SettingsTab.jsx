import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Sparkles, Trophy, ChevronRight, Lock } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import Toast from '../Toast'

// Imports des sous-sections
import IdentitySection from '../settings/IdentitySection'
import SecuritySection from '../settings/SecuritySection'
import FamilySection from '../settings/FamilySection'
import ChallengeSection from '../settings/ChallengeSection'
import MissionsSection from '../settings/MissionsSection'

export default function SettingsTab({ theme = {}, family, profile, profiles, challenge, missions, refresh, updateProfile, activeSubMenu: propSubMenu, onSubMenuChange, isNewUser, onTabChange, onboardingStep, setOnboardingStep, preventStepRecalc }) {
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

  return (
    <div className="space-y-6 pb-10">
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* Sub-nav handled by sidebar — no pill row here */}

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
                <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-violet-200">
                  <Lock size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">{t('pin_setup.title')}</h2>
                  <p className="text-gray-500 text-sm mt-2">{t('pin_setup.description')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="tel"
                  maxLength={4}
                  value={localPin || ''}
                  onChange={(e) => setLocalPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className={`w-full bg-white border-2 ${theme.border || 'border-violet-200'} focus:border-violet-400 text-center text-4xl font-black tracking-[1rem] rounded-2xl py-6 text-gray-800 focus:outline-none transition-all shadow-sm`}
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
                  className="w-full min-h-[52px] bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-violet-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  {t('pin_setup.validate')}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Ce code vous servira à accéder à cet espace parent depuis l'interface de votre enfant. Notez-le bien !
                </p>
              </div>
            </div>
          )}

          {activeSubMenu === 'children' && (
            <div className="space-y-6">
              <IdentitySection
                theme={theme}
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
                  <FamilySection theme={theme} family={family} />
                  <SecuritySection theme={theme} profile={profile} onShowSuccess={showSuccess} />
                </>
              )}
            </div>
          )}

          {activeSubMenu === 'missions' && (
            <MissionsSection
              theme={theme}
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
              theme={theme}
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
        <div className={`pt-10 text-center border-t ${theme.borderLight || 'border-gray-100'}`}>
          <a
            href="/legal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-violet-500 transition-colors"
          >
            Mentions Légales & Confidentialité
          </a>
        </div>
      )}
    </div>
  )
}
