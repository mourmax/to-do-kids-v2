import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sécurité : Vérification que les clés sont bien chargées
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR : Variables Supabase manquantes dans le fichier .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)