import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ProfileCompletionModal({ isOpen, onClose, onNavigateToMissions }) {
    const { t } = useTranslation()
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-500/30 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl shadow-emerald-500/20 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-emerald-500 p-4 rounded-full text-white shadow-lg shadow-emerald-500/30">
                            <Check size={32} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-3 mb-8">
                        <h2 className="text-2xl font-black uppercase text-emerald-400 tracking-widest">
                            {t('onboarding.profile_configured')}
                        </h2>
                        <p className="text-sm text-slate-300 max-w-md mx-auto">
                            {t('onboarding.profile_configured_subtitle')}
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onNavigateToMissions}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        {t('onboarding.next_step_missions')}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
