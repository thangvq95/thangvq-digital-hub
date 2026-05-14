import React from 'react';
import { TechCard } from './TechCard';
import { techStack, categoryMeta } from '@/lib/stack-data';

export const TechStackGrid: React.FC = () => {
  return (
    <div className="space-y-10">
      {Object.entries(techStack).map(([category, items]) => {
        const meta = categoryMeta[category];
        return (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}80` }}
              />
              <h3
                className="font-heading font-bold text-text-primary text-base"
                style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              >
                {meta.label}
              </h3>
              <span className="text-text-muted text-sm">{meta.description}</span>
              <div
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: `${meta.color}10`,
                  color: meta.color,
                  border: `1px solid ${meta.color}30`,
                }}
              >
                {items.length} tools
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((item) => (
                <TechCard key={item.name} item={item} accentColor={meta.color} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
