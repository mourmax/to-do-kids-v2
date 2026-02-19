import { motion } from 'framer-motion'
import { CheckCircle2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OnboardingInfoBlock({ step, title, description, icon: Icon }) {
    const { t } = useTranslation()
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-50 border-2 border-violet-200 rounded-[2rem] p-4 mb-4 relative overflow-hidden group shadow-sm"
        >
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/40 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-violet-300/40 transition-colors" />

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-300/40 shrink-0">
                    <Icon size={24} className="text-white" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-violet-200">
                            {t('common.step_badge')} {step}
                        </span>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">{title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
