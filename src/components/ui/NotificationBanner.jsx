import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotificationBanner({ notifications, onSelect, onDismiss }) {
    const { t } = useTranslation()
    if (!notifications || notifications.length === 0) return null

    return (
        <div className="fixed top-20 left-0 right-0 z-40 px-4 flex flex-col items-center gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.button
                        key={notif.profile_id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        onClick={() => onSelect(notif.profile_id)}
                        className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto border border-white/10 max-w-md w-full"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                            <Bell size={20} className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-black uppercase text-[11px] tracking-widest">{t('validation.required')}</h4>
                            <p className="text-sm font-medium leading-tight">
                                <span className="font-bold text-indigo-200">{notif.child_name}</span> {t('validation.finished_day')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {onDismiss && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDismiss(notif.profile_id)
                                    }}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            )}
                        </div>
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
    )
}
