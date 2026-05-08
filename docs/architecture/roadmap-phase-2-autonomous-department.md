# Roadmap Phase 2: Autonomous AI Department (99% Automation)

This document outlines the architecture and operational mechanics for a fully autonomous Multi-Agent system. It is scheduled for implementation in Phase 2, after the core functionality of Phase 1 is stable.

## 1. System Vision

Transitioning from an "AI-assisted programming" model to a fully autonomous "AI Department". The human user elevates their role to Chief Architect and Product Manager—approving high-level plans and designs—while the agent system self-coordinates to execute, test, and deploy.

## 2. Multi-Agent Roster ("The AI Department")

To achieve reliable automation, the system is split into three core roles that provide cross-supervision:

| Role | Primary Responsibility | Core Skills |
|---|---|---|
| **Agent PM (Researcher)** | Scans trends via GitNexus, analyzes repos, updates PRD, and generates the Task DAG queue. | `brainstorming`, `to-prd`, `to-issues` |
| **Agent Executor (Hermes)** | Executes task IDs strictly following DAG dependencies. Writes code based on context. | `tdd`, `vercel-react-best-practices`, `ui-ux-pro-max` |
| **Agent QA (Reviewer)** | Tests code via Playwright, reviews security, and guides fixes if tests fail. | `diagnose`, `pr-review-ci-fix` |

## 3. Autonomous Workflow

1. **Trigger:** Cronjob or webhook signal from GitNexus detecting a new requirement.
2. **Planning:** Agent PM updates `PRD.md` and outputs a list of Task IDs into the queue.
3. **Execution (Sequential):** Hermes processes the task queue. Hermes strictly uses Test-Driven Development (TDD).
4. **Validation:** Agent QA runs E2E testing (Playwright).
   - **If PASS:** Mark task as DONE, proceed to the next node in the DAG.
   - **If FAIL:** Trigger the `diagnose` loop, forcing Hermes to fix the code until tests pass.
5. **Deployment:** Once the entire DAG completes, code is automatically pushed for Vercel/Docker deployment.

## 4. Mandatory Guardrails

- **Single Context (CONTEXT.md):** Every Agent must read this file before acting to ensure domain and architectural consistency.
- **Strict State Machine:** Tight control over task states (`READY` → `RUNNING` → `DONE/FAILED`).
- **Max Retries:** Capped at 3 automatic fix attempts. If failure persists, the Agent halts and escalates to the human architect.
- **Human-in-the-Loop:** Human approval is strictly required at the PRD/Design phase before the Executor is allowed to write code.

## 5. Core Technologies

- **GitNexus:** Provides the codebase Knowledge Graph.
- **9Router / Hermes:** Local and Cloud LLM execution infrastructure.
- **Playwright:** The sole source of truth for code quality and functional validation.

## 6. Orchestration Hub (Control Plane)

To achieve maximum automation without losing control, **Hermes Kanban** (`kanban.thangvq95.page`) serves as the exclusive Control Plane.
- **Single Source of Truth:** Superpower planning skills (like `writing-plans`) automatically generate tasks and populate them into the Hermes Kanban board. The board accurately reflects real-time agent execution state.
- **Auto-Sync:** Hermes picks up Task IDs directly from the Kanban board. When Hermes starts processing a Task ID, the corresponding card moves to `In Progress`. 
- **Webhook Control:** When tasks are merged into the main branch, a Git webhook fires back to `kanban.thangvq95.page` to update the Kanban status to `Done`, completing the execution loop.

### Local Agent MCP Integration

To prevent local agents (Cursor, Antigravity) from creating blind spots in the autonomous loop, they act as "Worker Nodes" connected to the Kanban board via the **Hermes MCP Server**:

1. **Assign:** Local developer/agent picks a task from the Kanban board.
2. **Sync:** The local agent calls the Hermes MCP tool (e.g., `update_task_status`) to move the Kanban card to `IN PROGRESS`.
3. **Context:** The local agent executes the work locally, using `gitnexus analyze` for context retrieval.
4. **Commit:** Work is pushed to the GitHub repository.
5. **Complete:** The Git webhook automatically fires, instructing the Kanban board to move the card to `DONE`.

---

## Appendix: Skills Reserved for Phase 2

*Why withhold these from Phase 1?* "Context Window is an expensive resource." Loading too many skills increases prompt overhead, reduces sharpness, and risks hallucinations.

### The "100% Auto" Arsenal
Do **not** install these during Phase 1. If installed prematurely, they will attempt to "go rogue" and self-orchestrate, bypassing the strict, controlled loops established for Phase 1.

- `executing-plans`
- `dispatching-parallel-agents`
- `subagent-driven-development`

**Rationale:** These skills will eventually replace manual/scripted DAG runners. When server infrastructure allows, the Agent PM can call `dispatching-parallel-agents` to spawn sub-agents (e.g., one for UI, one for API). They will complete their work, merge it, and invoke `subagent-driven-development` for cross-review (spec compliance & quality) with zero human intervention.

### Advanced Git & Review Workflow
- `using-git-worktrees`: **MANDATORY** for multi-agent workflows. To prevent code conflicts between Hermes (running on VPS) and manual development (running on Mac Mini), Hermes must isolate its AI branch environments using git worktrees.
- `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`: Designed for Open Source or multi-human teams. In Phase 1, the only required loop is: Code → Playwright → Pass → Commit. Forcing "pre-review checklists" slows down build velocity unnecessarily.

**Phase 1 Optimal Configuration (Reminder):**
- **Planning:** `brainstorming` + `writing-plans` (Superpowers)
- **Contract:** `to-prd` (Matt Pocock)
- **Execution:** `tdd` + `diagnose` (Matt Pocock)
