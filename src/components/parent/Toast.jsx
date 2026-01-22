import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = "success" }) {
  const isError = type === "error"

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xs pointer-events-none"
    >
      <div className={`px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border backdrop-blur-md ${
        isError 
        ? 'bg-red-500 border-red-400/50 text-white' 
        : 'bg-emerald-500 border-emerald-400/50 text-white'
      }`}>
        {isError ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
        <span className="font-black uppercase text-[10px] tracking-widest leading-tight">
          {message}
        </span>
      </div>
    </motion.div>
  )
}