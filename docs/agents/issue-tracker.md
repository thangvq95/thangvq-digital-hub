# Issue Tracker

This repo tracks issues using GitHub Issues.

## Reading

- Use the `gh` CLI to read issues: `gh issue view <number>` or `gh issue list`.
- Treat the issue body as the source of truth for requirements.
- Pay attention to the state of the issue (open/closed) and its assignees.

## Writing

- Use `gh issue create` to open new issues.
- When creating issues, include:
  1. A clear title prefix indicating type (e.g., `feat:`, `fix:`).
  2. A "Context" section linking back to the epic or previous issue.
  3. A "Requirements" or "Acceptance Criteria" checklist.
- Use `gh issue comment` to log progress or ask questions of maintainers.
