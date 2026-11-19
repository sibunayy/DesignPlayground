import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ActiveSnapLine, SnapGuideOverlay } from '../components/StudioShell/SnapGuideOverlay';
import { SnapTarget, snapValue } from '../engine/snapEngine';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL03, gridColBounds, L03State, scoreL03 } from './scoring/foundationScoring';

export const L03Grids: React.FC<ExerciseComponentProps> = ({
  seed,
  styleWorld,
  styleRef,
  availableLenses,
  activeLenses,
  onToggleLens,
  railSide,
  onComplete,
  onNewSeed,
  onNextLesson,
  nextLabel,
}) => {
  const scenario = useMemo(() => generateL03(seed), [seed]);
  const [state, setState] = useState<L03State>(() => ({
    card1X: scenario.initialCard1.x,
    card1W: scenario.initialCard1.w,
    card2X: scenario.initialCard2.x,
    card2W: scenario.initialCard2.w,
    cardPad: scenario.initialPad,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [activeSnaps, setActiveSnaps] = useState<ActiveSnapLine[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const rawC1WRef = useRef(scenario.initialCard1.w);
  const rawC2XRef = useRef(scenario.initialCard2.x);

  const colRightTargets = useMemo<SnapTarget[]>(
    () =>
      Array.from({ length: scenario.columns }, (_, col) => ({
        value: (col + 1) * scenario.colWidth + col * scenario.gutter,
        label: `C${col + 1} edge`,
        kind: 'column',
      })),
    [scenario.colWidth, scenario.columns, scenario.gutter]
  );

  const colLeftTargets = useMemo<SnapTarget[]>(
    () =>
      Array.from({ length: scenario.columns }, (_, col) => ({
        value: col * (scenario.colWidth + scenario.gutter),
        label: `C${col + 1} start`,
        kind: 'column',
      })),
    [scenario.colWidth, scenario.columns, scenario.gutter]
  );

  React.useEffect(() => {
    setState({
      card1X: scenario.initialCard1.x,
      card1W: scenario.initialCard1.w,
      card2X: scenario.initialCard2.x,
      card2W: scenario.initialCard2.w,
      cardPad: scenario.initialPad,
    });
    rawC1WRef.current = scenario.initialCard1.w;
    rawC2XRef.current = scenario.initialCard2.x;
    setActiveSnaps([]);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const c1RightDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onStart: () => {
      rawC1WRef.current = stateRef.current.card1W;
    },
    onMove: ({ dx }) => {
      if (submitted) return;
      rawC1WRef.current = Math.max(140, Math.min(340, rawC1WRef.current + dx * 0.85));
      const rawRightEdge = stateRef.current.card1X + rawC1WRef.current;
      const snapEdge = snapValue(rawRightEdge, colRightTargets, 11);
      const nextW = Math.max(140, Math.min(340, Math.round(snapEdge.value - stateRef.current.card1X)));
      setActiveSnaps(
        snapEdge.snapped
          ? [
              {
                axis: 'x',
                pos: `${((stateRef.current.card1X + nextW) / 560) * 100}%`,
                label: snapEdge.target?.label,
                kind: 'column',
              },
            ]
          : []
      );
      setState((s) => ({
        ...s,
        card1W: nextW,
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const c2LeftDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onStart: () => {
      rawC2XRef.current = stateRef.current.card2X;
    },
    onMove: ({ dx }) => {
      if (submitted) return;
      rawC2XRef.current = Math.max(200, Math.min(420, rawC2XRef.current + dx * 0.85));
      const snapX = snapValue(rawC2XRef.current, colLeftTargets, 11);
      const nextX = Math.max(200, Math.min(420, Math.round(snapX.value)));
      setActiveSnaps(
        snapX.snapped
          ? [
              {
                axis: 'x',
                pos: `${(nextX / 560) * 100}%`,
                label: snapX.target?.label,
                kind: 'column',
              },
            ]
          : []
      );
      setState((s) => {
        const delta = nextX - s.card2X;
        return {
          ...s,
          card2X: nextX,
          card2W: Math.max(140, s.card2W - delta),
        };
      });
    },
    onEnd: () => setActiveSnaps([]),
  });

  const handleSubmit = () => {
    const res = scoreL03(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      card1X: scenario.initialCard1.x,
      card1W: scenario.initialCard1.w,
      card2X: scenario.initialCard2.x,
      card2W: scenario.initialCard2.w,
      cardPad: scenario.initialPad,
    });
    setSubmitted(false);
    setResult(null);
  };

  const t1 = gridColBounds(0, 4, scenario.colWidth, scenario.gutter);
  const t2 = gridColBounds(4, 4, scenario.colWidth, scenario.gutter);

  const view =
    submitted && overlayMode === 'target'
      ? { card1X: t1.x, card1W: t1.w, card2X: t2.x, card2W: t2.w, cardPad: 24 }
      : state;

  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const gridTotalW = 560;
  const toPct = (px: number) => `${(px / gridTotalW) * 100}%`;

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#FAF9F6',
        color: '#111111',
        borderRadius: 2,
        border: '1px solid #111111',
        padding: 24,
        boxShadow: 'var(--shadow-artboard)',
      }}
    >
      {/* Swiss Column Index Ruler */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 18,
          marginBottom: 6,
          borderBottom: '1px solid rgba(17,17,17,0.2)',
        }}
      >
        {Array.from({ length: scenario.columns }).map((_, col) => {
          const left = col * (scenario.colWidth + scenario.gutter);
          return (
            <span
              key={col}
              className="tabular"
              style={{
                position: 'absolute',
                left: toPct(left),
                width: toPct(scenario.colWidth),
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: '#525252',
              }}
            >
              C{col + 1}
            </span>
          );
        })}
      </div>

      {/* 8-Column Proportional Stage */}
      <div style={{ position: 'relative', width: '100%', minHeight: 280, height: 290 }}>
        {!submitted && <SnapGuideOverlay lines={activeSnaps} />}
        {/* Underlying Column + Gutter Overlay */}
        {Array.from({ length: scenario.columns }).map((_, col) => {
          const left = col * (scenario.colWidth + scenario.gutter);
          return (
            <div
              key={col}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: toPct(left),
                width: toPct(scenario.colWidth),
                background: showGuides ? 'rgba(21, 115, 71, 0.08)' : 'rgba(29, 78, 216, 0.045)',
                borderLeft: '1px dashed rgba(17, 17, 17, 0.16)',
                borderRight: '1px dashed rgba(17, 17, 17, 0.16)',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Card 1 — Swiss Graphic Poster Block */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            bottom: 14,
            left: toPct(view.card1X),
            width: toPct(view.card1W),
            background: '#FFFFFF',
            borderRadius: 0,
            border: '1.5px solid #111111',
            padding: view.cardPad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#C83226' }}>
              {scenario.brief.client}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-grotesk)',
                fontSize: 'clamp(14px, 3.6vw, 22px)',
                lineHeight: 1.12,
                marginTop: 6,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {scenario.brief.headline}
            </h3>
          </div>
          <p style={{ fontSize: 'clamp(10.5px, 2.5vw, 12.5px)', lineHeight: 1.45, color: '#444444' }}>
            {scenario.brief.subhead}
          </p>

          {!submitted && (
            <div
              {...c1RightDrag.bind}
              aria-label="Drag left card right edge"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: -19,
                width: 38,
                cursor: 'ew-resize',
                display: 'grid',
                placeItems: 'center',
                zIndex: 10,
              }}
            >
              <div style={{ width: 5, height: 46, borderRadius: 2, background: c1RightDrag.isDragging ? '#0EA5E9' : '#111111' }} />
            </div>
          )}
        </div>

        {/* Card 2 — Bold Cobalt Swiss Block */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            bottom: 14,
            left: toPct(view.card2X),
            width: toPct(view.card2W),
            background: '#1E3A8A',
            color: '#FFFFFF',
            borderRadius: 0,
            padding: view.cardPad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="tabular" style={{ fontSize: 11, opacity: 0.78 }}>
              {scenario.brief.metaTag}
            </div>
            <h4 style={{ fontFamily: 'var(--font-grotesk)', fontSize: 'clamp(13px, 3.2vw, 19px)', lineHeight: 1.18, marginTop: 8, fontWeight: 600 }}>
              Exhibition Notes
            </h4>
            <p style={{ fontSize: 'clamp(10.5px, 2.5vw, 12.5px)', lineHeight: 1.48, opacity: 0.88, marginTop: 8 }}>
              {scenario.brief.body}
            </p>
          </div>
          <span style={{ fontSize: 'clamp(11px, 2.5vw, 12.5px)', fontWeight: 600, textDecoration: 'underline' }}>{scenario.brief.ctaLabel}</span>

          {!submitted && (
            <div
              {...c2LeftDrag.bind}
              aria-label="Drag right card left edge"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -19,
                width: 38,
                cursor: 'ew-resize',
                display: 'grid',
                placeItems: 'center',
                zIndex: 10,
              }}
            >
              <div style={{ width: 5, height: 46, borderRadius: 2, background: c2LeftDrag.isDragging ? '#0EA5E9' : '#C83226' }} />
            </div>
          )}
        </div>

        {/* Center Gutter Target Ghost Overlay */}
        {showGuides && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: toPct(t1.w),
              width: toPct(scenario.gutter),
              background: 'rgba(200, 50, 38, 0.16)',
              borderLeft: '1.5px solid #157347',
              borderRight: '1.5px solid #157347',
              pointerEvents: 'none',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                writingMode: 'vertical-rl',
                fontSize: 10,
                fontWeight: 700,
                color: '#157347',
                letterSpacing: '0.08em',
              }}
            >
              EMPTY 16PX GUTTER
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Left Card Left Offset"
        value={state.card1X}
        min={0}
        max={24}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, card1X: v }))}
        hint="0 px aligns flush with Column 1."
      />
      <SliderControl
        label="Left Card Width"
        value={state.card1W}
        min={200}
        max={320}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, card1W: v }))}
        hint={`4 columns = ${t1.w} px.`}
      />
      <SliderControl
        label="Right Card Start X"
        value={state.card2X}
        min={240}
        max={340}
        unit=" px"
        onChange={(v) => {
          const delta = v - state.card2X;
          setState((s) => ({ ...s, card2X: v, card2W: Math.max(160, s.card2W - delta) }));
        }}
        hint={`Column 5 starts at ${t2.x} px.`}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Inner Card Padding Token</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[13, 16, 24, 32].map((tok) => (
            <button
              key={tok}
              type="button"
              onClick={() => setState((s) => ({ ...s, cardPad: tok }))}
              className="tabular"
              style={{
                minHeight: 36,
                borderRadius: 8,
                border: '1px solid var(--rule-strong)',
                background: state.cardPad === tok ? 'var(--ink-primary)' : 'var(--bg-surface)',
                color: state.cardPad === tok ? 'var(--bg-surface)' : 'var(--ink-primary)',
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              {tok}px
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <StudioFrame
      prompt="Pull both blocks out of the center gutter so they snap to 4-column tracks, and quantize card padding to the 8 px spacing scale."
      styleWorld={styleWorld}
      styleRef={styleRef}
      availableLenses={availableLenses}
      activeLenses={activeLenses}
      onToggleLens={onToggleLens}
      submitted={submitted}
      result={result}
      overlayMode={overlayMode}
      onChangeOverlayMode={setOverlayMode}
      onSubmit={handleSubmit}
      onRetry={handleRetry}
      onNewSeed={onNewSeed}
      onNextLesson={onNextLesson}
      nextLabel={nextLabel}
      railSide={railSide}
      isPenActive={c1RightDrag.isPenActive || c2LeftDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
