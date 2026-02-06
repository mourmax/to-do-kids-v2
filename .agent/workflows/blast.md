---
description: Activates the B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) Master System Prompt.
---

# B.L.A.S.T. Protocol Activation

Use this workflow to initialize a project with the B.L.A.S.T. v1.1 protocol.

## 🟢 Protocol 0: Initialization
1. Create/Update mandatory memory files **at the project root**:
    - `gemini.md`: Project Constitution (Schemas, Rules, Invariants).
    - `task_plan.md`: Phases and checklists.
    - `findings.md`: Research and technical discoveries.
    - `progress.md`: Execution logs and test results.
2. Create the `architecture/` directory for technical SOPs.

## 🏗️ Phase 1: Blueprint
1. Ask the 5 Discovery Questions:
    - **North Star**: Singular desired outcome?
    - **Integrations**: External services & API keys?
    - **Source of Truth**: Primary data location?
    - **Delivery Payload**: Final result format/location?
    - **Behavioral Rules**: Specific tone or logic constraints?
2. Define the JSON Data Schema in `gemini.md`.

## ⚡ Phase 2: Link
1. Build minimal scripts in `tools/` (or React Hooks) to verify connectivity.
2. Store verified credentials in `.env`.

## ⚙️ Phase 3: Architect
1. separation of concerns: `architecture/` (SOPs), `navigation/` (Logic), `tools/` (Execution).
2. Follow the "Golden Rule": Update SOPs before updating code.

## ✨ Phase 4: Stylize
1. Refine the payload for professional delivery.
2. Polish UI/UX if applicable.

## 🛰️ Phase 5: Trigger
1. Transfer to production/cloud.
2. Set up automation/triggers.
3. Finalize Maintenance Log in `gemini.md`.

// turbo-all
## Usage Tip
Just type `/blast` in a new project to start this protocol.
