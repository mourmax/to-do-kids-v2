import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function InviteCodeGuideModal({ isOpen, onClose, onNavigateToChildren }) {
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
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl shadow-indigo-500/20 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-500 p-4 rounded-full text-white shadow-lg shadow-indigo-500/30">
                            <Smartphone size={32} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-3 mb-8">
                        <h2 className="text-2xl font-black uppercase text-indigo-400 tracking-widest">
                            {t('invite_guide.title')}
                        </h2>
                        <p className="text-sm text-slate-300 max-w-md mx-auto">
                            {t('invite_guide.subtitle')}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-5 mb-8">
                        {/* Step 1 */}
                        <div>
                            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 mb-3">
                                <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                {t('invite_guide.step1_title')}
                            </h3>
                            <p className="text-xs text-slate-400 text-left pl-8">
                                {t('invite_guide.step1_text')}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="border-t border-white/5 pt-5">
                            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2 mb-3">
                                <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                {t('invite_guide.step2_title')}
                            </h3>
                            <p className="text-xs text-slate-400 text-left pl-8">
                                {t('invite_guide.step2_text')}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="border-t border-white/5 pt-5">
                            <h3 className="text-xs font-black uppercase text-orange-400 tracking-widest flex items-center gap-2 mb-3">
                                <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                {t('invite_guide.step3_title')}
                            </h3>
                            <p className="text-xs text-slate-400 text-left pl-8">
                                {t('invite_guide.step3_text')}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => {
                            if (onNavigateToChildren) {
                                onNavigateToChildren()
                            }
                            onClose()
                        }}
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {t('invite_guide.button')}
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
