'use client';

import React from 'react';
import { ExternalLink, Cpu, Server, Cloud, Bot, GitBranch, Activity } from 'lucide-react';
import { TechStackGrid } from './TechStackGrid';
import { SectionBlock } from './SectionBlock';
import { ArchitectureOverview } from '@/remotion/compositions/ArchitectureOverview';
import { HermesLifecycle } from '@/remotion/compositions/HermesLifecycle';
import { CICDPipeline } from '@/remotion/compositions/CICDPipeline';
import { DataPipelines } from '@/remotion/compositions/DataPipelines';
import { SentryAutoFix } from '@/remotion/compositions/SentryAutoFix';

const NAV_ITEMS = [
  { id: 'stack-grid', label: 'All Tools', icon: Cpu, color: '#60A5FA' },
  { id: 'architecture', label: 'Architecture', icon: Cloud, color: '#F59E0B' },
  { id: 'ai-workflows', label: 'AI & Automation', icon: Bot, color: '#A78BFA' },
  { id: 'cicd', label: 'CI/CD', icon: GitBranch, color: '#F472B6' },
  { id: 'data-pipelines', label: 'Data Flows', icon: Server, color: '#60A5FA' },
  { id: 'observability', label: 'Observability', icon: Activity, color: '#FB923C' },
];

const FPS = 30;

