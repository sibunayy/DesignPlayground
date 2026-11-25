import React, { useMemo, useRef, useState } from 'react';
import { randomSeedCode } from '../../engine/prng';
import { buildScene, Genre, Scene as SceneData, sceneFont } from '../content/scenes';
import { useFontReady } from '../state/useFontReady';
import { kernNotes } from '../logic/notes';
import { reviewAnswer } from '../logic/scoring';
import { useElementWidth } from '../state/useElementWidth';
import { tipFor } from '../content/tips';
import { FinePopout } from './FinePopout';
import { TipStrip } from './TipStrip';
import { DpIcon } from './Icons';
import { KernWord } from './KernWord';
import { ReviewPanel, ReviewView } from './ReviewPanel';
import { useHandles } from './useHandles';

interface SceneProps {
  /** Best scene score so far. */
  best: number;
  onScored: (score: number) => void;
  tipsOpen: boolean;
  onToggleTips: () => void;
  /** Fixed seed for tests and shared links. A new one for each scene when not given. */
  initialSeed?: string;
}

const RANGE = { min: -300, max: 300 };
const FINE = { span: 60, step: 1 };

/** The work around the headline: a real layout drawn from shapes and copy, never an image. */
function Layout({ s, headline }: { s: SceneData; headline: React.ReactNode }) {
  const p = s.palette;
  const [a, b, c, d] = s.shapes;
  const sans = "'Inter Variable', 'Bricolage Grotesque Variable', sans-serif";
  const base: React.CSSProperties = { width: s.w, height: s.h, background: p.bg, color: p.ink, fontFamily: sans };
  switch (s.genre) {
    case 'poster':
      return (
        <div className="dp-art dp-art--poster" style={base}>
          <div className="dp-art-circle" style={{ background: p.accent, width: 420 + a * 160, height: 420 + a * 160, right: -120 + b * 80, top: 80 + c * 120 }} />
          <div className="dp-art-bar" style={{ background: p.ink, top: 640 + d * 40 }} />
          <p className="dp-art-kicker" style={{ left: 56, top: 56 }}>{s.copy.kicker}</p>
          <div className="dp-art-head" style={{ left: 48, top: 380 + d * 60 }}>{headline}</div>
          <div className="dp-art-info" style={{ left: 56, bottom: 120 }}>
            {s.copy.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          <p className="dp-art-small" style={{ left: 56, bottom: 56 }}>{s.copy.small}</p>
        </div>
      );
    case 'web':
      return (
        <div className="dp-art dp-art--web" style={base}>
          <div className="dp-art-nav" style={{ borderColor: p.soft }}>
            <span className="dp-art-logo" style={{ background: p.accent }} />
            <span className="dp-art-links">{['Features', 'Pricing', 'Docs', 'Sign in'].map((x) => <span key={x}>{x}</span>)}</span>
          </div>
          <p className="dp-art-pill" style={{ left: 80, top: 190, background: p.soft }}>{s.copy.kicker}</p>
          <div className="dp-art-head" style={{ left: 74, top: 250 }}>{headline}</div>
          <div className="dp-art-sub" style={{ left: 80, top: 260 + s.size * 1.25 }}>
            {s.copy.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          <span className="dp-art-btn" style={{ left: 80, top: 360 + s.size * 1.25, background: p.accent, color: p.bg }}>{s.copy.button}</span>
          <div className="dp-art-card" style={{ background: p.soft, transform: `rotate(${(a - 0.5) * 6}deg)` }}>
            <span style={{ background: p.accent, width: `${50 + b * 40}%` }} />
            <span style={{ background: p.ink, opacity: 0.15, width: `${40 + c * 50}%` }} />
            <span style={{ background: p.ink, opacity: 0.15, width: `${30 + d * 50}%` }} />
          </div>
        </div>
      );
    case 'magazine':
      return (
        <div className="dp-art dp-art--mag" style={base}>
          <div className="dp-art-photo" style={{ background: `radial-gradient(circle at ${30 + a * 40}% ${40 + b * 30}%, ${p.accent}, ${p.soft} 55%, ${p.bg})` }} />
          <div className="dp-art-head dp-art-head--center" style={{ top: 40 }}>{headline}</div>
          <p className="dp-art-small" style={{ right: 48, top: 40 + s.size * 1.05 }}>{s.copy.kicker} · {s.copy.small}</p>
          <div className="dp-art-lines" style={{ left: 48, bottom: 80 }}>
            {s.copy.lines.map((l, i) => <p key={l} style={{ fontSize: i === 0 ? 44 : 26 }}>{l}</p>)}
          </div>
        </div>
      );
    case 'book':
      return (
        <div className="dp-art dp-art--book" style={base}>
          <div className="dp-art-frame" style={{ borderColor: p.accent }} />
          <p className="dp-art-kicker dp-art-kicker--center" style={{ top: 140 }}>{s.copy.kicker}</p>
          <div className="dp-art-head dp-art-head--center" style={{ top: 300 + a * 80 }}>{headline}</div>
          <div className="dp-art-rule" style={{ background: p.accent, top: 320 + a * 80 + s.size * 1.2 }} />
          <div className="dp-art-quote" style={{ top: 380 + a * 80 + s.size * 1.2 }}>
            {s.copy.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          <p className="dp-art-author" style={{ bottom: 110 }}>{s.copy.small}</p>
        </div>
      );
    case 'sign':
    default:
      return (
        <div className="dp-art dp-art--sign" style={{ ...base, background: p.soft }}>
          <div className="dp-art-board" style={{ background: p.bg, borderColor: p.ink }}>
            <p className="dp-art-kicker dp-art-kicker--center" style={{ top: 70 }}>{s.copy.kicker}</p>
            <div className="dp-art-head dp-art-head--center" style={{ top: 170 }}>{headline}</div>
            <p className="dp-art-small dp-art-small--center" style={{ bottom: 70, color: p.accent }}>{s.copy.small}</p>
          </div>
          <div className="dp-art-awning">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ background: i % 2 ? p.bg : p.accent }} />)}</div>
        </div>
      );
  }
}

