import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Baby, ArrowRight, Key } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../ui/LanguageSelector'

export default function RoleSelection({ onSelectParent, onSelectChild }) {
    const { t } = useTranslation()
    const [view, setView] = useState('selection') // 'selection' or 'invite_code'
    const [inviteCode, setInviteCode] = useState('')
    const [error, setError] = useState('')

    const handleInviteSubmit = (e) => {
        e.preventDefault()
        if (inviteCode.length === 6) {
            onSelectChild(inviteCode)
        } else {
            setError(t('errors.invalid_code'))
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>

            <AnimatePresence mode="wait">
                {view === 'selection' ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md space-y-6"
                    >
                        <div className="text-center space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 p-2 bg-slate-900">
                                    <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                                {t('auth.login_title')}
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                {t('auth.login_subtitle')}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => setView('invite_code')}
                                className="group relative bg-indigo-600 hover:bg-indigo-500 p-6 rounded-3xl border-4 border-indigo-400 transition-all duration-300 text-left overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Baby className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic">
                                            {t('auth.i_am_child')}
                                        </h3>
                                        <p className="text-indigo-200 text-sm font-bold">
                                            {t('auth.enter_code')}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-white ml-auto group-hover:translate-x-2 transition-transform" />
                                </div>
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                            </button>

                            <button
                                onClick={onSelectParent}
                                className="group relative bg-slate-800 hover:bg-slate-700 p-6 rounded-3xl border-4 border-slate-700 transition-all duration-300 text-left overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic">
                                            {t('auth.i_am_parent')}
                                        </h3>
                                        <p className="text-slate-400 text-sm font-bold">
                                            {t('auth.login_button')}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-white ml-auto group-hover:translate-x-2 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="invite"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md space-y-6"
                    >
                        <button
                            onClick={() => setView('selection')}
                            className="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            {t('actions.cancel')}
                        </button>

                        <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-4 bg-indigo-500/20 rounded-3xl mb-2">
                                    <Key className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase italic">
                                    {t('auth.invite_code')}
                                </h2>
                                <p className="text-slate-400 text-sm font-bold">
                                    {t('auth.enter_code')}
                                </p>
                            </div>

                            <form onSubmit={handleInviteSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="EX: ABC123"
                                    className="w-full bg-slate-800 border-4 border-slate-700 rounded-2xl p-4 text-center text-3xl font-black text-white placeholder:text-slate-700 focus:border-indigo-500 transition-colors uppercase"
                                    autoFocus
                                />

                                {error && (
                                    <p className="text-rose-500 text-xs font-bold text-center uppercase">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={inviteCode.length !== 6}
                                    className="w-full bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 p-4 rounded-2xl text-white font-black uppercase italic tracking-wider transition-all"
                                >
                                    {t('actions.next')}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
