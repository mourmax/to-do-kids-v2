import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CompletionModal({ isOpen, onClose, onNavigateToChildren }) {
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
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-orange-500/30 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl shadow-orange-500/20 relative"
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
                        <div className="bg-orange-500 p-4 rounded-full text-white shadow-lg shadow-orange-500/30">
                            <Check size={32} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-3 mb-8">
                        <h2 className="text-2xl font-black uppercase text-orange-400 tracking-widest">
                            {t('completion_modal.title')}
                        </h2>
                        <p className="text-sm text-slate-300 max-w-md mx-auto">
                            {t('completion_modal.subtitle')}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-5 mb-8">
                        {/* Step 1 */}
                        <div>
                            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 mb-3">
                                <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                {t('completion_modal.step1_title')}
                            </h3>
                            <ul className="text-left text-xs text-slate-400 space-y-2 pl-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span>{t('completion_modal.step1_item1')} <strong className="text-white">To Do Kids</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span>{t('completion_modal.step1_item2')} <strong className="text-white">{t('completion_modal.step1_item2_bold')}</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span>{t('completion_modal.step1_item3')} <strong className="text-white">{t('completion_modal.step1_item3_bold')}</strong> {t('completion_modal.step1_item3_end')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Step 2 */}
                        <div className="border-t border-white/5 pt-5">
                            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2 mb-3">
                                <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                {t('completion_modal.step2_title')}
                            </h3>
                            <p className="text-xs text-slate-400 text-left pl-8">
                                {t('completion_modal.step2_text')} <strong className="text-white">{t('completion_modal.step2_text_bold')}</strong> {t('completion_modal.step2_text_end')}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onNavigateToChildren}
                        className="w-full bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                    >
                        {t('completion_modal.button')}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
