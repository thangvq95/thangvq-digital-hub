# Domain Docs

This repo uses a **single-context** layout where `CONTEXT.md` is the primary source of truth for all domain concepts, terminology, and architecture rules.

## Core Architecture: 5-Layer System

The project is structured around a "Stateless AI & Stateful Repo" philosophy:

1. **Brainstorm / RFC**: Design discussions (`docs/superpowers/specs/*`).
2. **Implementation Plan**: Task breakdown and execution order.
3. **Observability**: Real-time error tracking (Sentry + NestJS Webhook).
4. **Runtime State**: Task DAG and execution status tracking (GitHub Projects/Issues).
5. **Documentation**: Human-facing architecture and source of truth (`docs/PRD.md`, `CONTEXT.md`).

## Agent Roles

- **Hermes (Remote Agent)**: Runs on the VPS. Autonomous worker executing cronjobs, handling issue dispatches via polling scheduler, and running `gitnexus`.
- **Local Agents**: Cursor, Claude Code, Antigravity. They operate statelessly locally and sync 100% via GitHub. They connect to the remote Hermes MCP to interact with the project state.

## Rules

- Read `CONTEXT.md` before making architectural decisions or naming things.
- When making a significant architectural change, create a new ADR under `docs/adr/`.
- Never bypass GitHub Projects/Issues when tracking state. All agents must read and update issues to maintain a unified truth.
