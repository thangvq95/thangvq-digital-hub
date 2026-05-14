import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS } from '../lib/constants';

interface GlassCardProps {
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  appearFrame?: number;
  accentColor?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  x,
  y,
  width,
  height,
  appearFrame = 0,
  accentColor = COLORS.accent,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(localFrame, [0, 15], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'rgba(30,41,59,0.85)',
        border: `1px solid ${accentColor}40`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 6,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 0 24px ${accentColor}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter: 'blur(12px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
