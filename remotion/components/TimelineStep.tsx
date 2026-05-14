import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS, FONTS } from '../lib/constants';

interface TimelineStepProps {
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  appearFrame?: number;
  active?: boolean;
  done?: boolean;
  color?: string;
  index?: number;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  label,
  sublabel,
  x,
  y,
  appearFrame = 0,
  active = false,
  done = false,
  color = COLORS.accent,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(localFrame, [0, 15], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  const bgColor = active || done ? color : COLORS.card;
  const textColor = active || done ? '#000' : color;
  const glowShadow = active ? `0 0 20px ${color}60` : done ? `0 0 10px ${color}30` : 'none';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transformOrigin: 'center top',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: bgColor,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: glowShadow,
        }}
      >
        {done ? '✓' : index + 1}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 12,
          color: active ? COLORS.textPrimary : COLORS.textSecondary,
          textAlign: 'center',
          maxWidth: 90,
          lineHeight: 1.3,
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 10,
            color: COLORS.textMuted,
            textAlign: 'center',
            maxWidth: 90,
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
};
