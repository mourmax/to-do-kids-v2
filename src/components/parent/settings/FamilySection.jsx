import { useState } from 'react'
import { Users, Copy, Check } from 'lucide-react'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'

export default function FamilySection({ family }) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (!family?.invite_code) return
        navigator.clipboard.writeText(family.invite_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <SectionCard icon={Users} colorClass="text-indigo-400" title={t('settings.family_title')}>
            <div className="space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {t('settings.family_access_title')}
                </p>

                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="space-y-1">
                        <span className="text-3xl font-black text-white tracking-[0.2em] italic uppercase">
                            {family?.invite_code || '------'}
                        </span>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-tight leading-relaxed">
                        {t('settings.family_access_hint')}
                    </p>
                </div>
            </div>
        </SectionCard>
    )
}
