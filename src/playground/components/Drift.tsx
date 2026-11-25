import React, { useMemo, useRef, useState } from 'react';
import { randomSeedCode } from '../../engine/prng';
import { Block, buildDrift, DRIFT_RANGE, DriftLayout, LayoutJob } from '../content/layouts';
import { Palette } from '../content/scenes';
import { driftNotes } from '../logic/notes';
import { HandleReview, reviewAnswer } from '../logic/scoring';
import { useElementWidth } from '../state/useElementWidth';
import { tipFor } from '../content/tips';
import { DpIcon } from './Icons';
import { TipStrip } from './TipStrip';
import { ReviewPanel, ReviewView } from './ReviewPanel';

interface DriftProps {
  /** Best score so far. */
  best: number;
  onScored: (score: number) => void;
  tipsOpen: boolean;
  onToggleTips: () => void;
  /** Fixed seed for tests and shared links. A new one for each page when not given. */
  initialSeed?: string;
}

/** Screen px a pointer must move before a drag picks its axis. A tap never moves a block. */
const AXIS_LOCK_PX = 4;

const clamp = (v: number) => Math.min(DRIFT_RANGE.max, Math.max(DRIFT_RANGE.min, v));

/** The inside of one block. Shapes only, so the eye reads edges, not words. */
function BlockArt({ b, p }: { b: Block; p: Palette }) {
  const [s0, s1, s2, s3] = b.seed;
  const lines = (n: number, weight: number, gap: number, op: number) =>
    Array.from({ length: n }, (_, i) => (
      <span
        key={i}
        className="dp-blk-line"
        style={{ height: weight, marginBottom: gap, background: p.ink, opacity: op, width: i === n - 1 ? `${45 + s1 * 35}%` : '100%' }}
      />
    ));
  switch (b.kind) {
    case 'image':
      return (
        <span className="dp-blk-fill" style={{ background: `linear-gradient(${120 + s0 * 90}deg, ${p.accent}, ${p.soft})` }}>
          <span className="dp-blk-sun" style={{ background: p.bg, left: `${15 + s1 * 60}%`, top: `${15 + s2 * 40}%` }} />
          <span className="dp-blk-hill" style={{ background: p.ink, opacity: 0.25, left: `${-20 + s3 * 30}%` }} />
        </span>
      );
    case 'heading':
      return <span className="dp-blk-col">{lines(s0 < 0.5 ? 1 : 2, Math.min(56, b.h * 0.34), Math.min(18, b.h * 0.1), 1)}</span>;
    case 'text': {
      const n = Math.max(2, Math.min(14, Math.floor(b.h / 28)));
      return <span className="dp-blk-col">{lines(n, 10, 14, 0.35)}</span>;
    }
    case 'quote':
      return (
        <span className="dp-blk-col">
          <span className="dp-blk-mark" style={{ background: p.accent }} />
          {lines(Math.max(2, Math.min(5, Math.floor(b.h / 40))), 18, 14, 0.8)}
        </span>
      );
    case 'chart': {
      const bars = 6 + Math.floor(s0 * 6);
      return (
        <span className="dp-blk-fill dp-blk-chart" style={{ background: p.soft }}>
          {Array.from({ length: bars }, (_, i) => (
            <span key={i} style={{ background: i === Math.floor(s1 * bars) ? p.accent : p.ink, opacity: i === Math.floor(s1 * bars) ? 1 : 0.3, height: `${20 + ((Math.sin(i * 1.7 + s2 * 6) + 1) / 2) * 70}%` }} />
          ))}
        </span>
      );
    }
    case 'stat':
      return (
        <span className="dp-blk-fill dp-blk-stat" style={{ background: p.soft }}>
          <span style={{ background: p.ink, width: `${35 + s0 * 30}%`, height: Math.min(40, b.h * 0.3) }} />
          <span style={{ background: p.accent, width: `${25 + s1 * 50}%`, height: 10 }} />
        </span>
      );
    case 'card':
    default:
      return (
        <span className="dp-blk-fill dp-blk-card" style={{ background: p.soft }}>
          <span style={{ background: p.accent, width: `${30 + s0 * 30}%`, height: 14 }} />
          {lines(Math.max(1, Math.min(5, Math.floor(b.h / 50))), 8, 12, 0.3)}
        </span>
      );
  }
}

/** The grid, shown only in the review: columns as bands and rows as lines. */
function GridOverlay({ layout }: { layout: DriftLayout }) {
  const g = layout.grid;
  const top = g.rowTop[0];
  const bottom = g.rowBottom[g.rows - 1];
  return (
    <div className="dp-drift-grid" aria-hidden="true">
      {g.colLeft.map((l, i) => (
        <span key={`c${i}`} className="dp-drift-col" style={{ left: l, width: g.colRight[i] - l, top, height: bottom - top }} />
      ))}
      {g.rowTop.map((t, i) => (
        <React.Fragment key={`r${i}`}>
          <span className="dp-drift-row" style={{ top: t, left: g.colLeft[0], width: g.colRight[g.cols - 1] - g.colLeft[0] }} />
          <span className="dp-drift-row" style={{ top: g.rowBottom[i], left: g.colLeft[0], width: g.colRight[g.cols - 1] - g.colLeft[0] }} />
        </React.Fragment>
      ))}
    </div>
  );
}

