import { motion } from 'framer-motion'
import { ICON_LIBRARY } from '../../constants/icons' // Assurez-vous du bon chemin

export default function IconPicker({ onSelect }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="absolute z-[100] mt-2 bg-slate-900 border border-white/10 p-4 rounded-3xl shadow-2xl max-w-[280px]"
    >
      <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {ICON_LIBRARY.map((group) => (
          <div key={group.cat} className="mb-4">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">{group.cat}</p>
            <div className="grid grid-cols-5 gap-2">
              {group.icons.map(icon => (
                <button 
                  key={icon} 
                  type="button" 
                  onClick={() => onSelect(icon)} 
                  className="text-xl p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}