export const StackPageClient: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-2 h-2 rounded-full animate-pulse-glow"
              style={{ background: '#22C55E' }}
            />
            <span
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: '#22C55E' }}
            >
              Developer Intelligence Platform
            </span>
          </div>

          <h1
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6"
            style={{
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            How This Was Built
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
            style={{ color: '#94A3B8' }}
          >
            Every technology, workflow, and automation powering{' '}
            <a
              href="https://thangvq95.page"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-accent transition-colors duration-150"
              style={{ color: '#22C55E' }}
            >
              thangvq95.page
            </a>
            . Built with an AI-first, fully autonomous development pipeline.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mb-12">
            {[
              { value: '5', label: 'Docker containers' },
              { value: '2×', label: 'Daily trending syncs' },
              { value: '100%', label: 'Autonomous CI/CD' },
              { value: '0', label: 'Manual deployments' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="font-heading font-bold text-3xl"
                  style={{ color: '#22C55E', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: '#64748B' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick links to sections */}
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    background: `${item.color}10`,
                    color: item.color,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <Icon size={13} />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">

        {/* § 0 — Full Stack Grid */}
        <section id="stack-grid" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full" style={{ background: '#60A5FA', boxShadow: '0 0 12px #60A5FA80' }} />
            <div>
              <h2
                className="font-heading font-bold text-2xl text-text-primary"
                style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              >
                Complete Tech Stack
              </h2>
              <p className="text-text-secondary text-sm mt-0.5">
                Click any card to see why it was chosen
              </p>
            </div>
          </div>
          <TechStackGrid />
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* § 1 — Architecture */}
        <SectionBlock
          id="architecture"
          title="System Architecture"
          subtitle="User → Cloudflare → Vercel → NestJS → PostgreSQL ← Hermes Agent"
          accentColor="#F59E0B"
          videoLabel="Architecture Overview · 10s loop"
          videoDurationInFrames={10 * FPS}
          videoComponent={ArchitectureOverview}
        >
          <div className="space-y-3 h-full">
            {[
              { label: 'Traffic Flow', detail: 'User → Cloudflare WAF → Vercel (SSR/SSG) → NestJS API → PostgreSQL', color: '#F59E0B' },
              { label: 'AI Layer', detail: 'Hermes Agent on VPS ↔ GitHub (sync) + 9Router (LLM) + GitNexus (context)', color: '#A78BFA' },
              { label: 'Containerized', detail: '5 Docker services: postgres · api · ai-workspace · hermes-gateway · cloudflared', color: '#60A5FA' },
              { label: 'No Open Ports', detail: 'All VPS traffic routed via Cloudflare Tunnel — zero exposed ports', color: '#F59E0B' },
              { label: 'Persistent Brains', detail: 'Docker Named Volumes: hermes_data + gitnexus_data — survives container updates', color: '#A78BFA' },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-lg p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="font-heading font-semibold text-sm mb-1"
                  style={{ color: item.color, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {item.label}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* § 2 — AI & Autonomous Workflows */}
        <SectionBlock
          id="ai-workflows"
          title="AI & Autonomous Workflows"
          subtitle="Hermes Agent + GitNexus + 9Router — fully autonomous development loop"
          accentColor="#A78BFA"
          videoLabel="Hermes Agent Lifecycle · 10s loop"
          videoDurationInFrames={10 * FPS}
          videoComponent={HermesLifecycle}
          reverse
        >
          <div className="space-y-3">
            {[
              {
                label: '⏰ Trending Sync',
                detail: '0 8,20 * * * — Scrape github.com/trending → POST /api/repos/upsert',
                color: '#60A5FA',
              },
              {
                label: '⏰ Release Monitor',
                detail: '0 10 * * * — Check favorites → GitHub Releases API → has_new_release=true',
                color: '#34D399',
              },
              {
                label: '🔧 Webhook-Triggered Fix',
                detail: 'GitHub event → HMAC verify → SQLite dedup → git worktree → hermes skill → push PR',
                color: '#A78BFA',
              },
              {
                label: '🧠 GitNexus Context',
                detail: '548 symbols · 678 relationships. Agents never grep — they query the knowledge graph.',
                color: '#A78BFA',
              },
              {
                label: '🌐 9Router LLM Gateway',
                detail: 'All LLM calls go to 9router.phieucaphe.com/v1. No local models on VPS.',
                color: '#F59E0B',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-lg p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="font-heading font-semibold text-sm mb-1"
                  style={{ color: item.color, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {item.label}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed font-mono text-xs">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* § 3 — CI/CD */}
        <SectionBlock
          id="cicd"
          title="CI/CD & Release Pipeline"
          subtitle="Husky → Conventional Commits → GitHub Actions → VPS → Vercel → release-please"
          accentColor="#F472B6"
          videoLabel="CI/CD Pipeline · 9s loop"
          videoDurationInFrames={9 * FPS}
          videoComponent={CICDPipeline}
        >
          <div className="space-y-3">
            {[
              {
                label: 'Pre-commit Hooks (Husky)',
                detail: 'lint-staged runs ESLint + Prettier. commitlint enforces Conventional Commits format.',
                color: '#F472B6',
              },
              {
                label: 'GitHub Actions — Deploy',
                detail: 'SSH → VPS → docker compose pull → health check /api/repos → trigger Vercel Deploy Hook.',
                color: '#60A5FA',
              },
              {
                label: 'Backend-First Strategy',
                detail: 'Frontend deploys only AFTER backend health check passes. Eliminates version mismatches.',
                color: '#22C55E',
              },
              {
                label: 'release-please Bot',
                detail: 'Analyzes commits on main → bumps semver → auto-generates CHANGELOG.md → creates GitHub Release tag.',
                color: '#A78BFA',
              },
              {
                label: 'Playwright E2E',
                detail: 'Tests run in CI against the live dev server. No green tests = no merge.',
                color: '#22C55E',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-lg p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="font-heading font-semibold text-sm mb-1"
                  style={{ color: item.color, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {item.label}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* § 4 — Data Pipelines */}
        <SectionBlock
          id="data-pipelines"
          title="Data Pipelines"
          subtitle="Two Hermes cronjobs keep TechTrend fresh automatically"
          accentColor="#60A5FA"
          videoLabel="Data Pipelines · 9s loop"
          videoDurationInFrames={9 * FPS}
          videoComponent={DataPipelines}
          reverse
        >
          <div className="space-y-3">
            {[
              {
                label: '① Trending Sync  ·  0 8,20 * * *',
                detail: 'Scrape first page of github.com/trending?since=weekly (~25 repos). Dedup by full_name. Insert new with is_read=false.',
                color: '#60A5FA',
              },
              {
                label: '② Release Monitor  ·  0 10 * * *',
                detail: 'For each is_favorite=true repo: GET /releases/latest → compare tag_name → if changed: has_new_release=true.',
                color: '#34D399',
              },
              {
                label: 'Field-Level Update Strategy',
                detail: 'Dynamic fields (stars, forks, description) always updated. User fields (is_favorite, ai_summary) never overwritten.',
                color: '#F59E0B',
              },
              {
                label: '✨ Magic Analyze (on-demand)',
                detail: 'User clicks button → POST /api/repos/{name}/analyze → Hermes reads README → Markdown summary → cached forever.',
                color: '#A78BFA',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-lg p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="font-heading font-semibold text-sm mb-1 font-mono"
                  style={{ color: item.color, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {item.label}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* § 5 — Observability */}
        <SectionBlock
          id="observability"
          title="Observability & Self-Healing"
          subtitle="Sentry error → GitHub Issue → Hermes fixes → PR merged · no human needed"
          accentColor="#FB923C"
          videoLabel="Sentry Auto-Fix Pipeline · 9s loop"
          videoDurationInFrames={9 * FPS}
          videoComponent={SentryAutoFix}
        >
          <div className="space-y-3">
            {[
              {
                label: '🔴 Sentry Error Capture',
                detail: 'NestJS Global Exception Filter sends all unhandled errors to Sentry with full stack trace + context.',
                color: '#EF4444',
              },
              {
                label: '🔗 Webhook → GitHub Issue',
                detail: 'POST /webhooks/sentry → validate HMAC → create GitHub Issue with Sentry error details automatically.',
                color: '#FB923C',
              },
              {
                label: '🤖 Hermes Picks Up',
                detail: 'Listens for GitHub issue_opened events → runs diagnose + tdd skills → writes fix → pushes branch.',
                color: '#A78BFA',
              },
              {
                label: '✅ Auto PR + Close',
                detail: 'gh pr create --fill → CI passes → PR merged → issue auto-closed. Full loop with zero human input.',
                color: '#22C55E',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-lg p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="font-heading font-semibold text-sm mb-1"
                  style={{ color: item.color, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
                >
                  {item.label}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* Footer CTA */}
        <div
          className="glass rounded-2xl p-8 text-center"
          style={{ borderColor: '#22C55E30' }}
        >
          <div
            className="font-heading font-bold text-2xl mb-3 text-text-primary"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
          >
            Open Source & Transparent
          </div>
          <p className="text-text-secondary mb-6 max-w-lg mx-auto">
            All architecture decisions, agent rules, and skill definitions are version-controlled in the repository.
          </p>
          <a
            href="https://github.com/thangvq95/thangvq-digital-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: '#22C55E', color: '#000' }}
          >
            <ExternalLink size={14} />
            View Source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};
