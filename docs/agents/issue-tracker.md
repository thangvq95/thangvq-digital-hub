# Issue Tracker

This repo tracks issues using **GitHub Issues** and **GitHub Projects**. 

GitHub is not just for human developers; it serves as the **Runtime State and Task DAG Orchestrator** for the autonomous AI architecture.

## The Issue Pipeline

Issues can be created from multiple sources:
1. **Automated Sentry Errors**: Sentry alerts hit the NestJS backend (`/webhooks/sentry`), which automatically creates a GitHub Issue.
2. **Human Definition**: Using Spec Kit or manually creating an issue on GitHub.
3. **Automated Testing**: Playwright tests failing could theoretically generate issues.

Regardless of the source, once an issue is created on GitHub, it triggers the Hermes Agent webhook (`infra/ai-developer-workspace/listener.py`).

## Reading

- **Local Agents**: Use the remote Hermes MCP server to read task states and update the GitHub Projects board.
- **Human**: Use the `gh` CLI (`gh issue view <number>`) or the GitHub Web UI.
- Treat the issue body as the absolute source of truth for requirements.

## Writing

- When creating issues, include a clear title prefix, context/links, and a checklist.
- **Crucial**: Always apply the correct **Triage Labels** (e.g., `bug`, `feature`, `plan`). The Hermes `listener.py` relies strictly on these labels to determine which skill to execute.

See `docs/agents/triage-labels.md` for routing details.
