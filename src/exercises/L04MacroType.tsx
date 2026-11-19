import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ActiveSnapLine, SnapGuideOverlay } from '../components/StudioShell/SnapGuideOverlay';
import { snapValue, stepTargets } from '../engine/snapEngine';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { estimateCharsPerLine, generateL04, L04State, scoreL04 } from './scoring/foundationScoring';

export const L04MacroType: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL04(seed), [seed]);
  const [state, setState] = useState<L04State>(() => ({
    fontSize: scenario.initialFontSize,
    leading: scenario.initialLeading,
    measurePx: scenario.initialMeasurePx,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [activeSnaps, setActiveSnaps] = useState<ActiveSnapLine[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const rawMeasureRef = useRef(scenario.initialMeasurePx);
  const rawLeadingRef = useRef(scenario.initialLeading);

  React.useEffect(() => {
    setState({
      fontSize: scenario.initialFontSize,
      leading: scenario.initialLeading,
      measurePx: scenario.initialMeasurePx,
    });
    rawMeasureRef.current = scenario.initialMeasurePx;
    rawLeadingRef.current = scenario.initialLeading;
    setActiveSnaps([]);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const measureDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onStart: () => {
      rawMeasureRef.current = stateRef.current.measurePx;
    },
    onMove: ({ dx }) => {
      if (submitted) return;
      rawMeasureRef.current = Math.max(240, Math.min(660, rawMeasureRef.current + dx));
      const snapM = snapValue(rawMeasureRef.current, stepTargets(240, 660, 20, 'edge', 'px'), 6);
      const nextM = Math.round(snapM.value);
      setActiveSnaps(
        snapM.snapped
          ? [{ axis: 'x', pos: '100%', label: `${nextM}px`, kind: 'edge' }]
          : []
      );
      setState((s) => ({
        ...s,
        measurePx: nextM,
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const leadingDrag = useStudioPointer({
    penPrecisionScale: 0.65,
    onStart: () => {
      rawLeadingRef.current = stateRef.current.leading;
    },
    onMove: ({ dy }) => {
      if (submitted) return;
      rawLeadingRef.current = Math.max(1.05, Math.min(1.95, rawLeadingRef.current + dy * 0.005));
      const snapL = snapValue(rawLeadingRef.current, stepTargets(1.05, 1.95, 0.05, 'grid', '×'), 0.018);
      setState((s) => ({
        ...s,
        leading: Number(snapL.value.toFixed(2)),
      }));
    },
  });

  const handleSubmit = () => {
    const res = scoreL04(state);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      fontSize: scenario.initialFontSize,
      leading: scenario.initialLeading,
      measurePx: scenario.initialMeasurePx,
    });
    setSubmitted(false);
    setResult(null);
  };

  const view =
    submitted && overlayMode === 'target'
      ? {
          fontSize: scenario.targetFontSize,
          leading: scenario.targetLeading,
          measurePx: scenario.targetMeasurePx,
        }
      : state;

  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');
  const idealMinPx = Math.round(45 * view.fontSize * 0.49);
  const idealMaxPx = Math.round(75 * view.fontSize * 0.49);
  const chars = estimateCharsPerLine(view.measurePx, view.fontSize);

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: 'linear-gradient(90deg, #EBE5D8 0px, #FBF9F4 22px)',
        color: '#191815',
        borderRadius: 6,
        border: '1px solid rgba(25, 24, 21, 0.14)',
        padding: 'clamp(16px, 4vw, 34px)',
        boxShadow: 'var(--shadow-artboard)',
        position: 'relative',
        overflowX: 'auto',
      }}
    >
      {/* Stripe Press Running Folio Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: 10,
          marginBottom: 18,
          borderBottom: '1px solid rgba(25,24,21,0.12)',
          fontSize: 11.5,
          color: '#6C665B',
        }}
      >
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-editorial)' }}>
          Stripe Press Essay Specimen
        </span>
        <span className="tabular">p. 42</span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: 28, lineHeight: 1.14, marginBottom: 16, fontWeight: 500 }}>
        {scenario.specimen.title}
      </h3>

      {/* Editable Prose Column */}
      <div
        {...leadingDrag.bind}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: view.measurePx,
          borderRight: submitted ? '1px solid rgba(25,24,21,0.14)' : '2px dashed rgba(29, 78, 216, 0.45)',
          paddingRight: 18,
          cursor: submitted ? 'default' : 'ns-resize',
        }}
      >
        {!submitted && <SnapGuideOverlay lines={activeSnaps} />}
        {leadingDrag.isDragging && !submitted && (
          <span
            className="tabular"
            style={{
              position: 'absolute',
              right: 8,
              top: -12,
              fontSize: 10.5,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 4,
              background: '#0EA5E9',
              color: '#FFFFFF',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            Leading {view.leading.toFixed(2)}×
          </span>
        )}
        {showGuides && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: idealMinPx,
              width: Math.max(20, idealMaxPx - idealMinPx),
              background: 'rgba(21, 115, 71, 0.1)',
              borderLeft: '1.5px dashed #157347',
              borderRight: '1.5px dashed #157347',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: -22,
                left: 6,
                fontSize: 10.5,
                fontWeight: 600,
                color: '#157347',
                whiteSpace: 'nowrap',
              }}
            >
              45–75 ch zone (yours: ~{chars} ch)
            </span>
          </div>
        )}

        {scenario.specimen.paragraphs.map((p, idx) => (
          <p
            key={idx}
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: view.fontSize,
              lineHeight: view.leading,
              color: '#23211E',
              marginBottom: idx === 0 ? `${view.fontSize * 0.9}px` : 0,
            }}
          >
            {p}
          </p>
        ))}

        {/* Right Edge Measure Drag Handle */}
        {!submitted && (
          <div
            {...measureDrag.bind}
            aria-label="Drag column width"
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
            <div style={{ width: 5, height: 48, borderRadius: 3, background: measureDrag.isDragging ? '#0EA5E9' : '#1D4ED8' }} />
          </div>
        )}
      </div>
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Body Font Size"
        value={state.fontSize}
        min={12}
        max={22}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, fontSize: v }))}
        hint="Recommended screen floor: 16 px+"
      />
      <SliderControl
        label="Line Height (Leading)"
        value={Math.round(state.leading * 100)}
        min={105}
        max={190}
        step={5}
        unit="%"
        onChange={(v) => setState((s) => ({ ...s, leading: Number((v / 100).toFixed(2)) }))}
        hint="Target 140–165% for screen body prose"
      />
      <SliderControl
        label="Column Width (Measure)"
        value={state.measurePx}
        min={240}
        max={660}
        step={10}
        formatValue={(v) => `${v} px (~${estimateCharsPerLine(v, state.fontSize)} ch)`}
        onChange={(v) => setState((s) => ({ ...s, measurePx: v }))}
      />
    </>
  );

  return (
    <StudioFrame
      prompt="Drag the right edge to tame line width (45–75 chars), drag vertically on the copy to open line leading (140–165%), and verify body size in Fine Sliders."
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
      isPenActive={measureDrag.isPenActive || leadingDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
