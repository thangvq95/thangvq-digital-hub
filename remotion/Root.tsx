import React from 'react';
import { Composition } from 'remotion';
import { ArchitectureOverview } from './compositions/ArchitectureOverview';
import { HermesLifecycle } from './compositions/HermesLifecycle';
import { CICDPipeline } from './compositions/CICDPipeline';
import { DataPipelines } from './compositions/DataPipelines';
import { SentryAutoFix } from './compositions/SentryAutoFix';
import { FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from './lib/constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArchitectureOverview"
        component={ArchitectureOverview}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <Composition
        id="HermesLifecycle"
        component={HermesLifecycle}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <Composition
        id="CICDPipeline"
        component={CICDPipeline}
        durationInFrames={9 * FPS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <Composition
        id="DataPipelines"
        component={DataPipelines}
        durationInFrames={9 * FPS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <Composition
        id="SentryAutoFix"
        component={SentryAutoFix}
        durationInFrames={9 * FPS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
