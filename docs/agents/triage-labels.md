# Triage Labels

This repo uses the default vocabulary for issue triage:

- `needs-triage` — maintainer needs to evaluate. Apply to new untriaged issues.
- `needs-info` — waiting on reporter. Apply when asking for clarification.
- `ready-for-agent` — fully specified, AFK-ready. An agent can pick it up with no human context.
- `ready-for-human` — needs human implementation.
- `wontfix` — will not be actioned.

## AI Smart Dispatch Routing

The `infra/ai-developer-workspace/listener.py` webhook automatically dispatches the Hermes Agent based on GitHub Issue labels. When creating an issue (e.g., via Spec Kit), apply the appropriate label to trigger the correct skill:

- `bug` or `sentry` → Triggers the `diagnose` skill. (Agent will reproduce, minimize, and fix the bug).
- `feature` or `enhancement` → Triggers the `to-prd` skill. (Agent will implement the feature based on requirements).
- `plan` → Triggers the `writing-plans` skill. (Agent will break down an epic or complex task into a plan).

*If an issue lacks these specific routing labels, the listener defaults to the `triage` skill.*
