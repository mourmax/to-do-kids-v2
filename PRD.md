PRD : To-Do Kids V3 - Ecosystème Premium & Multi-Enfant
1. Project Overview
Une application PWA SaaS de gestion de tâches pour familles, supportant plusieurs enfants et une monétisation via Stripe.

Objectif : Créer un environnement complet pour les parents afin de gérer l'autonomie de plusieurs enfants avec des récompenses et un suivi premium.

2. Tech Stack & Architecture
Frontend : React 19 (Vite), Tailwind CSS v4.
Animations : Framer Motion & Canvas-confetti.
Backend/Database : Supabase (PostgreSQL + Auth).
PWA : Vite-plugin-pwa (Offline ready).
Paiements : Stripe (Abonnement Premium).
i18n : Français/Anglais.

3. Database Schema (V3 SQL)
```sql
-- Familles (Cœur de l'écosystème)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_owner_id UUID REFERENCES auth.users(id),
  invite_code TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium', 'canceled'
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profils (Un parent peut avoir plusieurs profils enfants)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  pin_code TEXT, -- Optionnel pour l'enfant, requis pour le parent switch
  avatar_url TEXT,
  is_parent BOOLEAN DEFAULT false,
  PRIMARY KEY (id)
);

-- Missions
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  points INT DEFAULT 1,
  order_index INT,
  is_predefined BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES profiles(id) -- NULL = "all"
);

-- Suivi (Daily Logs)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  child_validated BOOLEAN DEFAULT false,
  parent_validated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending'
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  reward_name TEXT,
  duration_days INT DEFAULT 3,
  current_streak INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES profiles(id)
);
```

4. Core Features (Roadmap V3)
Étape 1 : Architecture "Core" & Base de Données. Mise en place du schéma Famille > Parent > Enfants. i18n setup.
Étape 2 : Tunnel d'Authentification "Bridge". Gestion des invitations et sélecteur de rôle au démarrage.
Étape 3 : Intégration Stripe & Paywall. Restrictions Freemium (1 enfant, 5 missions).
Étape 4 : Bibliothèque de Missions & Catalogue. 20+ missions prédéfinies.
Étape 5 : Personnalisation. Avatars, Thèmes Light/Dark (Premium).
Étape 6 : Temps & Calendrier. Scheduling, rappels et historique hebdomadaire.

5. UI & Design Guidelines
Palette : Cobalt, Indigo, Slate. Design "Glassmorphism" et micro-animations.
Responsive : Mobile-first pour l'enfant, Wide/Dashboard pour le parent.