const worstGrade = (hs: HandleReview[]) =>
  hs.some((h) => h.grade === 'miss') ? 'miss' : hs.some((h) => h.grade === 'zone') ? 'zone' : 'exact';

/**
 * Spot the drift. A page sits on a hidden grid and a few blocks have moved off it by a few pixels.
 * Find them, put them back, leave the rest. Lock in to see the grid, the ideal places and the notes.
 */
export const DriftWork: React.FC<DriftProps> = ({ best, onScored, initialSeed, tipsOpen, onToggleTips }) => {
  const [seed, setSeed] = useState(() => initialSeed ?? randomSeedCode());
  const [job, setJob] = useState<LayoutJob | undefined>(undefined);
  const layout = useMemo(() => buildDrift(seed, job), [seed, job]);
  const [edit, setEdit] = useState<{ seed: string; job?: LayoutJob; vals: number[] }>({ seed: '', vals: [] });
  const values = edit.seed === seed && edit.job === job ? edit.vals : layout.start;
  const [selected, setSelected] = useState(-1);
  const [locked, setLocked] = useState(false);
  const [view, setView] = useState<ReviewView>('overlay');
  const [practice, setPractice] = useState(false);
  const [session, setSession] = useState({ count: 0, total: 0 });
  const [zoom, setZoom] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref, 800);
  const room = typeof window !== 'undefined' ? window.innerHeight - 250 - (locked ? 300 : tipsOpen ? 96 : 48) : 600;
  const fit = Math.min(1, (width - 8) / layout.w, Math.max(260, room) / layout.h);
  const scale = zoom ? Math.max(1, fit * 2) : fit;

  const setValue = (h: number, v: number) =>
    setEdit((prev) => ({
      seed,
      job,
      vals: (prev.seed === seed && prev.job === job ? prev.vals : layout.start).map((x, k) => (k === h ? v : x)),
    }));

  const drag = useRef<{ id: number; block: number; sx: number; sy: number; vx: number; vy: number; axis: 'x' | 'y' | null; scale: number } | null>(null);

  const review = useMemo(
    () => (locked ? reviewAnswer(values, layout.start, layout.targets, layout.groups) : null),
    [locked, values, layout]
  );
  const notes = useMemo(() => (review ? driftNotes(review, layout) : []), [review, layout]);
  // The panel counts blocks, not axes: a block is right when both of its axes are in the target.
  const blockReview = review && {
    ...review,
    right: layout.blocks.filter((_, i) => review.handles[i * 2].grade !== 'miss' && review.handles[i * 2 + 1].grade !== 'miss').length,
    total: layout.blocks.length,
  };

  const lockIn = () => {
    const r = reviewAnswer(values, layout.start, layout.targets, layout.groups);
    setLocked(true);
    setView('overlay');
    setSelected(-1);
    if (!practice) {
      setSession((s) => ({ count: s.count + 1, total: s.total + r.score }));
      onScored(r.score);
    }
  };
  const next = () => {
    setSeed(randomSeedCode());
    setLocked(false);
    setPractice(false);
    setSelected(-1);
  };
  const retry = () => {
    setEdit({ seed, job, vals: layout.start });
    setLocked(false);
    setPractice(true);
  };

  const shown = locked && view === 'ideal' ? layout.start.map(() => 0) : values;
  const overlay = locked && view === 'overlay';

  const blockProps = (i: number) =>
    locked
      ? { 'aria-hidden': true as const }
      : {
          tabIndex: 0,
          role: 'button' as const,
          'aria-roledescription': 'movable block',
          'aria-label': `${layout.blocks[i].label}. Drag it, or use the arrow keys. Shift moves 10 px.`,
          'aria-pressed': selected === i,
          onFocus: () => setSelected(i),
          onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
            // The page under the block clears the selection, so the event stops here.
            e.stopPropagation();
            try {
              e.currentTarget.setPointerCapture?.(e.pointerId);
            } catch {
              // A test event or a lost pointer cannot be captured. The drag still works.
            }
            drag.current = { id: e.pointerId, block: i, sx: e.clientX, sy: e.clientY, vx: values[i * 2], vy: values[i * 2 + 1], axis: null, scale };
            setSelected(i);
          },
          onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId) return;
            const dx = e.clientX - d.sx;
            const dy = e.clientY - d.sy;
            // A drag moves on one axis, picked by the first few pixels. So a block that is right on
            // one axis does not drift on the other by accident. Alt moves freely.
            if (!d.axis && !e.altKey) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return;
              d.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
            }
            if (e.altKey || d.axis === 'x') setValue(d.block * 2, clamp(Math.round(d.vx + dx / d.scale)));
            if (e.altKey || d.axis === 'y') setValue(d.block * 2 + 1, clamp(Math.round(d.vy + dy / d.scale)));
          },
          onPointerUp: () => {
            drag.current = null;
          },
          onPointerCancel: () => {
            drag.current = null;
          },
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
            const step = e.shiftKey ? 10 : 1;
            const move: Record<string, [number, number]> = {
              ArrowLeft: [0, -step],
              ArrowRight: [0, step],
              ArrowUp: [1, -step],
              ArrowDown: [1, step],
            };
            const m = move[e.key];
            if (!m) return;
            e.preventDefault();
            setValue(i * 2 + m[0], clamp(values[i * 2 + m[0]] + m[1]));
          },
        };

  const avg = session.count ? Math.round(session.total / session.count) : 0;
  const p = layout.palette;
  return (
    <main className={`dp-scene dp-drift${locked ? ' dp-scene--locked' : ''}`}>
      <h1 className="dp-sr">Spot the drift</h1>
      {!locked && <TipStrip tip={tipFor('drift', session.count)} open={tipsOpen} onToggle={onToggleTips} />}
      <div className="dp-scene-top">
        <div className="dp-scene-brief">
          <p className="dp-scene-job">
            {layout.jobName} <span className="dp-count">{layout.grid.cols} columns · #{seed}</span>
          </p>
          <p className="dp-stage-prompt">{layout.brief}</p>
        </div>
        <div className="dp-scene-tools">
          <label className="dp-scene-select">
            <span className="dp-sr">Job</span>
            <select
              value={job ?? ''}
              disabled={locked}
              onChange={(e) => {
                setJob((e.target.value || undefined) as LayoutJob | undefined);
                setSeed(randomSeedCode());
                setSelected(-1);
              }}
            >
              <option value="">Any job</option>
              <option value="editorial">Magazine</option>
              <option value="dashboard">Dashboard</option>
              <option value="landing">Landing page</option>
              <option value="poster">Poster</option>
            </select>
          </label>
          <button type="button" className="dp-btn-secondary dp-scene-zoom" aria-pressed={zoom} onClick={() => setZoom((z) => !z)}>
            {zoom ? 'Fit' : 'Zoom'}
          </button>
          {!locked && (
            <button type="button" className="dp-toggle dp-lock" aria-label="Lock in answer" title="Lock in answer" onClick={lockIn}>
              <span className="dp-toggle-chip"><DpIcon name="lock" /></span>
            </button>
          )}
        </div>
      </div>
      <div ref={ref} className={`dp-scene-canvas${zoom ? ' dp-scene-canvas--zoom' : ''}`}>
        <div className="dp-scene-frame" style={{ width: layout.w * scale, height: layout.h * scale, ['--dp-inv' as string]: String(1 / scale) }}>
          <div
            className="dp-drift-page"
            role="group"
            aria-label={`${layout.jobName} layout`}
            style={{ width: layout.w, height: layout.h, background: p.bg, transform: `scale(${scale})` }}
            onPointerDown={() => !locked && setSelected(-1)}
          >
            {overlay && <GridOverlay layout={layout} />}
            {layout.blocks.map((b, i) => (
              <div
                key={i}
                className={`dp-drift-block dp-drift-block--${b.kind}${selected === i ? ' dp-drift-block--sel' : ''}`}
                style={{ left: b.x + shown[i * 2], top: b.y + shown[i * 2 + 1], width: b.w, height: b.h }}
                {...blockProps(i)}
              >
                <BlockArt b={b} p={p} />
              </div>
            ))}
            {overlay &&
              review &&
              layout.blocks.map((b, i) => {
                const hs = [review.handles[i * 2], review.handles[i * 2 + 1]];
                if (!hs.some((h) => h.scored || h.broken)) return null;
                const grade = worstGrade(hs.filter((h) => h.scored || h.broken));
                return (
                  <React.Fragment key={`m${i}`}>
                    <span className="dp-drift-ghost" style={{ left: b.x, top: b.y, width: b.w, height: b.h }} aria-hidden="true" />
                    <span
                      className={`dp-mark dp-mark--${grade} dp-drift-mark`}
                      style={{ left: b.x + values[i * 2], top: b.y + values[i * 2 + 1] }}
                      aria-hidden="true"
                    >
                      <span className="dp-mark-num">{i + 1}</span>
                    </span>
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      </div>
      {blockReview ? (
        <ReviewPanel
          review={blockReview}
          notes={notes}
          view={view}
          views={['yours', 'overlay', 'ideal']}
          onView={setView}
          onNext={next}
          onRetry={retry}
          labels={layout.labels}
          nextLabel="Next page"
          practice={practice}
          itemWord="blocks"
          extra={session.count ? `Session average ${avg} over ${session.count} ${session.count === 1 ? 'page' : 'pages'}. Best page ${best}.` : undefined}
        />
      ) : (
        <p className="dp-caption dp-scene-foot">
          A few blocks have drifted off the grid by a few pixels. Find them and put them back. Leave the rest where they are.
        </p>
      )}
    </main>
  );
};
