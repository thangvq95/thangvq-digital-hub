import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/constants';
import { FadeIn } from '../components/FadeIn';
import { GlassCard } from '../components/GlassCard';
import { AnimatedArrow } from '../components/AnimatedArrow';
import { PulseEffect } from '../components/PulseEffect';

// Node positions (1280x720 canvas)
const NODES = {
  user:        { x: 80,  y: 300, width: 100, height: 60 },
  cloudflare:  { x: 250, y: 300, width: 130, height: 60 },
  vercel:      { x: 450, y: 190, width: 130, height: 60 },
  nestjs:      { x: 450, y: 410, width: 130, height: 60 },
  postgres:    { x: 670, y: 410, width: 130, height: 60 },
  hermes:      { x: 670, y: 190, width: 130, height: 60 },
  gitnexus:    { x: 900, y: 190, width: 130, height: 60 },
  ninerouter:  { x: 900, y: 410, width: 130, height: 60 },
  github:      { x: 1070,y: 300, width: 130, height: 60 },
};

const cx = (n: { x: number; width: number }) => n.x + n.width / 2;
const cy = (n: { y: number; height: number }) => n.y + n.height / 2;

const NodeLabel: React.FC<{
  text: string;
  sub?: string;
  color?: string;
}> = ({ text, sub, color = COLORS.accent }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <span style={{ fontFamily: FONTS.heading, fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
      {text}
    </span>
    {sub && (
      <span style={{ fontFamily: FONTS.body, fontSize: 10, color }}>
        {sub}
      </span>
    )}
  </div>
);

export const ArchitectureOverview: React.FC = () => {
  const { fps } = useVideoConfig();

  // Timing (in frames at 30fps)
  const T = {
    title: 0,
    userAppear: 2 * fps,       // 2s
    cfAppear: 3 * fps,         // 3s
    arrow1: 3 * fps + 10,      // user→CF
    vercelAppear: 4 * fps,
    nestAppear: 4 * fps + 10,
    arrow2: 4 * fps + 10,      // CF→Vercel
    arrow3: 4 * fps + 20,      // CF→NestJS
    dbAppear: 5 * fps,
    hermesAppear: 5 * fps + 10,
    arrow4: 5 * fps,           // Nest→DB
    arrow5: 5 * fps + 10,      // Hermes→DB
    gnAppear: 6 * fps,
    nrAppear: 6 * fps + 10,
    ghAppear: 6 * fps + 20,
    arrow6: 6 * fps,           // Hermes→GitNexus
    arrow7: 6 * fps + 10,      // Hermes→9Router
    arrow8: 6 * fps + 20,      // Hermes→GitHub
    pulseStart: 7 * fps,       // 7s — full diagram, pulses start
    badge: 8 * fps,            // 8s — badge
  };

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONTS.body }}>
      {/* Background grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.accent} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Title */}
      <Sequence from={T.title} durationInFrames={2 * fps} layout="none">
        <FadeIn from={0} durationFrames={20}>
          <div style={{
            position: 'absolute', top: 60, left: 0, right: 0,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONTS.heading, fontSize: 32, fontWeight: 700, color: COLORS.textPrimary }}>
              ThangVQ Digital Hub
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary, marginTop: 6 }}>
              Architecture Overview
            </div>
          </div>
        </FadeIn>
      </Sequence>

      {/* Section labels */}
      <Sequence from={T.vercelAppear} layout="none">
        <FadeIn from={T.vercelAppear} durationFrames={20}>
          <div style={{ position: 'absolute', top: 148, left: 390, fontFamily: FONTS.body, fontSize: 11, color: COLORS.blue, opacity: 0.7 }}>
            FRONTEND (VERCEL)
          </div>
          <div style={{ position: 'absolute', top: 368, left: 390, fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, opacity: 0.7 }}>
            BACKEND (VPS / DOCKER)
          </div>
        </FadeIn>
      </Sequence>

      {/* Arrows */}
      <AnimatedArrow from={{ x: cx(NODES.user), y: cy(NODES.user) }} to={{ x: NODES.cloudflare.x, y: cy(NODES.cloudflare) }} appearFrame={T.arrow1} durationFrames={18} color={COLORS.accent} />
      <AnimatedArrow from={{ x: NODES.cloudflare.x + NODES.cloudflare.width, y: cy(NODES.cloudflare) - 10 }} to={{ x: NODES.vercel.x, y: cy(NODES.vercel) }} appearFrame={T.arrow2} durationFrames={18} color={COLORS.blue} />
      <AnimatedArrow from={{ x: NODES.cloudflare.x + NODES.cloudflare.width, y: cy(NODES.cloudflare) + 10 }} to={{ x: NODES.nestjs.x, y: cy(NODES.nestjs) }} appearFrame={T.arrow3} durationFrames={18} color={COLORS.accent} />
      <AnimatedArrow from={{ x: NODES.nestjs.x + NODES.nestjs.width, y: cy(NODES.nestjs) }} to={{ x: NODES.postgres.x, y: cy(NODES.postgres) }} appearFrame={T.arrow4} durationFrames={18} color={COLORS.accent} />
      <AnimatedArrow from={{ x: NODES.hermes.x + NODES.hermes.width, y: cy(NODES.hermes) }} to={{ x: NODES.gitnexus.x, y: cy(NODES.gitnexus) }} appearFrame={T.arrow6} durationFrames={18} color={COLORS.purple} label="MCP" />
      <AnimatedArrow from={{ x: cx(NODES.hermes), y: NODES.hermes.y + NODES.hermes.height }} to={{ x: cx(NODES.nestjs), y: NODES.nestjs.y }} appearFrame={T.arrow5} durationFrames={18} color={COLORS.purple} dashed label="API" />
      <AnimatedArrow from={{ x: cx(NODES.hermes), y: cy(NODES.hermes) }} to={{ x: NODES.ninerouter.x, y: cy(NODES.ninerouter) }} appearFrame={T.arrow7} durationFrames={18} color={COLORS.amber} label="LLM" />
      <AnimatedArrow from={{ x: NODES.gitnexus.x + NODES.gitnexus.width, y: cy(NODES.gitnexus) }} to={{ x: NODES.github.x, y: cy(NODES.github) - 10 }} appearFrame={T.arrow8} durationFrames={18} color={COLORS.textMuted} dashed />
      <AnimatedArrow from={{ x: NODES.ninerouter.x + NODES.ninerouter.width, y: cy(NODES.ninerouter) }} to={{ x: NODES.github.x, y: cy(NODES.github) + 10 }} appearFrame={T.arrow8 + 5} durationFrames={18} color={COLORS.textMuted} dashed />

      {/* Nodes */}
      <GlassCard {...NODES.user} appearFrame={T.userAppear} accentColor={COLORS.textSecondary}>
        <NodeLabel text="User" sub="Browser" color={COLORS.textSecondary} />
      </GlassCard>

      <GlassCard {...NODES.cloudflare} appearFrame={T.cfAppear} accentColor={COLORS.amber}>
        <NodeLabel text="Cloudflare" sub="WAF + Tunnel" color={COLORS.amber} />
      </GlassCard>

      <GlassCard {...NODES.vercel} appearFrame={T.vercelAppear} accentColor={COLORS.blue}>
        <NodeLabel text="Vercel" sub="Next.js 16" color={COLORS.blue} />
      </GlassCard>

      <GlassCard {...NODES.nestjs} appearFrame={T.nestAppear} accentColor={COLORS.accent}>
        <NodeLabel text="NestJS API" sub="Docker :3001" color={COLORS.accent} />
      </GlassCard>

      <GlassCard {...NODES.postgres} appearFrame={T.dbAppear} accentColor={COLORS.blue}>
        <NodeLabel text="PostgreSQL" sub="Docker :5432" color={COLORS.blue} />
      </GlassCard>

      <GlassCard {...NODES.hermes} appearFrame={T.hermesAppear} accentColor={COLORS.purple}>
        <NodeLabel text="Hermes" sub="AI Agent" color={COLORS.purple} />
      </GlassCard>

      <GlassCard {...NODES.gitnexus} appearFrame={T.gnAppear} accentColor={COLORS.purple}>
        <NodeLabel text="GitNexus" sub="Knowledge Graph" color={COLORS.purple} />
      </GlassCard>

      <GlassCard {...NODES.ninerouter} appearFrame={T.nrAppear} accentColor={COLORS.amber}>
        <NodeLabel text="9Router" sub="LLM Gateway" color={COLORS.amber} />
      </GlassCard>

      <GlassCard {...NODES.github} appearFrame={T.ghAppear} accentColor={COLORS.textSecondary}>
        <NodeLabel text="GitHub" sub="Issues + PRs" color={COLORS.textSecondary} />
      </GlassCard>

      {/* Pulses on key nodes */}
      <PulseEffect x={cx(NODES.hermes)} y={cy(NODES.hermes)} color={COLORS.purple} startFrame={T.pulseStart} periodFrames={50} />
      <PulseEffect x={cx(NODES.cloudflare)} y={cy(NODES.cloudflare)} color={COLORS.amber} startFrame={T.pulseStart + 15} periodFrames={55} />

      {/* Badge */}
      <Sequence from={T.badge} layout="none">
        <FadeIn from={T.badge} durationFrames={25}>
          <div style={{
            position: 'absolute', bottom: 40, right: 60,
            background: `${COLORS.accent}20`,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 8, padding: '8px 16px',
            fontFamily: FONTS.heading, fontSize: 14, fontWeight: 700,
            color: COLORS.accent,
          }}>
            ✦ 100% Autonomous Development
          </div>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};
