import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, X } from 'lucide-react'

export default function TimePicker({ value, onChange, onClose }) {
    const initialTime = value || "12:00"
    const [h, m] = initialTime.split(':')
    const [selectedHour, setSelectedHour] = useState(parseInt(h) || 12)
    const [selectedMinute, setSelectedMinute] = useState(parseInt(m) || 0)

    const hourRef = useRef(null)
    const minRef = useRef(null)

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
    // Detailed minutes for edge cases or full selection if preferred, but keeping 5-min steps for "clean" look
    const allMinutes = Array.from({ length: 60 }, (_, i) => i)

    useEffect(() => {
        // Initial scroll to center the selected values
        if (hourRef.current) hourRef.current.scrollTop = selectedHour * 48
        if (minRef.current) minRef.current.scrollTop = selectedMinute * 48
    }, [])

    const handleScroll = (e, type) => {
        const scrollTop = e.target.scrollTop
        const index = Math.round(scrollTop / 48)
        if (type === 'h') {
            if (hours[index] !== undefined && hours[index] !== selectedHour) {
                setSelectedHour(hours[index])
            }
        } else {
            if (allMinutes[index] !== undefined && allMinutes[index] !== selectedMinute) {
                setSelectedMinute(allMinutes[index])
            }
        }
    }

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
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-6 w-80 backdrop-blur-xl relative z-[100] overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Clock size={18} className="text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Rappel Horaire</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="relative flex gap-4 items-center justify-center mb-8 h-48 group">
                {/* Visual Central Highlight Bar */}
                <div className="absolute left-4 right-4 h-12 bg-white/5 border-y border-white/10 rounded-xl pointer-events-none z-0" style={{ top: '50%', transform: 'translateY(-50%)' }} />

                {/* Hours Wheel */}
                <div className="flex flex-col items-center flex-1 relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest opacity-50">Heures</span>
                    <div
                        ref={hourRef}
                        onScroll={(e) => handleScroll(e, 'h')}
                        className="h-40 w-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory py-[56px] px-2"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)' }}
                    >
                        {hours.map(hour => (
                            <div key={hour} className="h-12 flex items-center justify-center snap-center">
                                <span className={`text-2xl font-black transition-all duration-300 ${selectedHour === hour ? 'text-indigo-400 scale-125' : 'text-slate-600 opacity-20'}`}>
                                    {hour.toString().padStart(2, '0')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <span className="text-2xl font-black text-white/10 mt-6">:</span>

                {/* Minutes Wheel */}
                <div className="flex flex-col items-center flex-1 relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest opacity-50">Minutes</span>
                    <div
                        ref={minRef}
                        onScroll={(e) => handleScroll(e, 'm')}
                        className="h-40 w-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory py-[56px] px-2"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)' }}
                    >
                        {allMinutes.map(min => (
                            <div key={min} className="h-12 flex items-center justify-center snap-center">
                                <span className={`text-2xl font-black transition-all duration-300 ${selectedMinute === min ? 'text-indigo-400 scale-125' : 'text-slate-600 opacity-20'}`}>
                                    {min.toString().padStart(2, '0')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                    <Check size={16} className="group-hover:scale-110 transition-transform" />
                    Valider le rappel
                </button>
            </div>
        </motion.div>
    )
}
