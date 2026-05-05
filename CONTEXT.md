# Domain Context: ThangVQ Digital Hub

## Core Purpose
Portfolio and TechTrend Dashboard.

## Key Terminology
- **OpenClaw**: External crawler running on Mac Mini. Scrapes GitHub, classifies via LLM.
- **TechTrend**: Dashboard showing AI-curated GitHub repos.
- **NestJS API**: Backend service running on VPS via Docker.
- **PostgreSQL**: Primary database running locally on VPS.

## Architecture Rules
- Next.js 14+ App Router.
- Tailwind v4 + ShadcnUI.
- NestJS + PostgreSQL (Self-hosted on Docker/VPS).
- Vercel for hosting frontend.
