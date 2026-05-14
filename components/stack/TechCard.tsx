'use client';

import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { TechItem } from '@/lib/stack-data';

interface TechCardProps {
  item: TechItem;
  accentColor?: string;
}

export const TechCard: React.FC<TechCardProps> = ({ item, accentColor = '#22C55E' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass card-hover rounded-xl p-4 cursor-pointer group relative"
      style={{ borderColor: `${accentColor}30` }}
      onClick={() => setExpanded((e) => !e)}
      role="button"
      aria-expanded={expanded}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-heading font-bold text-text-primary text-sm leading-tight"
              style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
            >
              {item.name}
            </span>
            {item.version && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                v{item.version}
              </span>
            )}
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            {item.role}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-accent"
            style={{ color: accentColor }}
            aria-label={`Open ${item.name} website`}
          >
            <ExternalLink size={12} />
          </a>
          {item.why && (
            <div
              className="p-1 rounded-md text-text-muted"
              style={{ color: expanded ? accentColor : undefined }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded why */}
      {expanded && item.why && (
        <div
          className="mt-3 pt-3 text-xs text-text-secondary leading-relaxed animate-fade-in"
          style={{ borderTop: `1px solid ${accentColor}20` }}
        >
          {item.why}
        </div>
      )}

      {/* Hover accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `linear-gradient(90deg, ${accentColor}00, ${accentColor}80, ${accentColor}00)` }}
      />
    </div>
  );
};
