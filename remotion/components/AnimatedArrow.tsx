import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS } from '../lib/constants';

interface Point {
  x: number;
  y: number;
}

interface AnimatedArrowProps {
  from: Point;
  to: Point;
  appearFrame?: number;
  durationFrames?: number;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  label?: string;
  labelStyle?: React.CSSProperties;
}

export const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  from,
  to,
  appearFrame = 0,
  durationFrames = 20,
  color = COLORS.accent,
  strokeWidth = 2,
  dashed = false,
  label,
  labelStyle,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;

  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (localFrame < 0) return null;

  const cx = from.x + (to.x - from.x) * progress;
  const cy = from.y + (to.y - from.y) * progress;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const arrowSize = 8;

  const midX = (from.x + cx) / 2;
  const midY = (from.y + cy) / 2;

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
      <line
        x1={from.x}
        y1={from.y}
        x2={cx}
        y2={cy}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '6 4' : undefined}
        strokeLinecap="round"
      />
      {progress > 0.85 && (
        <polygon
          points={`0,-${arrowSize / 2} ${arrowSize},0 0,${arrowSize / 2}`}
          fill={color}
          transform={`translate(${cx},${cy}) rotate(${angle})`}
        />
      )}
      {label && progress > 0.5 && (
        <text
          x={midX}
          y={midY - 8}
          fill={COLORS.textSecondary}
          fontSize={11}
          textAnchor="middle"
          fontFamily="DM Sans, system-ui, sans-serif"
          style={labelStyle}
        >
          {label}
        </text>
      )}
    </svg>
  );
};
