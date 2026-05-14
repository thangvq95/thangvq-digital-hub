import React from 'react';
import { AbsoluteFill, useVideoConfig, Sequence } from 'remotion';
import { COLORS, FONTS } from '../lib/constants';
import { FadeIn } from '../components/FadeIn';
import { GlassCard } from '../components/GlassCard';
import { AnimatedArrow } from '../components/AnimatedArrow';
import { PulseEffect } from '../components/PulseEffect';

const LANE_Y = { top: 130, bottom: 430 };
const CARD_W = 140;
const CARD_H = 65;
const CARD_GAP = 165;

const trendingSteps = [
  { label: 'Hermes Cron', sub: '0 8,20 * * *', color: COLORS.blue },
  { label: 'github.com/trending', sub: 'weekly · ~25 repos', color: COLORS.blue },
  { label: 'POST /upsert', sub: 'x-api-key auth', color: COLORS.accent },
  { label: 'PostgreSQL', sub: 'INSERT new repos', color: COLORS.accent },
  { label: 'Dashboard', sub: '"NEW" badge', color: COLORS.accent },
];

const releaseSteps = [
  { label: 'Hermes Cron', sub: '0 10 * * *', color: COLORS.purple },
  { label: 'GET /repos?tab=favorites', sub: 'is_favorite=true', color: COLORS.purple },
  { label: 'GitHub Releases API', sub: '/releases/latest', color: COLORS.textSecondary },
  { label: 'compare tag', sub: 'if changed →', color: COLORS.amber },
  { label: 'has_new_release=true', sub: 'badge glows ✦', color: COLORS.amber },
];

export const DataPipelines: React.FC = () => {
  const { fps } = useVideoConfig();

  const T = {
    title: 0,
    topLabel: 1 * fps,
    topSteps: 1 * fps + 10,
    bottomLabel: 3 * fps,
    bottomSteps: 3 * fps + 10,
    mergeArrows: 5 * fps,
    dashboardCard: 6 * fps,
    pulse: 5 * fps + 15,
  };

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05 }}>
        <defs>
          <pattern id="grid4" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.blue} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid4)" />
      </svg>

      {/* Title */}
      <FadeIn from={0} durationFrames={20}>
        <div style={{ position: 'absolute', top: 42, left: 60 }}>
          <div style={{ fontFamily: FONTS.heading, fontSize: 26, fontWeight: 700, color: COLORS.textPrimary }}>
            Data Pipelines
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textSecondary, marginTop: 3 }}>
            Two Hermes cronjobs keep the TechTrend dashboard fresh
          </div>
        </div>
      </FadeIn>

      {/* Divider line */}
      <FadeIn from={T.topLabel} durationFrames={15}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1={0} y1={360} x2={940} y2={360} stroke={COLORS.border} strokeWidth={1} strokeDasharray="6 4" />
        </svg>
      </FadeIn>

      {/* TOP LANE — Trending Sync */}
      <FadeIn from={T.topLabel} durationFrames={15}>
        <div style={{ position: 'absolute', top: LANE_Y.top - 30, left: 50, fontFamily: FONTS.body, fontSize: 11, color: COLORS.blue, letterSpacing: 2, textTransform: 'uppercase' }}>
          ① Trending Sync (8AM & 8PM)
        </div>
      </FadeIn>

      {trendingSteps.map((step, i) => {
        const x = 50 + i * CARD_GAP;
        const appearFrame = T.topSteps + i * 14;
        return (
          <React.Fragment key={`top-${i}`}>
            <GlassCard x={x} y={LANE_Y.top} width={CARD_W} height={CARD_H} appearFrame={appearFrame} accentColor={step.color}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.heading, fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>{step.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: step.color, textAlign: 'center' }}>{step.sub}</span>
              </div>
            </GlassCard>
            {i < trendingSteps.length - 1 && (
              <AnimatedArrow
                from={{ x: x + CARD_W, y: LANE_Y.top + CARD_H / 2 }}
                to={{ x: x + CARD_GAP, y: LANE_Y.top + CARD_H / 2 }}
                appearFrame={appearFrame + 10}
                durationFrames={12}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* BOTTOM LANE — Release Monitor */}
      <FadeIn from={T.bottomLabel} durationFrames={15}>
        <div style={{ position: 'absolute', top: LANE_Y.bottom - 30, left: 50, fontFamily: FONTS.body, fontSize: 11, color: COLORS.purple, letterSpacing: 2, textTransform: 'uppercase' }}>
          ② Release Monitor (10AM daily)
        </div>
      </FadeIn>

      {releaseSteps.map((step, i) => {
        const x = 50 + i * CARD_GAP;
        const appearFrame = T.bottomSteps + i * 14;
        return (
          <React.Fragment key={`bot-${i}`}>
            <GlassCard x={x} y={LANE_Y.bottom} width={CARD_W} height={CARD_H} appearFrame={appearFrame} accentColor={step.color}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.heading, fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>{step.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: step.color, textAlign: 'center' }}>{step.sub}</span>
              </div>
            </GlassCard>
            {i < releaseSteps.length - 1 && (
              <AnimatedArrow
                from={{ x: x + CARD_W, y: LANE_Y.bottom + CARD_H / 2 }}
                to={{ x: x + CARD_GAP, y: LANE_Y.bottom + CARD_H / 2 }}
                appearFrame={appearFrame + 10}
                durationFrames={12}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Merge arrows → TechTrend Dashboard card */}
      <AnimatedArrow
        from={{ x: 50 + 4 * CARD_GAP + CARD_W, y: LANE_Y.top + CARD_H / 2 }}
        to={{ x: 990, y: 290 }}
        appearFrame={T.mergeArrows}
        durationFrames={20}
        color={COLORS.accent}
      />
      <AnimatedArrow
        from={{ x: 50 + 4 * CARD_GAP + CARD_W, y: LANE_Y.bottom + CARD_H / 2 }}
        to={{ x: 990, y: 310 }}
        appearFrame={T.mergeArrows + 5}
        durationFrames={20}
        color={COLORS.amber}
      />

      {/* TechTrend Dashboard merged card */}
      <GlassCard x={990} y={230} width={230} height={140} appearFrame={T.dashboardCard} accentColor={COLORS.accent}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FONTS.heading, fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>TechTrend Dashboard</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ background: `${COLORS.blue}20`, border: `1px solid ${COLORS.blue}40`, borderRadius: 4, padding: '2px 8px', fontFamily: FONTS.mono, fontSize: 10, color: COLORS.blue }}>NEW</span>
            <span style={{ background: `${COLORS.amber}20`, border: `1px solid ${COLORS.amber}40`, borderRadius: 4, padding: '2px 8px', fontFamily: FONTS.mono, fontSize: 10, color: COLORS.amber }}>RELEASE ✦</span>
          </div>
          <span style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textSecondary }}>Auto-updated 2× daily</span>
        </div>
      </GlassCard>

      <PulseEffect x={1105} y={300} color={COLORS.accent} startFrame={T.pulse} periodFrames={50} radius={70} />
    </AbsoluteFill>
  );
};
