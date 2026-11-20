import React from 'react';
import { AssistId } from '../types';

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const PATHS: Record<AssistId | 'back' | 'sun' | 'moon' | 'book' | 'fine' | 'lock', React.ReactNode> = {
  guides: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </>
  ),
  blur: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  grid: <path d="M4 4h16v16H4zM4 12h16M12 4v16" />,
  compare: <path d="M4 6h16M4 12h10M4 18h16" />,
  back: <path d="M15 5l-7 7 7 7" />,
  fine: <path d="M4 8h9M17 8h3M4 16h3M11 16h9M15 5v6M9 13v6" />,
  lock: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13" />,
};

export const DpIcon: React.FC<{ name: keyof typeof PATHS; size?: number }> = ({ name, size = 18 }) => (
  <svg {...base} width={size} height={size}>
    {PATHS[name]}
  </svg>
);

export const ASSIST_LABELS: Record<AssistId, string> = {
  guides: 'Guides and ruler',
  blur: 'Squint blur',
  grid: 'Grid',
  compare: 'Compare with the default',
};
