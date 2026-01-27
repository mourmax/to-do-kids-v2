import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MISSION_CATALOG = [
    {
        category: 'hygiene', missions: [
            { title: 'Se brosser les dents', icon: '🪥' },
            { title: 'Prendre sa douche', icon: '🚿' },
            { title: 'Se laver les mains', icon: '🧼' },
            { title: 'Mettre son pyjama', icon: '🌙' },
            { title: 'Se coiffer', icon: '🪮' },
            { title: 'Préparer ses vêtements', icon: '👕' },
        ]
    },
    {
        category: 'house', missions: [
            { title: 'Ranger ses jouets', icon: '🧸' },
            { title: 'Faire son lit', icon: '🛏️' },
            { title: 'Mettre la table', icon: '🍽️' },
            { title: 'Débarrasser la table', icon: '🥣' },
            { title: 'Aider à la cuisine', icon: '👨‍🍳' },
            { title: 'Ranger ses chaussures', icon: '👟' },
        ]
    },
    {
        category: 'school', missions: [
            { title: 'Faire ses devoirs', icon: '📚' },
            { title: 'Préparer son sac', icon: '🎒' },
            { title: 'Lire 15 minutes', icon: '📖' },
            { title: 'Pratiquer un instrument', icon: '🎸' },
            { title: 'Dessiner / Créer', icon: '🎨' },
        ]
    },
    {
        category: 'behavior', missions: [
            { title: 'Être poli(e)', icon: '🙏' },
            { title: 'Partager ses jeux', icon: '🤝' },
            { title: 'Dire merci / s\'il vous plaît', icon: '✨' },
        ]
    }
]

export default function MissionLibrary({ onClose, onSelect, currentCount }) {
    const { t } = useTranslation()

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                            {t('library.title')}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {currentCount} / 5 {t('library.missions_count')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 pb-12">
                    {MISSION_CATALOG.map((cat) => (
                        <div key={cat.category} className="space-y-4">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">
                                {t(`library.category_${cat.category}`)}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {cat.missions.map((mission) => (
                                    <button
                                        key={mission.title}
                                        onClick={() => onSelect(mission)}
                                        className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group active:scale-[0.98]"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">
                                            {mission.icon}
                                        </span>
                                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors text-left leading-tight">
                                            {mission.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
