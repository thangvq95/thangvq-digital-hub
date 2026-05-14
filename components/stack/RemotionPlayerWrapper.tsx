'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';

// Lazy load Player to avoid SSR issues
const Player = dynamic(() => import('@remotion/player').then((m) => m.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-bg-card rounded-xl flex items-center justify-center border border-border animate-pulse">
      <div className="text-text-muted text-sm">Loading video...</div>
    </div>
  ),
});

interface RemotionPlayerWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  durationInFrames: number;
  fps?: number;
  compositionWidth?: number;
  compositionHeight?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

export const RemotionPlayerWrapper: React.FC<RemotionPlayerWrapperProps> = ({
  component,
  durationInFrames,
  fps = 30,
  compositionWidth = 1280,
  compositionHeight = 720,
  autoPlay = false,
  loop = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerWidth, setPlayerWidth] = useState(800);
  const [isVisible, setIsVisible] = useState(false);

  // Responsive width
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setPlayerWidth(containerRef.current.offsetWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Intersection observer for lazy play
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playerHeight = Math.round(playerWidth * (compositionHeight / compositionWidth));

  return (
    <div ref={containerRef} className="w-full rounded-xl overflow-hidden border border-border shadow-lg">
      <Player
        component={component}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        style={{ width: playerWidth, height: playerHeight }}
        controls
        clickToPlay
        loop={loop}
        autoPlay={autoPlay && isVisible}
        acknowledgeRemotionLicense
      />
    </div>
  );
};
