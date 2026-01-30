import { motion } from 'framer-motion'
import { CheckCircle2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OnboardingInfoBlock({ step, title, description, icon: Icon }) {
    const { t } = useTranslation()
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-[2rem] p-4 mb-4 relative overflow-hidden group shadow-2xl shadow-indigo-600/5"
        >
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                    <Icon size={24} className="text-white" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5">
                            {t('common.step_badge')} {step}
                        </span>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic">{title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
