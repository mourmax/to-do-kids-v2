import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OnboardingCompletionModal({ isOpen, onClose, inviteCode, childName, onComplete }) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const handleCopyCode = () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(inviteCode)
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea")
                textArea.value = inviteCode
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

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
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-indigo-500/20 relative"
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
                        <div className="bg-indigo-500 p-4 rounded-full text-white shadow-lg shadow-indigo-500/30">
                            <Check size={32} />
                        </div>
                    </div>

                    {/* Title & Instructions */}
                    <div className="text-center space-y-4 mb-8">
                        <h2 className="text-2xl font-black uppercase text-indigo-400 tracking-widest">
                            {t('onboarding.setup_complete')}
                        </h2>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
                            <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">Comment connecter l'enfant ?</p>
                            <div className="flex flex-col gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">1</span>
                                    <span>Ouvrir l'application sur son device</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">2</span>
                                    <span>Sélectionner : <span className="text-indigo-400">"Je suis un enfant"</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">3</span>
                                    <span>Entrer le code ci-dessous</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">4</span>
                                    <span>Accéder à son interface</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invite Code Display */}
                    <div className="bg-slate-950/50 border-2 border-orange-500 rounded-2xl p-6 mb-6 animate-pulse shadow-lg shadow-orange-500/30">
                        <div className="text-center space-y-3">
                            <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">
                                {t('onboarding.child_invite_code', { name: childName })}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-black text-orange-400 tracking-widest font-mono">
                                    {inviteCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 scale-110' : 'hover:bg-orange-500/10 text-orange-400'}`}
                                    title={t('actions.copy')}
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                                {t('onboarding.transmit_code_message')}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onComplete}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        {t('onboarding.finish_setup')}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
