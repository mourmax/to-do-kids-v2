PRD : To Do Kids - Challenge & Reward
1. Project Overview
Une application PWA de gestion de tâches pour enfants basée sur des cycles de 1 à 3 jours (extensible).

Objectif : Créer une boucle d'engagement où l'enfant complète des missions pour débloquer une récompense réelle définie par le parent.

Différenciateur : Système de validation croisée (Enfant -> Parent) et gestion de "Série" (Streak) avec malus en cas d'échec.

2. Tech Stack & Architecture
Frontend : React 19 (Vite), Tailwind CSS.

Animations : Framer Motion & Canvas-confetti.

Backend/Database : Supabase (PostgreSQL + Auth).

PWA : Vite-plugin-pwa (pour l'aspect application native).

Drag & Drop : Hello-pangea/dnd (pour l'ordre des missions).

3. Database Schema (SQL Supabase)
SQL
-- Profils (Parent & Enfants rattachés)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  family_name TEXT,
  parent_password_hash TEXT, -- Pour le switch de mode
  is_pro BOOLEAN DEFAULT false,
  PRIMARY KEY (id)
);

-- Missions (Modèles créés par le parent)
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  icon TEXT, -- Nom de l'icone Lucide
  points INT DEFAULT 1,
  order_index INT
);

-- Suivi Quotidien (Instance de mission pour un jour donné)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id),
  date DATE DEFAULT CURRENT_DATE,
  child_validated BOOLEAN DEFAULT false,
  parent_validated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' -- 'pending', 'completed', 'failed'
);

-- Challenges (La série en cours)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id),
  reward_name TEXT, -- ex: "Soirée Burger"
  duration_days INT DEFAULT 3,
  current_streak INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  penalty_days INT DEFAULT 0 -- Malus si échec
);
4. Core Features & User Stories
Mode Enfant : Interface simplifiée avec de grosses cartes. L'enfant clique pour valider. Confettis au clic.

Mode Parent : Dashboard d'administration. Validation finale des missions de la journée. Si OK -> +1 au compteur de série.

Système de Récompense : Quand current_streak == duration_days, affichage d'un écran de victoire avec la récompense gagnée.

Logique de Malus : Si une journée est incomplète, le parent peut déclencher le "Reset" qui remet la série à 0 ou ajoute un jour de pénalité.

5. UI & Design Guidelines
Palette : Couleurs vives mais douces (Bleu ciel, Jaune pastel, Vert menthe).

Composants : Cards avec des bords très arrondis (rounded-3xl), ombres douces.

Feedback : Utiliser framer-motion pour chaque transition de vue.

Development Roadmap (Mode Composer)
Étape 1 : Interface de Switch. Créer le composant de navigation entre "Vue Enfant" et "Vue Parent" (avec protection par mot de passe simple).

Étape 2 : Gestion des Missions. Interface Parent pour créer/modifier les missions (CRUD avec Drag & Drop).

Étape 3 : Logique de Validation. Système de double validation (Enfant coche -> Parent confirme).

Étape 4 : Le Moteur de Challenge. Calcul de la série (Streak) et écran de célébration de la récompense.

Étape 5 : Système de Malus. Implémentation du reset de série en cas d'échec.