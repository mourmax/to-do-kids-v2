# Prompt Claude Code — Dashboard Enfant TodoKids

## Contexte
Tu vas implémenter le dashboard enfant de l'application TodoKids.
Trois fichiers de référence sont à la racine du repo :
- `todokids-child-mockup-v2-copy.jsx` → layout complet, 4 univers, avatar picker, dashboard
- `todokids-celebration-v3.jsx` → modales streak (+1 jour réussi), animations par thème
- `todokids-all-celebrations-v4.jsx` → modales victoire challenge et malus, animations par thème

**Lis ces 3 fichiers EN ENTIER avant d'écrire la moindre ligne de code.**
Ce sont les sources de vérité pour tous les composants visuels, animations CSS, et logique d'état.

---

## Ce que tu dois créer

### 1. Fichiers à créer

```
src/
  hooks/
    useChildProfile.js       ← préférences univers + avatar (localStorage)
  components/
    child/
      ChildApp.jsx            ← root avec gestion étapes (universe → avatar → dashboard)
      UniversePicker.jsx      ← écran choix d'univers (4 options)
      AvatarPicker.jsx        ← écran choix avatar (emoji grid + upload photo)
      ChildDashboard.jsx      ← dashboard principal (layout kid + ado)
      AvatarDisplay.jsx       ← composant réutilisable emoji ou photo
      celebrations/
        StreakModal.jsx        ← modale +1 jour streak
        VictoryModal.jsx       ← modale victoire challenge
        MalusModal.jsx         ← modale malus
        RewardCards.jsx        ← RainbowRewardCard, CosmosRewardCard, ChampionRewardCard
        StreakAnimations.jsx   ← RainbowStreak, CosmosStreak, ChampionStreak, AdoStreak
        celebrations.css       ← toutes les @keyframes (extraites du const CSS des fichiers ref)
```

### 2. Hook `useChildProfile.js`

Gère la persistance des préférences enfant dans localStorage, clé par `profileId` :

```js
// Données persistées
{
  universeKey: "rainbow" | "cosmos" | "champion" | "ado",
  avatar: { type: "emoji", value: "🦁" } | { type: "photo", src: "data:..." }
}

// Interface
const { universeKey, avatar, saveUniverse, saveAvatar, isFirstVisit } = useChildProfile(profileId)
```

- `isFirstVisit` → `true` si aucune préférence sauvegardée pour ce `profileId`
- Clé localStorage : `todokids_child_${profileId}`

---

## Données à brancher sur Supabase

Le mockup utilise des données hardcodées à remplacer par des données réelles.

### Props attendues pour `ChildDashboard`

```js
// Données issues de Supabase (passées depuis le parent)
{
  profileId: string,
  childName: string,
  gender: "boy" | "girl",        // pour les modales ado genrées
  missions: [
    {
      id: string,
      title: string,
      icon: string,               // emoji
      done: boolean,              // true si l'enfant a signalé la mission comme faite
      time: string,               // "16:00" heure indicative
      pendingValidation: boolean, // true si en attente validation parent
    }
  ],
  streak: number,                 // jours consécutifs réussis
  challenge: {
    rewardText: string,           // texte de la récompense
    malusText: string,            // texte du malus
    daysCompleted: number,        // jours réussis dans le challenge en cours
    daysTotal: number,            // durée totale du challenge
    status: "active" | "won" | "lost",
  }
}
```

### Actions Supabase

```js
// Quand l'enfant coche une mission
await supabase
  .from('missions')
  .update({ child_done: true })
  .eq('id', missionId)

// NE PAS modifier : la validation finale reste côté parent
```

---

## Logique des modales de célébration

Les 3 modales sont déclenchées dans `ChildDashboard` selon ces conditions :

```js
// 1. STREAK MODAL — quand toutes les missions du jour passent à done
//    (remplace le bloc allDone statique du mockup)
const [showStreakModal, setShowStreakModal] = useState(false)
useEffect(() => {
  if (allDone && !showStreakModal) setShowStreakModal(true)
}, [allDone])

// 2. VICTORY MODAL — quand challenge.status passe à "won"
//    (reçu en prop depuis Supabase realtime ou re-fetch)
const [showVictoryModal, setShowVictoryModal] = useState(
  challenge.status === "won"
)

// 3. MALUS MODAL — quand challenge.status passe à "lost"
const [showMalusModal, setShowMalusModal] = useState(
  challenge.status === "lost"
)
```

### Signatures exactes des modales (ne pas modifier)

```jsx
// Streak (+1 jour) — depuis todokids-celebration-v3.jsx
<KidModal
  universeKey={universeKey}    // "rainbow" | "cosmos" | "champion"
  childName={childName}
  streak={streak}
  onClose={() => setShowStreakModal(false)}
/>
<AdoModal
  childName={childName}
  gender={gender}              // "boy" | "girl"
  streak={streak}
  onClose={() => setShowStreakModal(false)}
/>

// Victoire — depuis todokids-all-celebrations-v4.jsx
<VictoryModal
  theme={universeKey}
  childName={childName}
  gender={gender}
  rewardText={challenge.rewardText}
  onClose={() => setShowVictoryModal(false)}
/>

// Malus — depuis todokids-all-celebrations-v4.jsx
<MalusModal
  theme={universeKey}
  childName={childName}
  gender={gender}
  malusText={challenge.malusText}
  onClose={() => setShowMalusModal(false)}
/>
```

