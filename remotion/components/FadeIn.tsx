import { interpolate, useCurrentFrame, Easing } from 'remotion';
import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  from?: number;
  durationFrames?: number;
  translateY?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  from = 0,
  durationFrames = 20,
  translateY = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;

  const opacity = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const y = interpolate(localFrame, [0, durationFrames], [translateY, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (localFrame < 0) return null;

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};
