import React from 'react';
import { useCurrentFrame } from 'remotion';

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorChar?: string;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.6,
  style,
  cursorChar = '▋',
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const charsToShow = Math.min(Math.floor(localFrame * charsPerFrame), text.length);
  const isDone = charsToShow >= text.length;
  const showCursorNow = showCursor && !isDone;

  return (
    <span style={style}>
      {text.slice(0, charsToShow)}
      {showCursorNow && (
        <span style={{ opacity: Math.floor(localFrame / 8) % 2 === 0 ? 1 : 0 }}>
          {cursorChar}
        </span>
      )}
    </span>
  );
};
