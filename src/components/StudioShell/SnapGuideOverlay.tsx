import React from 'react';
import { SnapKind } from '../../engine/snapEngine';

export interface ActiveSnapLine {
  axis: 'x' | 'y';
  /** Percentage [0..100] or CSS length string */
  pos: string;
  label?: string;
  kind?: SnapKind;
}

interface SnapGuideOverlayProps {
  lines: ActiveSnapLine[];
}

const SNAP_COLOR: Record<SnapKind, string> = {
  center: '#D946EF', // Classic Affinity / Figma magenta center smart guide
  edge: '#0EA5E9',   // Crisp cyan edge alignment
  column: '#0EA5E9',
  third: '#F59E0B',
  grid: '#0EA5E9',
  zero: '#D946EF',
};

/**
 * Renders transient Adobe / Affinity style alignment smart-guides while dragging.
 */
export const SnapGuideOverlay: React.FC<SnapGuideOverlayProps> = ({ lines }) => {
  if (lines.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 35,
        overflow: 'visible',
      }}
    >
      {lines.map((line, idx) => {
        const color = SNAP_COLOR[line.kind ?? 'edge'];
        const isX = line.axis === 'x';
        return (
          <div
            key={`${line.axis}-${line.pos}-${idx}`}
            style={{
              position: 'absolute',
              ...(isX
                ? { left: line.pos, top: 0, bottom: 0, width: 1 }
                : { top: line.pos, left: 0, right: 0, height: 1 }),
              background: color,
              boxShadow: `0 0 0 0.5px ${color}`,
            }}
          >
            {line.label && (
              <span
                className="tabular"
                style={{
                  position: 'absolute',
                  ...(isX ? { top: 6, left: 4 } : { left: 6, top: 4 }),
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 3,
                  background: color,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {line.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
