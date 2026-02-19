import { useState } from 'react'
import { Users, Copy, Check } from 'lucide-react'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'

export default function FamilySection({ theme = {}, family }) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (!family?.invite_code) return
        navigator.clipboard.writeText(family.invite_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <SectionCard theme={theme} icon={Users} colorClass="text-indigo-500" title={t('settings.family_title')}>
            <div className="space-y-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {t('settings.family_access_title')}
                </p>

                <div className={`${theme.codeBg || 'bg-violet-50'} border ${theme.border || 'border-violet-200'} rounded-2xl p-4 flex items-center justify-between group hover:border-violet-300 transition-all`}>
                    <div className="space-y-1">
                        <span className="text-2xl font-black text-slate-800 tracking-[0.2em] uppercase">
                            {family?.invite_code || '------'}
                        </span>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${copied
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                            : `bg-white border ${theme.borderLight || 'border-violet-100'} text-slate-500 hover:text-violet-600 hover:border-violet-200`
                            }`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>

                <div className={`${theme.bg || 'bg-violet-50'} border ${theme.borderLight || 'border-violet-100'} p-3 rounded-xl`}>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight leading-relaxed">
                        {t('settings.family_access_hint')}
                    </p>
                </div>
            </div>
        </SectionCard>
    )
}
