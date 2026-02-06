# gemini.md - Project Constitution

## 📜 System Identity
- **Name**: TodoKids v2
- **Pilot**: Antigravity (as System Pilot)
- **Architecture**: A.N.T. 3-Layer (Architecture, Navigation, Tools)
- **Protocol**: B.L.A.S.T. v1.1 (Optimized)
- **Data Version**: v2.0.0

---

## 🏗️ Data Schema (Source of Truth: Supabase)

### Profiles Table
```json
{
  "id": "uuid",
  "family_id": "uuid",
  "child_name": "string",
  "color": "rose | sky | emerald | amber | violet",
  "is_parent": "boolean",
  "pin": "string (hashed)",
  "invite_code": "string"
}
```

### Challenges Table
```json
{
  "id": "uuid",
  "family_id": "uuid",
  "reward_name": "string",
  "malus_message": "string",
  "duration_days": "integer",
  "current_streak": "integer",
  "is_active": "boolean"
}
```

---

## 🛠️ Behavioral Rules & Invariants
1. **Parent/Child Separation**: No access to Parent mode from a child device without PIN.
2. **Real-time Sync**: Use Supabase real-time channels for `daily_logs` and `challenges`.
3. **Gratuit Limit**: Challenges limited to 3 days in free version (enforced in UI).
4. **Deterministic Logic**: Favor deterministic states over probabilistic AI guesses for mission status.
5. **Context Lifecycle**: Purge execution logs and summarize `progress.md` every 5 major tasks to avoid context fatigue.
6. **Agile Guardrail**: Skip heavy planning documentation for minor UI/CSS fixes to avoid Planning Paralysis.
7. **Data Versioning**: Any breaking change to schemas in this file must increment the minor version and maintain a migration SOP in `architecture/`.

---

## 🛰️ Fallback Procedures
1. **API Handshake Fail**: If a service (Phase 2) is unreachable after 3 attempts, build a mock adapter in a temporary tool to allow Logic (Phase 3) development to proceed.
2. **Environment Block**: If browser tools fail, prioritize `read_url_content` or manual user input for external research.

---

## 📝 Maintenance Log
- **2026-02-06**: Initialized B.L.A.S.T. Protocol.
- **2026-02-06**: Integrated Vigilance Points v1.1 (Context, Paralysis, Versioning, Fallbacks).
- **2026-02-06**: Fixed settings input reset bug and mission renewal UI.
