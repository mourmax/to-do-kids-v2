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
        <SectionCard icon={Users} colorClass="text-gray-400" title={t('settings.family_title')}>
            <div className="space-y-3">
                <p className="text-gray-400 text-xs font-semibold">
                    {t('settings.family_access_title')}
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Code famille</p>
                        <span className="text-xl font-black text-gray-700 tracking-[0.2em]">
                            {family?.invite_code || '------'}
                        </span>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${copied
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100'
                            : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                    <p className="text-[10px] text-indigo-600 font-semibold leading-relaxed">
                        {t('settings.family_access_hint')}
                    </p>
                </div>
            </div>
        </SectionCard>
    )
}
