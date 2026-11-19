import React, { useMemo, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL13, L13State, scoreL13 } from './scoring/challengeScoring';

export const L13PrintPrepress: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL13(seed), [seed]);
  const [state, setState] = useState<L13State>(() => ({
    bleedMm: scenario.initialBleedMm,
    safeMm: scenario.initialSafeMm,
    richBlackSmallText: scenario.initialRichBlackSmallText,
    lowResLogo: scenario.initialLowResLogo,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  // Post-submit interactive guillotine cut drift simulator (-0.5 .. +0.5 mm)
  const [cutDriftMm, setCutDriftMm] = useState(0.5);

  React.useEffect(() => {
    setState({
      bleedMm: scenario.initialBleedMm,
      safeMm: scenario.initialSafeMm,
      richBlackSmallText: scenario.initialRichBlackSmallText,
      lowResLogo: scenario.initialLowResLogo,
    });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
    setCutDriftMm(0.5);
  }, [scenario]);

  const bleedDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onMove: ({ dx }) => {
      if (submitted) return;
      setState((s) => ({
        ...s,
        bleedMm: Number(Math.max(0, Math.min(4, s.bleedMm - dx * 0.05)).toFixed(1)),
      }));
    },
  });

  const safeDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onMove: ({ dx }) => {
      if (submitted) return;
      setState((s) => ({
        ...s,
        safeMm: Number(Math.max(0, Math.min(6, s.safeMm + dx * 0.06)).toFixed(1)),
      }));
    },
  });

  const handleSubmit = () => {
    const res = scoreL13(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      bleedMm: scenario.initialBleedMm,
      safeMm: scenario.initialSafeMm,
      richBlackSmallText: scenario.initialRichBlackSmallText,
      lowResLogo: scenario.initialLowResLogo,
    });
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const view: L13State = showTarget
    ? {
        bleedMm: scenario.targetBleedMm,
        safeMm: scenario.targetSafeMm,
        richBlackSmallText: false,
        lowResLogo: false,
      }
    : state;

  // 1 mm = 8 px on press preview sheet
  const pxPerMm = 8;
  const sheetPad = 24;
  const bleedPx = view.bleedMm * pxPerMm;
  const safePx = view.safeMm * pxPerMm;
  const driftPx = showGuides ? cutDriftMm * pxPerMm * 1.4 : 0;

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#EAE7DF',
        color: '#141413',
        borderRadius: 16,
        padding: sheetPad,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Interactive Press Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          height: 310,
          margin: '0 auto',
          background: '#FFFFFF',
          border: '1px dashed rgba(20, 20, 19, 0.25)',
        }}
      >
        {/* Dark Background Artwork Panel extending by bleedPx beyond trim (sheetPad = 24 = 3mm) */}
        <div
          style={{
            position: 'absolute',
            top: 24 - bleedPx,
            bottom: 24 - bleedPx,
            left: 24 - bleedPx,
            width: `calc(46% + ${bleedPx}px)`,
            background: '#22211F',
            color: '#F7F6F2',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 18,
          }}
        >
          <span style={{ fontSize: 11, opacity: 0.72, letterSpacing: '0.07em' }}>
            BLEED: {view.bleedMm.toFixed(1)} MM
          </span>

          {!submitted && (
            <div
              {...bleedDrag.bind}
              aria-label="Drag artwork edge outward to bleed"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -12,
                width: 24,
                cursor: 'ew-resize',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div style={{ width: 5, height: 42, borderRadius: 999, background: '#D94526' }} />
            </div>
          )}
        </div>

        {/* Right Typography & Press Assets */}
        <div
          {...safeDrag.bind}
          style={{
            position: 'absolute',
            top: 24 + safePx,
            bottom: 24 + safePx,
            left: '51%',
            right: 24 + safePx,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: submitted ? 'default' : 'ew-resize',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#848179', letterSpacing: '0.07em' }}>
              {scenario.client.toUpperCase()}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.15, marginTop: 4 }}>
              {scenario.headline}
            </h3>

            {/* Small 9pt black body text: Rich black shows CMYK halo on press drift! */}
            <button
              type="button"
              disabled={submitted}
              onClick={() => setState((s) => ({ ...s, richBlackSmallText: !s.richBlackSmallText }))}
              style={{
                marginTop: 12,
                textAlign: 'left',
                padding: 8,
                borderRadius: 6,
                background: 'rgba(20,20,19,0.03)',
                border: '1px dashed rgba(20,20,19,0.18)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.45,
                  color: '#141413',
                  textShadow:
                    view.richBlackSmallText && (showGuides || !submitted)
                      ? '0.6px 0.3px 0 rgba(0, 174, 239, 0.55), -0.6px -0.3px 0 rgba(236, 0, 140, 0.5)'
                      : 'none',
                }}
              >
                Opening preview reception runs 18:00–21:00. All lecture seating reserved via archive pass.
              </p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  color: view.richBlackSmallText ? '#D94526' : '#216E4E',
                }}
              >
                Ink: {view.richBlackSmallText ? '4-Color Rich Black (Tap → 100% K)' : '100% K Only ✓'}
              </span>
            </button>
          </div>

          {/* Logo Asset Toggle (72 DPI fuzzy raster vs crisp Vector) */}
          <button
            type="button"
            disabled={submitted}
            onClick={() => setState((s) => ({ ...s, lowResLogo: !s.lowResLogo }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 6,
              background: '#FAF9F5',
              border: '1px solid rgba(20,20,19,0.14)',
              alignSelf: 'flex-start',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ filter: view.lowResLogo ? 'blur(0.75px)' : 'none' }}
            >
              <rect x="3" y="3" width="18" height="18" fill="none" stroke="#141413" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="3.5" fill="#D94526" />
            </svg>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: view.lowResLogo ? '#D94526' : '#216E4E',
              }}
            >
              {view.lowResLogo ? '72 DPI JPG Logo (Tap → Vector)' : 'Vector SVG Mark ✓'}
            </span>
          </button>
        </div>

        {/* Physical Trim Line + Interactive Guillotine Drift Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            transform: `translate(${driftPx}px, ${driftPx * 0.5}px)`,
            border: '2px solid #141413',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -18,
              right: 0,
              fontSize: 10,
              fontWeight: 700,
              color: '#141413',
            }}
          >
            TRIM LINE {showGuides ? `(Cut Drift ${cutDriftMm > 0 ? '+' : ''}${cutDriftMm.toFixed(1)} mm)` : ''}
          </span>
        </div>

        {/* Safe Margin Guide */}
        {showGuides && (
          <div
            style={{
              position: 'absolute',
              inset: 24 + scenario.targetSafeMm * pxPerMm,
              border: '1.5px dashed #216E4E',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Post-Submit Interactive Guillotine Simulator */}
      {submitted && (
        <div
          style={{
            maxWidth: 520,
            width: '100%',
            margin: '0 auto',
            padding: '12px 16px',
            borderRadius: 10,
            background: '#FFFFFF',
            border: '1px solid rgba(20,20,19,0.12)',
          }}
        >
          <SliderControl
            label="Guillotine Press Cut-Drift Simulator"
            value={cutDriftMm}
            min={-0.5}
            max={0.5}
            step={0.1}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} mm`}
            onChange={setCutDriftMm}
            hint="Test how ±0.5 mm stack drift reveals white paper slivers if bleed is missing."
          />
        </div>
      )}
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Outer Artwork Bleed"
        value={state.bleedMm}
        min={0}
        max={4}
        step={0.5}
        unit=" mm"
        onChange={(v) => setState((s) => ({ ...s, bleedMm: v }))}
        hint="Standard sheet print requires 3.0 mm bleed past trim."
      />
      <SliderControl
        label="Text Safe Zone Inset"
        value={state.safeMm}
        min={0}
        max={6}
        step={0.5}
        unit=" mm"
        onChange={(v) => setState((s) => ({ ...s, safeMm: v }))}
        hint="Keep copy 3.5–5.0 mm inside trim."
      />
    </>
  );

  return (
    <StudioFrame
      prompt="Pull the dark background outward to 3 mm bleed, move type inward to a 4 mm safe margin, switch small black text to 100% K, and replace the blurry 72 DPI logo."
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
      isPenActive={bleedDrag.isPenActive || safeDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
