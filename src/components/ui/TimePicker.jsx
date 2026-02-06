import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, X } from 'lucide-react'

export default function TimePicker({ value, onChange, onClose }) {
    // value is expected to be "HH:mm" or ""
    const initialTime = value || "12:00"
    const [h, m] = initialTime.split(':')
    const [selectedHour, setSelectedHour] = useState(parseInt(h) || 12)
    const [selectedMinute, setSelectedMinute] = useState(parseInt(m) || 0)

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // Step of 5 for easier picking

    const handleSave = () => {
        const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
        onChange(timeString)
        onClose()
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-6 w-72 backdrop-blur-xl relative z-[100]"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Sélecteur d'Heure</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="flex gap-4 items-center justify-center mb-8">
                {/* Hours */}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Heures</span>
                    <div className="h-40 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory px-4 py-16 bg-black/20 rounded-2xl border border-white/5">
                        {hours.map(hour => (
                            <button
                                key={hour}
                                onClick={() => setSelectedHour(hour)}
                                className={`h-10 w-12 flex items-center justify-center font-black text-lg transition-all snap-center ${selectedHour === hour ? 'text-indigo-400 scale-125' : 'text-slate-600 opacity-40 hover:opacity-100'}`}
                            >
                                {hour.toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>

                <span className="text-2xl font-black text-white/20 pt-4">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Minutes</span>
                    <div className="h-40 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory px-4 py-16 bg-black/20 rounded-2xl border border-white/5">
                        {[...minutes, ...[1, 2, 3, 4, 6, 7, 8, 9]].sort((a, b) => a - b).filter((v, i, a) => a.indexOf(v) === i).map(min => (
                            <button
                                key={min}
                                onClick={() => setSelectedMinute(min)}
                                className={`h-10 w-12 flex items-center justify-center font-black text-lg transition-all snap-center ${selectedMinute === min ? 'text-indigo-400 scale-125' : 'text-slate-600 opacity-40 hover:opacity-100'}`}
                            >
                                {min.toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Check size={14} /> Valider l'Heure
                </button>
            </div>
        </motion.div>
    )
}
