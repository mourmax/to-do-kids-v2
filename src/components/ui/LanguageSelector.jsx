import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'fr', label: 'Français', region: 'fr' },
    { code: 'en', label: 'English', region: 'gb' },
    { code: 'es', label: 'Español', region: 'es' },
    { code: 'de', label: 'Deutsch', region: 'de' },
    { code: 'it', label: 'Italiano', region: 'it' },
    { code: 'pt', label: 'Português', region: 'pt' }
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    const getFlagUrl = (region) => `https://flagcdn.com/w80/${region}.png`;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md shadow-2xl border-2 border-white/10 px-3 py-2 rounded-2xl hover:border-indigo-500/50 transition-all hover:scale-105 active:scale-95 group"
            >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors">
                    <img
                        src={getFlagUrl(currentLanguage.region)}
                        alt={currentLanguage.label}
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="text-xs font-black uppercase tracking-tighter text-slate-400 group-hover:text-white transition-colors">
                    {currentLanguage.code}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-2 grid gap-1">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            i18n.changeLanguage(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center gap-3 w-full p-2.5 rounded-2xl transition-all ${i18n.language === lang.code
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'hover:bg-white/10 text-slate-300'
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                                            <img
                                                src={getFlagUrl(lang.region)}
                                                alt={lang.label}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-bold">{lang.label}</span>
                                        {i18n.language === lang.code && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
