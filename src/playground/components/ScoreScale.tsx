import React from 'react';
import { halfOf, centreOf, HandleReview } from '../logic/scoring';

interface ScoreScaleProps {
  handles: HandleReview[];
  /** One name for each handle, by index. */
  labels: string[];
}

const W = 320;
const MID = W / 2;
const HALF_PX = 146;

/**
 * One row for each spot that counted. The row is centred on the target, so every row reads the same
 * way: the dark band is 100 points, the tinted band is the target, and beyond the pale band is 0.
 * A hollow dot shows where the spot started. A filled dot shows where the learner left it.
 */
export const ScoreScale: React.FC<ScoreScaleProps> = ({ handles, labels }) => {
  const rows = handles.filter((h) => h.scored || h.broken);
  if (rows.length === 0) return null;
  return (
    <ul className="dp-scale" aria-label="Where each answer sits on its target">
      {rows.map((h) => {
        const c = centreOf(h.target);
        const half = Math.max(halfOf(h.target), 0.5);
        const reach = Math.max(3.4 * half, 1.12 * Math.abs(h.value - c), 1.12 * Math.abs(h.start - c));
        const x = (v: number) => MID + ((v - c) / reach) * HALF_PX;
        const band = (k: number) => ({ x: x(c - k * half), width: Math.max(2, x(c + k * half) - x(c - k * half)) });
        return (
          <li key={h.index} className="dp-scale-row">
            <span className="dp-scale-name">{labels[h.index] ?? `Spot ${h.index + 1}`}</span>
            <svg viewBox={`0 0 ${W} 22`} className="dp-scale-svg" role="img" aria-label={`${labels[h.index] ?? 'Spot'}: ${h.grade === 'exact' ? 'exact' : h.grade === 'zone' ? 'in the zone' : 'off target'}`}>
              <rect className="ss-zero" x={band(3).x} y={6} {...{ width: band(3).width }} height={10} rx={5} />
              <rect className="ss-zone" x={band(1).x} y={6} width={band(1).width} height={10} rx={3} />
              <rect className="ss-exact" x={band(1 / 3).x} y={6} width={band(1 / 3).width} height={10} rx={2} />
              {!h.startedGood && (
                <circle className="ss-start" cx={Math.min(W - 6, Math.max(6, x(h.start)))} cy={11} r={4.5} />
              )}
              <circle className={`ss-dot ss-dot--${h.grade}`} cx={Math.min(W - 6, Math.max(6, x(h.value)))} cy={11} r={5.5} />
            </svg>
          </li>
        );
      })}
    </ul>
  );
};
