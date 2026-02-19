import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'
import { useTranslation } from 'react-i18next'

export default function SecuritySection({ theme = {}, profile, onShowSuccess }) {
  const { t } = useTranslation()
  const [newPin, setNewPin] = useState('')

  const saveNewPin = async () => {
    if (newPin.length !== 4) return onShowSuccess("Le code doit faire 4 chiffres")

    const { error } = await supabase.from('profiles').update({ pin_code: newPin }).eq('id', profile.id)
    if (!error) {
      setNewPin('')
      onShowSuccess("Nouveau code enregistré !")
    }
  }

  return (
    <SectionCard theme={theme} icon={Lock} colorClass="text-rose-500" title={t('settings.security_title')}>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase font-black ml-1 mb-1 block">{t('settings.security_label')}</label>
          <input
            type="tel"
            maxLength={4}
            placeholder="••••"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
            className={`w-full bg-white border ${theme.border || 'border-violet-200'} rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-slate-800 focus:border-rose-400 transition-colors tracking-[0.5em] text-center`}
          />
        </div>
        <button
          onClick={saveNewPin}
          disabled={newPin.length !== 4}
          className="bg-rose-500 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 p-3 rounded-2xl hover:bg-rose-400 shadow-sm text-white active:scale-95 transition-all h-[52px] w-[52px] flex items-center justify-center"
        >
          <Check size={20} />
        </button>
      </div>
    </SectionCard>
  )
}