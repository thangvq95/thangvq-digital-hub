'use client';

import React, { Suspense } from 'react';
import { Play } from 'lucide-react';
import { RemotionPlayerWrapper } from './RemotionPlayerWrapper';

interface SectionBlockProps {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  videoLabel: string;
  videoDurationInFrames: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoComponent: React.ComponentType<any>;
  children: React.ReactNode;
  reverse?: boolean;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  id,
  title,
  subtitle,
  accentColor,
  videoLabel,
  videoDurationInFrames,
  videoComponent,
  children,
  reverse = false,
}) => {
  return (
    <section id={id} className="scroll-mt-20">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}80` }}
        />
        <div>
          <h2
            className="font-heading font-bold text-text-primary text-2xl"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
          >
            {title}
          </h2>
          <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Content: video + cards */}
      <div className={`flex flex-col xl:flex-row gap-6 ${reverse ? 'xl:flex-row-reverse' : ''}`}>
        {/* Video panel */}
        <div className="xl:w-[55%] shrink-0">
          {/* Video label */}
          <div className="flex items-center gap-2 mb-3">
            <Play
              size={12}
              className="fill-current"
              style={{ color: accentColor }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: accentColor }}
            >
              {videoLabel}
            </span>
          </div>
          <Suspense
            fallback={
              <div
                className="w-full aspect-video rounded-xl border animate-pulse flex items-center justify-center"
                style={{ borderColor: `${accentColor}20`, background: '#1E293B' }}
              >
                <span className="text-text-muted text-sm">Loading animation...</span>
              </div>
            }
          >
            <RemotionPlayerWrapper
              component={videoComponent}
              durationInFrames={videoDurationInFrames}
              autoPlay={false}
              loop
            />
          </Suspense>
        </div>

        {/* Cards / detail panel */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </section>
  );
};
