import { useState } from 'react'
import { motion } from 'framer-motion'
import { Delete, LogOut } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useTranslation } from 'react-i18next'

export default function ParentPinModal({ onSuccess, onClose, correctPin }) {
  const { t } = useTranslation()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onSuccess()
        } else {
          setError(true)
          setTimeout(() => {
            setPin('')
            setError(false)
          }, 400)
        }
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  // 🔥 FONCTION CLÉ : CODE OUBLIÉ
  const handleForgotPin = async () => {
    if (confirm("Code oublié ?\n\nSécurité : Vous allez être déconnecté.\nReconnectez-vous avec votre email ou Google pour définir un nouveau code.")) {
      // 1. On pose le "drapeau" pour dire qu'on veut reset le PIN
      localStorage.setItem('reset_pin_mode', 'true')

      // 2. On déconnecte
      await supabase.auth.signOut()

      // 3. On recharge la page pour renvoyer vers l'Auth
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 font-bold text-xs uppercase"
        >
          {t('pin.cancel')}
        </button>

        <div className="text-center mb-8 mt-2">
          <h2 className="text-slate-800 font-black uppercase tracking-widest text-sm mb-1">{t('pin.access_title')}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase">{t('pin.enter_code')}</p>
        </div>

        {/* --- INDICATEURS PIN --- */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${error
                  ? 'bg-red-500 scale-110'
                  : pin.length > i
                    ? 'bg-indigo-600 scale-100'
                    : 'bg-slate-100'
                }`}
            />
          ))}
        </div>

        {/* --- CLAVIER NUMÉRIQUE --- */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-16 rounded-2xl bg-slate-50 text-xl font-black text-slate-700 active:bg-indigo-50 active:scale-95 transition-all shadow-sm border border-slate-100"
            >
              {num}
            </button>
          ))}
          <div className="pointer-events-none"></div>
          <button
            onClick={() => handleNumberClick(0)}
            className="h-16 rounded-2xl bg-slate-50 text-xl font-black text-slate-700 active:bg-indigo-50 active:scale-95 transition-all shadow-sm border border-slate-100"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center active:bg-red-100 active:scale-95 transition-all"
          >
            <Delete size={24} />
          </button>
        </div>

        {/* --- BOUTON CODE OUBLIÉ --- */}
        <button
          onClick={handleForgotPin}
          className="w-full py-3 text-center text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-t border-slate-100 mt-2"
        >
          <LogOut size={12} /> {t('pin.forgot_code')}
        </button>

      </motion.div>
    </div>
  )
}