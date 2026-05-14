import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../lib/constants';

interface PulseEffectProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  startFrame?: number;
  periodFrames?: number;
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  x,
  y,
  radius = 20,
  color = COLORS.accent,
  startFrame = 0,
  periodFrames = 60,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const localFrame = (frame - startFrame) % periodFrames;

  const scale = interpolate(localFrame, [0, periodFrames], [0.5, 2.5], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(localFrame, [0, periodFrames], [0.8, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <circle
        cx={x}
        cy={y}
        r={radius * scale}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={opacity}
      />
      <circle cx={x} cy={y} r={radius * 0.45} fill={color} opacity={0.9} />
    </svg>
  );
};
