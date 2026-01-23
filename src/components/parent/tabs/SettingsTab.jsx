import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Toast from '../Toast'

// Imports des sous-sections
import IdentitySection from '../settings/IdentitySection'
import SecuritySection from '../settings/SecuritySection'
import ChallengeSection from '../settings/ChallengeSection'
import MissionsSection from '../settings/MissionsSection'

export default function SettingsTab({ profile, challenge, missions, refresh }) {
  const [toastMessage, setToastMessage] = useState(null)

  const showSuccess = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-8 pb-10"
    >
      
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* 1. Identité */}
      <IdentitySection 
        profile={profile} 
        onShowSuccess={showSuccess} 
        refresh={refresh} 
      />

      {/* 2. Sécurité (PIN) */}
      <SecuritySection 
        profile={profile} 
        onShowSuccess={showSuccess} 
      />

      {/* 3. Challenge */}
      <ChallengeSection 
        challenge={challenge} 
        onShowSuccess={showSuccess} 
        refresh={refresh} 
      />

      {/* 4. Missions */}
      <MissionsSection 
        missions={missions} 
        profileId={profile?.id} 
        onShowSuccess={showSuccess} 
        refresh={refresh} 
      />

    </motion.div>
  )
}