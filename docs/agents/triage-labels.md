# Triage Labels

This repo uses labels not just for organization, but for **AI Smart Dispatch Routing**.

The Hermes autonomous orchestrator polls GitHub. When an issue is created or labeled, the orchestrator parses the labels to automatically spawn Hermes with the appropriate skill in an isolated worktree.

## Routing Logic (Polling Orchestrator)

When an `issues` event is received, Hermes is dispatched based on the following labels:

- `bug` or `sentry` → Triggers the `diagnose` skill. (Agent will reproduce, minimize, and fix the bug in issue).
- `feature` or `enhancement` → Triggers the `to-prd` skill. (Agent will generate PRDs and implement the feature).
- `plan` → Triggers the `writing-plans` skill. (Agent will break down an epic or complex task into a plan).

_If an issue lacks these specific routing labels, the orchestrator defaults to the `triage` skill to analyze and organize it._

## PR & CI Routing

The orchestrator polls GitHub for open pull requests and checks their CI status:

- **Open PRs with failing CI checks** (excluding PRs authored by Hermes/bots or automated release-please PRs) → Triggers the `pr-review-ci-fix` skill to automatically analyze, review, and patch failing CI runs.

## Human vs Agent States

- `needs-triage` — Maintainer needs to evaluate.
- `needs-info` — Waiting on reporter/context.
- `ready-for-agent` — Fully specified, AFK-ready. Hermes can pick it up with no human context.
- `ready-for-human` — Needs human implementation or review.
- `wontfix` — Will not be actioned.
