-- =============================================================================
-- verify_parent_pin — Supabase RPC
-- =============================================================================
-- But : comparer le PIN côté serveur pour ne JAMAIS exposer sa valeur au client.
-- Le client appelle cette fonction et reçoit uniquement un boolean.
--
-- Comment l'exécuter :
--   1. Ouvrir la console Supabase → SQL Editor
--   2. Coller et exécuter ce fichier entier
-- =============================================================================

CREATE OR REPLACE FUNCTION public.verify_parent_pin(
  p_profile_id uuid,
  p_input_pin  text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id         = p_profile_id
      AND is_parent  = true
      AND pin_code   = p_input_pin
      AND pin_code   IS NOT NULL
  );
$$;

-- Autoriser les utilisateurs anonymes et authentifiés à appeler cette fonction.
-- La fonction s'exécute avec les droits du owner (SECURITY DEFINER),
-- donc les RLS de la table profiles ne bloquent pas la lecture interne.
GRANT EXECUTE ON FUNCTION public.verify_parent_pin TO anon, authenticated;
