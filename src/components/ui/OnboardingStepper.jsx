import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OnboardingStepper({ currentStep, onStepClick }) {
    const { t } = useTranslation()

    const steps = [
        { key: 'pin', label: t('onboarding.step_pin') },
        { key: 'child', label: t('onboarding.step_child') },
        { key: 'mission', label: t('onboarding.step_mission') },
        { key: 'challenge', label: t('onboarding.step_challenge') }
    ]

    const currentIndex = currentStep === 'done' ? steps.length : steps.findIndex(s => s.key === currentStep)

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
            {/* Desktop View - Horizontal Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex
                    const isClickable = index <= currentIndex && onStepClick

                    return (
                        <div key={step.key} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <button
                                onClick={() => isClickable && onStepClick(step.key)}
                                disabled={!isClickable}
                                className={`relative flex flex-col items-center gap-2 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                        backgroundColor: isCompleted
                                            ? '#10b981'
                                            : isCurrent
                                                ? '#6366f1'
                                                : '#334155'
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-lg ${isCurrent ? 'ring-4 ring-indigo-500/30' : ''
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check size={24} strokeWidth={3} />
                                    ) : (
                                        <span className="text-lg">{index + 1}</span>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isCurrent
                                        ? 'text-white'
                                        : isCompleted
                                            ? 'text-emerald-400'
                                            : 'text-slate-500'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-4 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            width: index < currentIndex ? '100%' : '0%'
                                        }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Mobile View - Compact Stepper */}
            <div className="md:hidden">
                <div className="flex items-center justify-center gap-2 mb-4">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentIndex
                        const isCurrent = index === currentIndex

                        return (
                            <div key={step.key} className="flex items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        backgroundColor: isCompleted
                                            ? '#10b981'
                                            : isCurrent
                                                ? '#6366f1'
                                                : '#334155'
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs ${isCurrent ? 'ring-4 ring-indigo-500/30' : ''
                                        }`}
                                >
                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <div className="w-8 h-1 mx-1 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                width: index < currentIndex ? '100%' : '0%'
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Current Step Label */}
                <div className="text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                        {t('onboarding.step')} {Math.min(currentIndex + 1, steps.length)}/{steps.length}
                    </p>
                    <p className="text-white text-sm font-black uppercase tracking-wider">
                        {steps[currentIndex]?.label}
                    </p>
                </div>
            </div>
        </div>
    )
}
