'use client'

import { useState, useEffect } from 'react'

/* ============================================================
   TodoKids — useChildProfile
   Gère la persistance des préférences enfant dans localStorage.
   Clé: todokids_child_${profileId}
   ============================================================ */

/**
 * @param {string} profileId
 * @returns {{
 *   universeKey: string|null,
 *   avatar: {type:'emoji',value:string}|{type:'photo',src:string}|null,
 *   saveUniverse: (key:string)=>void,
 *   saveAvatar: (avatar:object)=>void,
 *   isFirstVisit: boolean,
 * }}
 */
export function useChildProfile(profileId) {
  const key = `todokids_child_${profileId}`

  const [universeKey, setUniverseKey] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // Charger depuis localStorage au montage
  useEffect(() => {
    if (!profileId) return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.universeKey) setUniverseKey(data.universeKey)
        if (data.avatar)      setAvatar(data.avatar)
        setIsFirstVisit(false)
      }
    } catch {
      // JSON invalide — on repart de zéro
    }
  }, [profileId, key])

  function saveUniverse(newKey) {
    setUniverseKey(newKey)
    _persist({ universeKey: newKey, avatar })
  }

  function saveAvatar(newAvatar) {
    setAvatar(newAvatar)
    _persist({ universeKey, avatar: newAvatar })
  }

  function _persist(data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // quota exceeded ou mode privé
    }
  }

  return { universeKey, avatar, saveUniverse, saveAvatar, isFirstVisit }
}
