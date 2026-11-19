import React, { useMemo, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL03, gridColBounds, L03State, scoreL03 } from './scoring/foundationScoring';

export const L03Grids: React.FC<ExerciseComponentProps> = ({
  seed,
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

  React.useEffect(() => {
    setState({
      card1X: scenario.initialCard1.x,
      card1W: scenario.initialCard1.w,
      card2X: scenario.initialCard2.x,
      card2W: scenario.initialCard2.w,
      cardPad: scenario.initialPad,
    });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const c1RightDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onMove: ({ dx }) => {
      if (submitted) return;
      setState((s) => ({
        ...s,
        card1W: Math.max(140, Math.min(340, Math.round(s.card1W + dx * 0.7))),
      }));
    },
  });

  const c2LeftDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onMove: ({ dx }) => {
      if (submitted) return;
      setState((s) => {
        const nextX = Math.max(200, Math.min(420, Math.round(s.card2X + dx * 0.7)));
        const delta = nextX - s.card2X;
        return {
          ...s,
          card2X: nextX,
          card2W: Math.max(140, s.card2W - delta),
        };
      });
    },
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
        background: '#FFFFFF',
        color: '#141413',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-artboard)',
      }}
    >
      {/* 8-Column Proportional Stage */}
      <div style={{ position: 'relative', width: '100%', height: 290 }}>
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
                background: showGuides ? 'rgba(33, 110, 78, 0.08)' : 'rgba(217, 69, 38, 0.045)',
                borderLeft: '1px dashed rgba(20, 20, 19, 0.14)',
                borderRight: '1px dashed rgba(20, 20, 19, 0.14)',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Card 1 */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            bottom: 16,
            left: toPct(view.card1X),
            width: toPct(view.card1W),
            background: '#F7F6F2',
            borderRadius: 12,
            border: '1px solid rgba(20, 20, 19, 0.16)',
            padding: view.cardPad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#585650', letterSpacing: '0.07em' }}>
              {scenario.brief.eyebrow}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.18, marginTop: 6 }}>
              {scenario.brief.headline}
            </h3>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.45, color: '#585650' }}>
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
                right: -14,
                width: 28,
                cursor: 'ew-resize',
                display: 'grid',
                placeItems: 'center',
                zIndex: 10,
              }}
            >
              <div style={{ width: 5, height: 42, borderRadius: 999, background: '#141413' }} />
            </div>
          )}
        </div>

        {/* Card 2 */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            bottom: 16,
            left: toPct(view.card2X),
            width: toPct(view.card2W),
            background: '#141413',
            color: '#F7F6F2',
            borderRadius: 12,
            padding: view.cardPad,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, opacity: 0.65, letterSpacing: '0.07em' }}>
              {scenario.brief.metaTag}
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 19, lineHeight: 1.2, marginTop: 8 }}>
              Studio Notes
            </h4>
            <p style={{ fontSize: 12.5, lineHeight: 1.48, opacity: 0.82, marginTop: 8 }}>
              {scenario.brief.body}
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E26B52' }}>{scenario.brief.ctaLabel} →</span>

          {!submitted && (
            <div
              {...c2LeftDrag.bind}
              aria-label="Drag right card left edge"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -14,
                width: 28,
                cursor: 'ew-resize',
                display: 'grid',
                placeItems: 'center',
                zIndex: 10,
              }}
            >
              <div style={{ width: 5, height: 42, borderRadius: 999, background: '#D94526' }} />
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
              background: 'rgba(217, 69, 38, 0.16)',
              borderLeft: '1.5px solid #216E4E',
              borderRight: '1.5px solid #216E4E',
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
                color: '#216E4E',
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
      prompt="Pull both cards out of the center gutter so they align cleanly to 4-column spans, and snap card padding to the 8 px spacing scale."
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
