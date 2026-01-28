import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Sparkles, Trophy, ChevronRight, ArrowLeft } from 'lucide-react'
import Toast from '../Toast'

// Imports des sous-sections
import IdentitySection from '../settings/IdentitySection'
import SecuritySection from '../settings/SecuritySection'
import FamilySection from '../settings/FamilySection'
import ChallengeSection from '../settings/ChallengeSection'
import MissionsSection from '../settings/MissionsSection'

export default function SettingsTab({ family, profile, profiles, challenge, missions, refresh, activeSubMenu: propSubMenu, onSubMenuChange }) {
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState(null)

  // Si on a des props contrôlées, on les utilise, sinon on reste en local
  const [localSubMenu, setLocalSubMenu] = useState('missions')
  const activeSubMenu = propSubMenu || localSubMenu
  const setActiveSubMenu = onSubMenuChange || setLocalSubMenu

  const showSuccess = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const subTabs = [
    { id: 'missions', label: "Missions", icon: <Sparkles size={16} /> },
    { id: 'challenge', label: "Défi", icon: <Trophy size={16} /> },
    { id: 'children', label: "Enfants", icon: <Users size={16} /> },
  ]

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      {/* 🟢 SUB-NAVIGATION PERSISTANTE */}
      <div className="flex justify-center -mt-4 mb-8">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubMenu(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${activeSubMenu === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className={`${activeSubMenu === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubMenu}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          {activeSubMenu === 'children' && (
            <div className="space-y-8">
              <IdentitySection familyId={family?.id} profile={profile} profiles={profiles} onShowSuccess={showSuccess} refresh={refresh} />
              <FamilySection family={family} />
              <SecuritySection profile={profile} onShowSuccess={showSuccess} />
            </div>
          )}

          {activeSubMenu === 'missions' && (
            <MissionsSection missions={missions} profiles={profiles} familyId={family?.id} profileId={profile?.id} onShowSuccess={showSuccess} refresh={refresh} />
          )}

          {activeSubMenu === 'challenge' && (
            <ChallengeSection challenge={challenge} onShowSuccess={showSuccess} refresh={refresh} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}