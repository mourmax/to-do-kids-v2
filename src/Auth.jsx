import { useState } from 'react'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })
      
      if (error) throw error
      if (isSignUp) alert("Vérifie tes emails pour confirmer l'inscription !")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-grid-dots [background-size:22px_22px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border-2 border-white/5 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-500/10 rounded-3xl mb-4">
            <Star className="text-indigo-400 w-8 h-8 fill-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">To Do Kids</h1>
          <p className="text-slate-500 font-bold text-xs uppercase mt-2 tracking-widest">
            {isSignUp ? "Créer un compte parent" : "Content de vous revoir"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
            <input 
              type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 p-4 pl-12 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
            <input 
              type="password" placeholder="Mot de passe" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 p-4 pl-12 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] font-black uppercase text-center">
                ⚠️ {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            <ArrowRight size={16} />
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-400 transition-colors"
        >
          {isSignUp ? "Déjà un compte ? Connexion" : "Pas encore de compte ? S'inscrire"}
        </button>
      </motion.div>
    </div>
  )
}