import { useState } from 'react'
import { supabase } from './supabaseClient'
import { motion } from 'framer-motion'
import { Trophy, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './components/ui/LanguageSelector'

export default function Auth({ onBack }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // Pour basculer entre Connexion et Inscription

  // 1. Connexion via Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  // 2. Connexion Classique Email/Password
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    let result
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password })
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }

    const { error } = result
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Logo Animé */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="bg-indigo-600 p-4 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-8"
      >
        <Trophy size={40} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-4 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          {t('actions.cancel')}
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{isSignUp ? t('auth.signup_title') : t('auth.login_title')}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{isSignUp ? t('auth.signup_subtitle') : t('auth.login_subtitle')}</p>
        </div>

        {/* --- TOGGLE PROMINENT CREER COMPTE / SE CONNECTER --- */}
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 flex gap-1 relative overflow-hidden">
          <motion.div
            layoutId="activeTab"
            className="absolute inset-y-1.5 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20"
            initial={false}
            animate={{
              x: isSignUp ? '100%' : '0%',
              width: 'calc(50% - 3px)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${!isSignUp ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t('auth.login_button')}
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${isSignUp ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t('auth.signup_button') || "S'inscrire"}
          </button>
        </div>

        {/* --- BOUTON GOOGLE --- */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full relative group overflow-hidden bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin text-slate-400" size={20} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
              </svg>
              <span>{isSignUp ? "S'inscrire avec Google" : t('auth.login_google')}</span>
            </>
          )}
        </motion.button>

        {/* Séparateur */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-[9px] font-black uppercase tracking-widest">{t('auth.or_separator')}</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Formulaire Email */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-1 focus-within:border-indigo-500/50 transition-colors">
            <div className="flex items-center px-4">
              <Mail className="text-slate-500" size={16} />
              <input
                type="email"
                placeholder={t('auth.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent p-3 text-white placeholder:text-slate-600 font-bold outline-none text-sm"
              />
            </div>
            <div className="h-[1px] bg-white/5 mx-2" />
            <div className="flex items-center px-4">
              <Lock className="text-slate-500" size={16} />
              <input
                type="password"
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent p-3 text-white placeholder:text-slate-600 font-bold outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? "Créer mon compte" : t('auth.login_button')} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      </motion.div>
    </div>
  )
}