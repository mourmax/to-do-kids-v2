import { useState } from 'react'
import { motion } from 'framer-motion'
import { Delete, ChevronRight, Lock } from 'lucide-react'

// On récupère correctPin depuis les props
export default function ParentPinModal({ onSuccess, onClose, correctPin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKeyPress = (val) => {
    if (error) setError(false)
    if (val === 'delete') {
      setPin(prev => prev.slice(0, -1))
      return
    }
    if (pin.length < 4) {
      const newPin = pin + val
      setPin(newPin)
      if (newPin.length === 4) {
        // Utilisation du code dynamique au lieu de "1234"
        if (newPin === correctPin) {
          setTimeout(onSuccess, 200)
        } else {
          setError(true)
          setTimeout(() => { setPin(''); setError(false); }, 600)
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 font-bold text-xs"
        >
          FERMER
        </button>

        <div className="flex flex-col items-center mb-5">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
            <Lock size={18} />
          </div>
          <h2 className="text-slate-800 font-black uppercase tracking-widest text-[10px]">Accès Parent</h2>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full border-2 transition-all ${
              pin.length > i ? (error ? 'bg-red-500 border-red-500' : 'bg-indigo-600 border-indigo-600') : 'border-slate-200'
            }`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'delete', 0, 'next'].map((val, i) => {
            if (val === 'next') return (
              <button 
                key={i} 
                onClick={() => pin === correctPin && onSuccess()}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${pin === correctPin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            )
            if (val === 'delete') return (
              <button key={i} onClick={() => handleKeyPress('delete')} className="aspect-square rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                <Delete size={20} />
              </button>
            )
            return (
              <button key={i} onClick={() => handleKeyPress(val)} className="aspect-square rounded-2xl bg-slate-50 text-slate-800 text-xl font-black hover:bg-slate-100 border border-slate-100/50">
                {val}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}