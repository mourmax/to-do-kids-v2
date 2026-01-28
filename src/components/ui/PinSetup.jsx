import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import { Lock, Check } from 'lucide-react'

export default function PinSetup({ profileId, onComplete }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (pin.length !== 4) return alert("Le code doit faire 4 chiffres")

    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .update({ pin_code: pin })
      .eq('id', profileId)
      .select()

    if (error) {
      console.error("PIN Update Error:", error)
      alert("Erreur: Impossible de sauvegarder le code PIN. Vérifiez votre connexion.")
      setLoading(false)
    } else if (!data || data.length === 0) {
      console.error("PIN Update failed: No rows affected. RLS or missing linkage.")
      alert("Erreur critique: Votre profil n'est pas correctement lié. Veuillez vous reconnecter.")
      setLoading(false)
    } else {
      console.log("PIN updated successfully for profile:", profileId)
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col items-center justify-center p-6 text-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(79,70,229,0.5)]">
          <Lock size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Code Secret Parent</h2>
          <p className="text-slate-400 text-sm mt-2">Choisis un code à 4 chiffres pour sécuriser l'accès aux réglages.</p>
        </div>

        <input
          type="tel"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
          className="bg-slate-900 border-2 border-indigo-500/50 text-center text-4xl font-black tracking-[1rem] rounded-2xl py-4 w-full focus:outline-none focus:border-indigo-400 transition-all"
          placeholder="••••"
        />

        <button
          onClick={handleSave}
          disabled={loading || pin.length !== 4}
          className="w-full bg-white text-slate-900 font-black uppercase py-4 rounded-2xl tracking-widest hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? "Enregistrement..." : <>Valider <Check size={20} /></>}
        </button>
      </motion.div>
    </div>
  )
}