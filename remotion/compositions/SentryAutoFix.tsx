import React from 'react';
import { AbsoluteFill, useVideoConfig, Sequence } from 'remotion';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS, FONTS } from '../lib/constants';
import { FadeIn } from '../components/FadeIn';
import { GlassCard } from '../components/GlassCard';
import { AnimatedArrow } from '../components/AnimatedArrow';
import { PulseEffect } from '../components/PulseEffect';

const CARD_W = 140;
const CARD_H = 70;
const STEPS_Y = 280;
const STEP_GAP = 175;

const steps = [
  { label: 'Production Error', sub: 'unhandled exception', color: COLORS.red, x: 40 },
  { label: 'Sentry Alert', sub: 'stack trace captured', color: COLORS.red, x: 40 + STEP_GAP },
  { label: 'Webhook Handler', sub: '/webhooks/sentry', color: COLORS.amber, x: 40 + 2 * STEP_GAP },
  { label: 'GitHub Issue', sub: 'auto-created', color: COLORS.blue, x: 40 + 3 * STEP_GAP },
  { label: 'Hermes picks up', sub: 'GitNexus context', color: COLORS.purple, x: 40 + 4 * STEP_GAP },
  { label: 'Fix + Playwright', sub: 'tests pass ✓', color: COLORS.accent, x: 40 + 5 * STEP_GAP },
  { label: 'PR merged ✓', sub: 'issue auto-closed', color: COLORS.accent, x: 40 + 6 * STEP_GAP },
];

const ErrorBurst: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > 25) return null;

  const scale = interpolate(localFrame, [0, 10, 25], [0, 1.4, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const opacity = interpolate(localFrame, [0, 5, 25], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute',
      left: steps[0].x + CARD_W / 2 - 30,
      top: STEPS_Y - 60,
      width: 60, height: 60,
      transform: `scale(${scale})`,
      opacity,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36,
    }}>
      💥
    </div>
  );
};

export const SentryAutoFix: React.FC = () => {
  const { fps } = useVideoConfig();

  const T = {
    title: 0,
    burst: 1 * fps,
    steps: 1 * fps + 8,
    greenBadge: 7 * fps,
    pulse: 6 * fps,
  };

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Animated background gradient: red → green */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.07) 0%, transparent 60%),
                     radial-gradient(ellipse at 85% 50%, rgba(34,197,94,0.07) 0%, transparent 60%)`,
      }} />

      {/* Grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05 }}>
        <defs>
          <pattern id="grid5" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.red} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid5)" />
      </svg>

      {/* Title */}
      <FadeIn from={0} durationFrames={20}>
        <div style={{ position: 'absolute', top: 50, left: 60 }}>
          <div style={{ fontFamily: FONTS.heading, fontSize: 28, fontWeight: 700, color: COLORS.textPrimary }}>
            Self-Healing Pipeline
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>
            Sentry error → autonomous fix → closed issue · in minutes
          </div>
        </div>
      </FadeIn>

      {/* Error burst */}
      <ErrorBurst startFrame={T.burst} />

      {/* Sentry pulse (red) */}
      <PulseEffect x={steps[1].x + CARD_W / 2} y={STEPS_Y + CARD_H / 2} color={COLORS.red} startFrame={T.steps + 16} periodFrames={40} radius={38} />

      {/* Green pulse on PR merged */}
      <PulseEffect x={steps[6].x + CARD_W / 2} y={STEPS_Y + CARD_H / 2} color={COLORS.accent} startFrame={T.pulse} periodFrames={45} radius={38} />

      {/* Steps */}
      {steps.map((step, i) => {
        const appearFrame = T.steps + i * 16;
        const isDone = i >= 5;
        const isRed = i < 2;
        return (
          <React.Fragment key={i}>
            <GlassCard
              x={step.x} y={STEPS_Y}
              width={CARD_W} height={CARD_H}
              appearFrame={appearFrame}
              accentColor={step.color}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.heading, fontSize: 11, fontWeight: 700, color: isRed ? COLORS.red : COLORS.textPrimary, textAlign: 'center' }}>
                  {step.label}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: step.color, textAlign: 'center' }}>
                  {step.sub}
                </span>
              </div>
            </GlassCard>
            {i < steps.length - 1 && (
              <AnimatedArrow
                from={{ x: step.x + CARD_W, y: STEPS_Y + CARD_H / 2 }}
                to={{ x: step.x + STEP_GAP, y: STEPS_Y + CARD_H / 2 }}
                appearFrame={appearFrame + 10}
                durationFrames={14}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* GitHub Issue detail box */}
      <Sequence from={T.steps + 3 * 16 + 10} layout="none">
        <FadeIn from={T.steps + 3 * 16 + 10} durationFrames={20}>
          <div style={{
            position: 'absolute', top: STEPS_Y + CARD_H + 20, left: steps[3].x - 10,
            background: 'rgba(15,23,42,0.95)', border: `1px solid ${COLORS.blue}40`,
            borderRadius: 8, padding: '10px 14px', width: 180,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.blue, marginBottom: 4 }}>📋 GitHub Issue #42</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textSecondary }}>
              [Sentry] TypeError: Cannot read properties of undefined
            </div>
          </div>
        </FadeIn>
      </Sequence>

      {/* Green badge */}
      <Sequence from={T.greenBadge} layout="none">
        <FadeIn from={T.greenBadge} durationFrames={25}>
          <div style={{
            position: 'absolute', bottom: 40, right: 60,
            background: `${COLORS.accent}15`,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 8, padding: '8px 20px',
            fontFamily: FONTS.heading, fontSize: 14, fontWeight: 700, color: COLORS.accent,
          }}>
            ✦ Error → Fix, no human needed
          </div>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};
