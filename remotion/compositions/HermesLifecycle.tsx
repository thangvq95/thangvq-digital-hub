import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/constants";
import { FadeIn } from "../components/FadeIn";
import { GlassCard } from "../components/GlassCard";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { PulseEffect } from "../components/PulseEffect";
import { TypewriterText } from "../components/TypewriterText";

// Pipeline steps (x positions for horizontal flow)
const STEPS_Y = 260;
const STEP_W = 140;
const STEP_H = 70;
const steps = [
  {
    x: 60,
    label: "GitHub Webhook",
    sub: "push / PR / check_run",
    color: COLORS.textSecondary,
  },
  { x: 240, label: "Cron Scheduler", sub: "1 hour", color: COLORS.blue },
  { x: 420, label: "HMAC Verify", sub: "+ SQLite dedup", color: COLORS.amber },
  {
    x: 600,
    label: "git worktree",
    sub: "isolated workspace",
    color: COLORS.purple,
  },
  {
    x: 780,
    label: "Hermes Agent",
    sub: "hermes -s <skill>",
    color: COLORS.purple,
  },
  { x: 960, label: "Playwright", sub: "tests pass ✓", color: COLORS.accent },
  {
    x: 1100,
    label: "git push + PR",
    sub: "back to branch",
    color: COLORS.accent,
  },
];

export const HermesLifecycle: React.FC = () => {
  const { fps } = useVideoConfig();

  const T = {
    title: 0,
    pipeStart: 1 * fps,
    step0: 1 * fps,
    step1: 1 * fps + 20,
    step2: 2 * fps,
    step3: 2 * fps + 20,
    step4: 3 * fps,
    step5: 3 * fps + 20,
    step6: 4 * fps,
    codeBlock: 5 * fps,
    cronSection: 7 * fps,
    pulse: 6 * fps,
  };

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Grid bg */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.05,
        }}
      >
        <defs>
          <pattern
            id="grid2"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={COLORS.purple}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid2)" />
      </svg>

      {/* Title */}
      <FadeIn from={0} durationFrames={20}>
        <div style={{ position: "absolute", top: 50, left: 60 }}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.textPrimary,
            }}
          >
            Hermes Agent
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.textSecondary,
              marginTop: 4,
            }}
          >
            Autonomous AI Developer on VPS
          </div>
        </div>
      </FadeIn>

      {/* Horizontal pipeline label */}
      <FadeIn from={T.pipeStart} durationFrames={15}>
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 60,
            fontFamily: FONTS.body,
            fontSize: 12,
            color: COLORS.textMuted,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Webhook → Code Fix Pipeline
        </div>
      </FadeIn>

      {/* Hermes pulse */}
      <PulseEffect
        x={steps[4].x + STEP_W / 2}
        y={STEPS_Y + STEP_H / 2}
        color={COLORS.purple}
        startFrame={T.pulse}
        periodFrames={45}
        radius={38}
      />

      {/* Pipeline steps */}
      {steps.map((step, i) => {
        const appearFrame = T.step0 + i * 20;
        return (
          <React.Fragment key={i}>
            <GlassCard
              x={step.x}
              y={STEPS_Y}
              width={STEP_W}
              height={STEP_H}
              appearFrame={appearFrame}
              accentColor={step.color}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 9,
                    color: step.color,
                    textAlign: "center",
                  }}
                >
                  {step.sub}
                </span>
              </div>
            </GlassCard>
            {i < steps.length - 1 && (
              <AnimatedArrow
                from={{ x: step.x + STEP_W, y: STEPS_Y + STEP_H / 2 }}
                to={{ x: steps[i + 1].x, y: STEPS_Y + STEP_H / 2 }}
                appearFrame={appearFrame + 10}
                durationFrames={15}
                color={step.color}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Code block — hermes command */}
      <Sequence from={T.codeBlock} layout="none">
        <FadeIn from={0} durationFrames={20}>
          <div
            style={{
              position: "absolute",
              top: 380,
              left: 60,
              right: 60,
              background: "rgba(15,23,42,0.95)",
              border: `1px solid ${COLORS.purple}40`,
              borderRadius: 10,
              padding: "14px 20px",
              fontFamily: FONTS.mono,
              fontSize: 13,
            }}
          >
            <span style={{ color: COLORS.textMuted }}>$ </span>
            <TypewriterText
              text='hermes -s tdd -c "Fix failing E2E test in RepoCard component"'
              startFrame={0}
              charsPerFrame={0.8}
              style={{ color: COLORS.accent }}
            />
          </div>
        </FadeIn>
      </Sequence>

      {/* Cronjobs section */}
      <Sequence from={T.cronSection} layout="none">
        <FadeIn from={0} durationFrames={20}>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 60,
              right: 60,
              display: "flex",
              gap: 16,
            }}
          >
            {[
              {
                time: "0 1 * * *",
                label: "Weekly Trending Sync",
                sub: "Scrape GitHub → POST /api/repos/upsert",
                color: COLORS.blue,
              },
              {
                time: "0 10 * * *",
                label: "Release Monitor",
                sub: "Check favorites → POST /api/repos/check-releases",
                color: COLORS.accent,
              },
            ].map((cron, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "rgba(30,41,59,0.7)",
                  border: `1px solid ${cron.color}30`,
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: cron.color,
                    marginBottom: 4,
                  }}
                >
                  ⏰ {cron.time}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                  }}
                >
                  {cron.label}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 11,
                    color: COLORS.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {cron.sub}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};
