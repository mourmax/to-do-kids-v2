# Child Dashboard Transformation & PWA Notifications

Transfers the child interface from the current "Glassmorphism/Dark" theme to a "Ludic Light" theme to clearly distinguish it from the parent mode. Also initiates the technical foundation for task reminders via PWA notifications.

## Proposed Changes

### Database Migration

Change `scheduled_time` to `scheduled_times` (array) in the `missions` table to support multiple reminders.

#### [MODIFY] [Supabase](https://supabase.com)
- SQL: `ALTER TABLE missions RENAME COLUMN scheduled_time TO scheduled_time_old;`
- SQL: `ALTER TABLE missions ADD COLUMN scheduled_times TEXT[] DEFAULT '{}';`
- SQL: `UPDATE missions SET scheduled_times = ARRAY[scheduled_time_old::text] WHERE scheduled_time_old IS NOT NULL;`

### Mission UI Enhancements

Support multiple reminders and make clock icons more prominent.

#### [MODIFY] [ChallengeRenewalView.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/parent/tabs/ChallengeRenewalView.jsx)
- Update state to handle `scheduled_times` as an array.
- Implement UI for adding/removing multiple times.
- Increase size of clock icons and time displays.

#### [MODIFY] [MissionsSection.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/parent/settings/MissionsSection.jsx)
- Similar updates as above for mission management and editing.

### [UI] Child Dashboard Theme

#### [MODIFY] [ChildDashboard.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/child/ChildDashboard.jsx)
- Implement a conditional theme toggle or force `light-theme` class specifically for the child view.
- Update `getColorClasses` to return more vibrant, solid colors for the light theme.
- Add playful background elements (subtle patterns or softer gradients).

#### [MODIFY] [MissionCard.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/child/MissionCard.jsx)
- Redesign for a more "card-like" feel with soft shadows and white backgrounds.
- Enhance the "Completed" animation to be more celebratory.

### [Logic] PWA Notifications

#### [NEW] [NotificationService.js](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/services/notificationService.js)
- utility for requesting notification permissions.
- logic for registering service workers for push notifications.

#### [MODIFY] [supabaseClient.js](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/supabaseClient.js)
- Ensure we can store `push_subscription` tokens in the `profiles` table.

## Verification Plan

### Automated Tests
- Run browser tests to verify theme switching between Parent (Dark) and Child (Light/Ludic).
- Verify Supabase schema updates for push tokens.

### Manual Verification
- Test PWA "Add to Home Screen" behavior on mobile to verify Web Push permission prompts.
- Visually confirm the ludic design appeals to children.
