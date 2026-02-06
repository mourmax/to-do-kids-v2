### Pending Questions / Research
- [NEW] PWA Notification Feasibility: Can we implement local or push notifications for task reminders on mobile (especially iOS)?
- [NEW] Child UI Design: Transitioning from dark/glassmorphism to a ludic/light theme.

## 🔍 Technical Discoveries
- **Real-time Reset Bug**: Background refreshes (polling/real-time) were overwriting local React state in inputs. Fixed by tying `useEffect` to `challenge.id` instead of the whole object.
- **Parent Mode Security**: Redirection must be handled carefully to prevent kids from bypassing PIN via direct URL/Cache manipulation (Client-side focus).
- **Notion Integration**: Browser tool initialization error prevents direct Notion reading; fallback to manual copy-paste from user required.

---

## 🚧 Constraints
- **Supabase Quotas**: Monitor tier limits if family count scales.
- **Vite/React Environment**: No Python `tools/` directory currently; interpreting "Tools" as React Hooks/Supabase Actions.