La modale à afficher pour le streak est choisie ainsi :
```js
const isAdo = universeKey === "ado"
// → si isAdo : <AdoModal>  sinon : <KidModal>
```

---

## Règles absolues

### CSS / Animations
- **Extraire toutes les `@keyframes`** du `const CSS` dans `todokids-all-celebrations-v4.jsx` et des `<style>` inline de `todokids-celebration-v3.jsx` vers `celebrations.css`
- Importer `celebrations.css` dans chaque fichier de célébration qui en a besoin
- **Ne pas réécrire les animations** — les copier telles quelles depuis les fichiers de référence
- Les `@keyframes` dans `const CSS` couvrent : `particleFall`, `backdropIn`, `scaleIn`, `fadeUp`, `blackIn`, `logoReveal`, `shakeIn`, `cloudFloat`, `tearDrop`, `hopeLine`, `glitchRed`, `adoSlideUp`, `nameReveal`, `titleGlitch`, `streakPulse`, `giftBounce`, `rayExpand`, `shimmerGold`, `epicPulse`, `chestPulse`, `sparkle`, `revealDown`, `labelSlide`, `capsuleLand`, `thrusterFire`, `scanLine`, `holoBorder`, `medalDrop`, `medalShine`, `stampIn`, `podiumPulse`
- Les `@keyframes` dans `todokids-celebration-v3.jsx` couvrent : `modalBounce`, `emojiBounce`, `emojiFloat`, `emojiPulse`, `starBurst`, `starLight`, `lineDrawIn`, `countLand`, `barShimmer`, `championFlash`, `championBadge`, `streakWow`, `streakGlow`

### Structure des composants
- **Copier exactement** `UNIVERSES` config depuis le mockup (4 clés : rainbow, cosmos, champion, ado)
- **Copier exactement** `ADO_MALUS` config depuis all-celebrations-v4 (boy/girl avec emoji, headline, sub, rebond, colors)
- **Copier exactement** `KID_MALUS` config depuis all-celebrations-v4
- **Copier exactement** `KID_CONFIG` depuis celebration-v3 (rainbow/cosmos/champion avec particles, bg, title, emoji, etc.)
- **Copier exactement** `AVATARS` array depuis le mockup (20 emojis)

### Avatar photo
- Utiliser `FileReader` + `readAsDataURL` exactement comme dans `AvatarPicker` du mockup
- Format : `{ type: "photo", src: "data:image/..." }`
- `AvatarDisplay` gère les deux cas : `avatar.type === "photo"` → `<img>`, sinon → `<div>{avatar.value}</div>`

### Fonts
- Univers kid (rainbow/cosmos/champion) : `fontFamily: "'Nunito', sans-serif"`
- Univers ado : `fontFamily: "'Space Grotesk', sans-serif"`
- Google Fonts via `<link>` dans chaque composant qui en a besoin

### Ne jamais modifier
- La logique Supabase existante dans le reste de l'app
- Les composants parent (ParentDashboard, ValidationTab, etc.)
- Le routing existant

---

## Point d'entrée dans l'app

Trouver où est rendu le dashboard enfant actuellement (probablement dans `App.jsx` ou un router).
Remplacer ce rendu par :

```jsx
import ChildApp from './components/child/ChildApp'

// Dans la route enfant :
<ChildApp
  profileId={currentProfile.id}
  childName={currentProfile.name}
  gender={currentProfile.gender}     // à récupérer depuis le profil Supabase
  missions={missions}
  streak={streak}
  challenge={challenge}
  onMissionToggle={handleMissionToggle}
/>
```

Si `gender` n'est pas encore dans le schéma Supabase, ajouter la colonne `gender text default 'boy'` sur la table `profiles` ou `children`.

---

## Ordre d'exécution recommandé

1. Lire les 3 fichiers de référence en entier
2. Créer `celebrations.css` avec toutes les keyframes extraites
3. Créer `StreakAnimations.jsx` (RainbowStreak, CosmosStreak, ChampionStreak, AdoStreak)
4. Créer `RewardCards.jsx` (RainbowRewardCard, CosmosRewardCard, ChampionRewardCard)
5. Créer `StreakModal.jsx`, `VictoryModal.jsx`, `MalusModal.jsx`
6. Créer `useChildProfile.js`
7. Créer `AvatarDisplay.jsx`, `AvatarPicker.jsx`, `UniversePicker.jsx`
8. Créer `ChildDashboard.jsx` avec branchement données réelles + déclenchement modales
9. Créer `ChildApp.jsx` (root avec étapes)
10. Brancher dans le router existant
11. Tester les 4 univers × 3 modales × 2 genres ado

## Commit final
```
git add src/components/child/ src/hooks/useChildProfile.js
git commit -m "feat: child dashboard — 4 univers, avatar, 3 modales célébration"
git push
```
