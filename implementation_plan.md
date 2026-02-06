# Child Dashboard Transformation & PWA Notifications

Transfers the child interface from the current "Glassmorphism/Dark" theme to a "Ludic Light" theme to clearly distinguish it from the parent mode. Also initiates the technical foundation for task reminders via PWA notifications.

## Proposed Changes

### Mission Editing Refinements

Fix the issue where translation keys are displayed instead of translated titles when editing a mission.

#### [MODIFY] [ChallengeRenewalView.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/parent/tabs/ChallengeRenewalView.jsx)
- Wrap `mission.title` in `t()` inside the `startEditing` function.
- Update the time input to use a custom-styled picker.

#### [MODIFY] [MissionsSection.jsx](file:///c:/Users/matis/TodoKids_Antigravity/to-do-kids-v2/src/components/parent/settings/MissionsSection.jsx)
- Wrap `mission.title` in `t()` inside the `onEditStart` callback.
- Update the time input to use a custom-styled picker.

### UI Enhancements

Research and implement a custom, premium time selector for mission reminders to replace the clunky browser default.

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