/**
 * The real-world work area. A headline sits in a full layout with its kerning off.
 * Fix the broken pairs, leave the good ones, lock in, then read the overlay and the notes.
 */
export const SceneWork: React.FC<SceneProps> = ({ best, onScored, initialSeed, tipsOpen, onToggleTips }) => {
  const [seed, setSeed] = useState(() => initialSeed ?? randomSeedCode());
  const [genre, setGenre] = useState<Genre | undefined>(undefined);
  const ready = useFontReady(sceneFont(seed, genre));
  const scene = useMemo(() => buildScene(seed, genre), [seed, genre, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const [edit, setEdit] = useState<{ seed: string; vals: number[] }>({ seed: '', vals: [] });
  const values = edit.seed === seed ? edit.vals : scene.start;
  const [selected, setSelected] = useState(0);
  const [fineOpen, setFineOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [view, setView] = useState<ReviewView>('overlay');
  const [practice, setPractice] = useState(false);
  const [session, setSession] = useState({ count: 0, total: 0 });

  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref, 800);
  const [zoom, setZoom] = useState(false);
  // While the review shows, the artwork shrinks so the score and notes fit on the same screen.
  const room = typeof window !== 'undefined' ? window.innerHeight - 250 - (locked ? 300 : tipsOpen ? 96 : 48) : 600;
  const fit = Math.min(1, (width - 8) / scene.w, Math.max(260, room) / scene.h);
  // Zoom shows the artwork at its full size, the way a designer zooms in to kern.
  const scale = zoom ? Math.max(1, fit * 2) : fit;

  const setValue = (i: number, v: number) =>
    setEdit((prev) => ({ seed, vals: (prev.seed === seed ? prev.vals : scene.start).map((x, k) => (k === i ? v : x)) }));
  const bindLive = useHandles(values, RANGE.min, RANGE.max, setValue, setSelected, locked ? -1 : selected);
  const bind: typeof bindLive = locked
    ? (i, o) => ({ ...bindLive(i, o), onPointerDown: undefined, onPointerMove: undefined, onKeyDown: undefined } as unknown as ReturnType<typeof bindLive>)
    : bindLive;

  const review = useMemo(() => (locked ? reviewAnswer(values, scene.start, scene.targets) : null), [locked, values, scene]);
  const notes = useMemo(() => (review ? kernNotes(review, scene.pairs) : []), [review, scene]);
  const ideal = scene.targets.map((t) => (t.lo + t.hi) / 2);

  const lockIn = () => {
    const r = reviewAnswer(values, scene.start, scene.targets);
    setLocked(true);
    setView('overlay');
    setFineOpen(false);
    if (!practice) {
      setSession((s) => ({ count: s.count + 1, total: s.total + r.score }));
      onScored(r.score);
    }
  };
  const next = () => {
    setSeed(randomSeedCode());
    setLocked(false);
    setPractice(false);
    setSelected(0);
  };
  const retry = () => {
    setEdit({ seed, vals: scene.start });
    setLocked(false);
    setPractice(true);
  };

  const perPx = 1000 / (scene.size * scale);
  const headline = (
    <KernWord
      letters={scene.letters}
      gapHandle={scene.gapHandle}
      values={view === 'ideal' && locked ? ideal : values}
      fontSize={scene.size}
      font={scene.font}
      bind={bind as never}
      perPx={perPx}
      anchor={`${seed}:${genre ?? ''}:${scene.start.join(',')}`}
      labels={scene.labels}
      step={1}
      ghost={locked && view === 'overlay' ? ideal : undefined}
      marks={locked && view === 'overlay' ? review?.handles : undefined}
      label={`Headline: ${scene.headline}`}
      className="dp-kw--scene"
      style={{ color: scene.palette.ink }}
    />
  );

  const avg = session.count ? Math.round(session.total / session.count) : 0;
  return (
    <main className={`dp-scene${locked ? ' dp-scene--locked' : ''}`}>
      <h1 className="dp-sr">Kerning on the page</h1>
      {!locked && <TipStrip tip={tipFor('scene', session.count)} open={tipsOpen} onToggle={onToggleTips} />}
      <div className="dp-scene-top">
        <div className="dp-scene-brief">
          <p className="dp-scene-job">
            {scene.job} <span className="dp-count">{scene.font.name} · #{seed}</span>
          </p>
          <p className="dp-stage-prompt">{scene.brief}</p>
        </div>
        <div className="dp-scene-tools">
          <label className="dp-scene-select">
            <span className="dp-sr">Job</span>
            <select
              value={genre ?? ''}
              disabled={locked}
              onChange={(e) => {
                setGenre((e.target.value || undefined) as Genre | undefined);
                setSeed(randomSeedCode());
              }}
            >
              <option value="">Any job</option>
              <option value="poster">Poster</option>
              <option value="web">Website</option>
              <option value="magazine">Magazine</option>
              <option value="book">Book</option>
              <option value="sign">Sign</option>
            </select>
          </label>
          <button type="button" className="dp-btn-secondary dp-scene-zoom" aria-pressed={zoom} onClick={() => setZoom((z) => !z)}>
            {zoom ? 'Fit' : 'Zoom'}
          </button>
          {!locked && (
            <>
              <button type="button" className="dp-toggle" aria-pressed={fineOpen} aria-label="Fine control" title="Fine control" onClick={() => setFineOpen((o) => !o)}>
                <span className="dp-toggle-chip"><DpIcon name="fine" /></span>
              </button>
              <button type="button" className="dp-toggle dp-lock" aria-label="Lock in answer" title="Lock in answer" onClick={lockIn}>
                <span className="dp-toggle-chip"><DpIcon name="lock" /></span>
              </button>
            </>
          )}
        </div>
      </div>
      <div ref={ref} className={`dp-scene-canvas${zoom ? ' dp-scene-canvas--zoom' : ''}`}>
        <div
          className="dp-scene-frame"
          style={{ width: scene.w * scale, height: scene.h * scale, ['--dp-inv' as string]: String(1 / scale) }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
            <Layout s={scene} headline={headline} />
          </div>
        </div>
      </div>
      {fineOpen && !locked && (
        <FinePopout
          label={scene.labels[selected] ?? scene.labels[0]}
          value={values[selected] ?? 0}
          min={RANGE.min}
          max={RANGE.max}
          fine={FINE}
          onChange={(v) => setValue(selected, v)}
        />
      )}
      {review ? (
        <ReviewPanel
          review={review}
          notes={notes}
          view={view}
          views={['yours', 'overlay', 'ideal']}
          onView={setView}
          onNext={next}
          onRetry={retry}
          labels={scene.pairs.map(([l, r]) => `${l}${r}`)}
          nextLabel="Next job"
          practice={practice}
          extra={session.count ? `Session average ${avg} over ${session.count} ${session.count === 1 ? 'job' : 'jobs'}. Best job ${best}.` : undefined}
        />
      ) : (
        <p className="dp-caption dp-scene-foot">
          Kerning is off in this file and some pairs were moved by hand. Fix the broken pairs. Leave the right ones alone.
        </p>
      )}
    </main>
  );
};
