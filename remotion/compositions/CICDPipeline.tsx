import React from 'react';
import { AbsoluteFill, useVideoConfig, Sequence } from 'remotion';
import { COLORS, FONTS } from '../lib/constants';
import { FadeIn } from '../components/FadeIn';
import { GlassCard } from '../components/GlassCard';
import { AnimatedArrow } from '../components/AnimatedArrow';
import { TimelineStep } from '../components/TimelineStep';
import { TypewriterText } from '../components/TypewriterText';

const ciSteps = [
  { label: 'Commit', sublabel: 'feat: ...', color: COLORS.pink },
  { label: 'Husky Hook', sublabel: 'lint-staged', color: COLORS.pink },
  { label: 'commitlint', sublabel: 'Conventional', color: COLORS.amber },
  { label: 'GitHub Actions', sublabel: 'CI triggered', color: COLORS.blue },
  { label: 'SSH → VPS', sublabel: 'backend deploy', color: COLORS.accent },
  { label: 'Health Check', sublabel: '/api/repos ✓', color: COLORS.accent },
  { label: 'Vercel Hook', sublabel: 'frontend deploy', color: COLORS.blue },
];

const releaseSteps = [
  { label: 'develop → main', sublabel: 'PR merged', color: COLORS.accent },
  { label: 'release-please', sublabel: 'bot analyzes', color: COLORS.purple },
  { label: 'Release PR', sublabel: 'version bump', color: COLORS.purple },
  { label: 'CHANGELOG.md', sublabel: 'auto-generated', color: COLORS.textSecondary },
  { label: 'v1.x.x Tag', sublabel: 'GitHub Release', color: COLORS.accent },
];

export const CICDPipeline: React.FC = () => {
  const { fps } = useVideoConfig();

  const T = {
    title: 0,
    ciLabel: 1 * fps,
    ciSteps: 1 * fps + 10,
    releaseLabel: 4 * fps,
    releaseSteps: 4 * fps + 10,
    commitBlock: 2 * fps,
    badge: 6 * fps,
  };

  const STEP_SPACING = 155;
  const CI_Y = 220;
  const RELEASE_Y = 460;
  const STEP_W = 110;
  const STEP_H = 65;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05 }}>
        <defs>
          <pattern id="grid3" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.pink} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid3)" />
      </svg>

      {/* Title */}
      <FadeIn from={0} durationFrames={20}>
        <div style={{ position: 'absolute', top: 50, left: 60 }}>
          <div style={{ fontFamily: FONTS.heading, fontSize: 28, fontWeight: 700, color: COLORS.textPrimary }}>
            CI/CD Pipeline
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>
            From commit to production — fully automated
          </div>
        </div>
      </FadeIn>

      {/* CI Row label */}
      <FadeIn from={T.ciLabel} durationFrames={15}>
        <div style={{ position: 'absolute', top: CI_Y - 28, left: 50, fontFamily: FONTS.body, fontSize: 11, color: COLORS.pink, letterSpacing: 2, textTransform: 'uppercase' }}>
          Deployment Pipeline
        </div>
      </FadeIn>

      {/* CI Steps */}
      {ciSteps.map((step, i) => {
        const appearFrame = T.ciSteps + i * 12;
        const x = 50 + i * STEP_SPACING;
        return (
          <React.Fragment key={i}>
            <GlassCard x={x} y={CI_Y} width={STEP_W} height={STEP_H} appearFrame={appearFrame} accentColor={step.color}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.heading, fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>{step.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: step.color, textAlign: 'center' }}>{step.sublabel}</span>
              </div>
            </GlassCard>
            {i < ciSteps.length - 1 && (
              <AnimatedArrow
                from={{ x: x + STEP_W, y: CI_Y + STEP_H / 2 }}
                to={{ x: x + STEP_SPACING, y: CI_Y + STEP_H / 2 }}
                appearFrame={appearFrame + 8}
                durationFrames={12}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Commit code block */}
      <Sequence from={T.commitBlock} layout="none">
        <FadeIn from={T.commitBlock} durationFrames={15}>
          <div style={{
            position: 'absolute', top: CI_Y + STEP_H + 16, left: 50,
            background: 'rgba(15,23,42,0.9)', border: `1px solid ${COLORS.pink}30`,
            borderRadius: 8, padding: '8px 14px',
            fontFamily: FONTS.mono, fontSize: 12, color: COLORS.accent,
          }}>
            <TypewriterText
              text='git commit -m "feat: add stack page with Remotion videos"'
              startFrame={T.commitBlock}
              charsPerFrame={0.9}
            />
          </div>
        </FadeIn>
      </Sequence>

      {/* Release Row label */}
      <FadeIn from={T.releaseLabel} durationFrames={15}>
        <div style={{ position: 'absolute', top: RELEASE_Y - 28, left: 50, fontFamily: FONTS.body, fontSize: 11, color: COLORS.purple, letterSpacing: 2, textTransform: 'uppercase' }}>
          Release Pipeline (release-please bot)
        </div>
      </FadeIn>

      {/* Release Steps */}
      {releaseSteps.map((step, i) => {
        const appearFrame = T.releaseSteps + i * 15;
        const x = 50 + i * (STEP_SPACING + 10);
        return (
          <React.Fragment key={i}>
            <GlassCard x={x} y={RELEASE_Y} width={STEP_W + 10} height={STEP_H} appearFrame={appearFrame} accentColor={step.color}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.heading, fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>{step.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: step.color, textAlign: 'center' }}>{step.sublabel}</span>
              </div>
            </GlassCard>
            {i < releaseSteps.length - 1 && (
              <AnimatedArrow
                from={{ x: x + STEP_W + 10, y: RELEASE_Y + STEP_H / 2 }}
                to={{ x: x + STEP_SPACING + 10, y: RELEASE_Y + STEP_H / 2 }}
                appearFrame={appearFrame + 8}
                durationFrames={12}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Badge */}
      <Sequence from={T.badge} layout="none">
        <FadeIn from={T.badge} durationFrames={20}>
          <div style={{
            position: 'absolute', bottom: 36, right: 60,
            background: `${COLORS.accent}15`,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 8, padding: '8px 16px',
            fontFamily: FONTS.heading, fontSize: 13, fontWeight: 700, color: COLORS.accent,
          }}>
            ✦ Backend-first, race-condition-free
          </div>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};
