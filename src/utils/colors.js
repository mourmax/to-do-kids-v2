/**
 * Retourne les classes Tailwind pour un profil enfant selon sa couleur.
 * Utilisé dans ParentDashboard (sélecteur de profils) et ValidationTab (encadré).
 *
 * @param {'rose'|'sky'|'emerald'|'amber'|'violet'} colorName
 * @returns {{ inactive: string, active: string, badge: string }}
 */
export function getProfileColorClasses(colorName) {
  const inactive = {
    rose:    'bg-rose-500/20 border-rose-500/30 text-rose-300',
    sky:     'bg-sky-500/20 border-sky-500/30 text-sky-300',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    amber:   'bg-amber-500/20 border-amber-500/30 text-amber-300',
    violet:  'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  }
  const active = {
    rose:    'bg-rose-500 text-white shadow-rose-500/20',
    sky:     'bg-sky-500 text-white shadow-sky-500/20',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/20',
    amber:   'bg-amber-500 text-white shadow-amber-500/20',
    violet:  'bg-indigo-500 text-white shadow-indigo-500/20',
  }
  // Variante badge (utilisée dans ValidationTab)
  const badge = {
    rose:    'bg-rose-500/10 border-rose-500 text-rose-500',
    sky:     'bg-sky-500/10 border-sky-500 text-sky-500',
    emerald: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
    amber:   'bg-amber-500/10 border-amber-500 text-amber-500',
    violet:  'bg-indigo-500/10 border-indigo-500 text-indigo-500',
  }

  return {
    inactive: inactive[colorName] ?? inactive.violet,
    active:   active[colorName]   ?? active.violet,
    badge:    badge[colorName]    ?? badge.violet,
  }
}
