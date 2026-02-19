import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Gère le challenge actif d'un profil enfant (table `challenges`).
 * Responsabilités :
 *  - Fetch du challenge actif pour le profil courant
 *  - Création d'un challenge par défaut s'il n'en existe aucun
 *
 * @returns {{
 *   challenge: object|null,
 *   loadChallenge: function
 * }}
 */
export function useChallenge() {
  const [challenge, setChallenge] = useState(null)

  /**
   * Récupère ou crée le challenge pour un couple (familyId, profileId).
   * Le challenge est STRICTEMENT par enfant (assigned_to = profileId).
   *
   * @param {string} familyId
   * @param {string} profileId  Profil enfant actif
   */
  const loadChallenge = useCallback(async (familyId, profileId) => {
    const { data: challs, error: challError } = await supabase
      .from('challenges')
      .select('*')
      .eq('family_id', familyId)
      .eq('assigned_to', profileId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (challError) console.error("Error fetching challenge:", challError)

    let chall = challs?.[0] || null

    if (!chall) {
      const { data: newChall, error: createError } = await supabase
        .from('challenges')
        .insert([{
          family_id:     familyId,
          assigned_to:   profileId,
          reward_name:   "Cadeau Surprise",
          duration_days: 2,
          is_active:     true,
          current_streak: 0,
        }])
        .select()
        .limit(1)

      if (createError) console.error("Error creating default challenge:", createError)
      chall = newChall?.[0] || null
    }

    setChallenge(chall)
  }, [])

  return { challenge, loadChallenge }
}
