import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ActiveSnapLine, SnapGuideOverlay } from '../components/StudioShell/SnapGuideOverlay';
import { snapValue } from '../engine/snapEngine';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL07, L07State, scoreL07 } from './scoring/buildingScoring';

export const L07MicroType: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL07(seed), [seed]);
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [state, setState] = useState<L07State>(() => ({
    offsets: scenario.mode === 'kern' ? [...scenario.initialOffsets] : [0],
    capsTracking: scenario.mode === 'tracking-margin' ? scenario.initialCapsTracking : 0,
    bodyTracking: scenario.mode === 'tracking-margin' ? scenario.initialBodyTracking : 0,
    hangPct: scenario.mode === 'tracking-margin' ? scenario.initialHangPct : 0,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [activeSnaps, setActiveSnaps] = useState<ActiveSnapLine[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedIdxRef = useRef(selectedIdx);
  selectedIdxRef.current = selectedIdx;
  const rawOffsetRef = useRef(0);
  const rawHangRef = useRef(scenario.mode === 'tracking-margin' ? scenario.initialHangPct : 0);

  React.useEffect(() => {
    setSelectedIdx(1);
    selectedIdxRef.current = 1;
    setState({
      offsets: scenario.mode === 'kern' ? [...scenario.initialOffsets] : [0],
      capsTracking: scenario.mode === 'tracking-margin' ? scenario.initialCapsTracking : 0,
      bodyTracking: scenario.mode === 'tracking-margin' ? scenario.initialBodyTracking : 0,
      hangPct: scenario.mode === 'tracking-margin' ? scenario.initialHangPct : 0,
    });
    rawHangRef.current = scenario.mode === 'tracking-margin' ? scenario.initialHangPct : 0;
    setActiveSnaps([]);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const glyphDrag = useStudioPointer({
    penPrecisionScale: 0.5,
    onStart: () => {
      const idx = selectedIdxRef.current;
      rawOffsetRef.current = stateRef.current.offsets[idx] ?? 0;
    },
    onMove: ({ dx }) => {
      if (submitted || scenario.mode !== 'kern') return;
      const idx = selectedIdxRef.current;
      rawOffsetRef.current = Math.max(-45, Math.min(25, rawOffsetRef.current + dx * 0.65));
      const snap0 = snapValue(rawOffsetRef.current, [{ value: 0, label: '0px', kind: 'zero' }], 2.2);
      const val = snap0.snapped ? 0 : Number(rawOffsetRef.current.toFixed(1));
      setState((prev) => {
        const nextOffsets = [...prev.offsets];
        nextOffsets[idx] = val;
        return { ...prev, offsets: nextOffsets };
      });
    },
  });

  const quoteDrag = useStudioPointer({
    penPrecisionScale: 0.55,
    onStart: () => {
      rawHangRef.current = stateRef.current.hangPct;
    },
    onMove: ({ dx }) => {
      if (submitted || scenario.mode !== 'tracking-margin') return;
      rawHangRef.current = Math.max(0, Math.min(120, rawHangRef.current - dx * 1.4));
      const snapH = snapValue(
        rawHangRef.current,
        [
          { value: 0, label: '0% flush', kind: 'edge' },
          { value: 50, label: '50%', kind: 'third' },
          { value: 100, label: '100% hang', kind: 'center' },
        ],
        6
      );
      setActiveSnaps(
        snapH.snapped
          ? [{ axis: 'x', pos: '0px', label: snapH.target?.label, kind: snapH.target?.kind }]
          : []
      );
      setState((prev) => ({
        ...prev,
        hangPct: Math.round(snapH.value),
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const handleSubmit = () => {
    const res = scoreL07(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      offsets: scenario.mode === 'kern' ? [...scenario.initialOffsets] : [0],
      capsTracking: scenario.mode === 'tracking-margin' ? scenario.initialCapsTracking : 0,
      bodyTracking: scenario.mode === 'tracking-margin' ? scenario.initialBodyTracking : 0,
      hangPct: scenario.mode === 'tracking-margin' ? scenario.initialHangPct : 0,
    });
    setSubmitted(false);
    setResult(null);
  };

  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');
  const showTargetOnly = submitted && overlayMode === 'target';

  const artboard =
    scenario.mode === 'kern' ? (
      <div
        className="studio-canvas-surface"
        style={{
          width: '100%',
          background: '#171715',
          color: '#F3EFE6',
          borderRadius: 10,
          border: '1px solid rgba(243, 239, 230, 0.14)',
          padding: '44px 24px',
          boxShadow: 'var(--shadow-artboard)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 12.5, color: '#B4AEA2', fontWeight: 500 }}>
          {scenario.pairNote}
        </div>

        {/* Kerning Word Stage */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            minHeight: 120,
          }}
        >
          {scenario.word.split('').map((ch, idx) => {
            const activeOffsets = showTargetOnly ? scenario.targetOffsets : state.offsets;
            const cumulativeShift = activeOffsets
              .slice(1, idx + 1)
              .reduce((a, b) => a + b, 0);
            const targetCumulative = scenario.targetOffsets
              .slice(1, idx + 1)
              .reduce((a, b) => a + b, 0);
            const isSelected = idx === selectedIdx && !submitted;
            const locked = idx === 0;

            return (
              <div
                key={idx}
                {...(locked || submitted ? {} : glyphDrag.bind)}
                onPointerDown={(e) => {
                  if (!locked && !submitted) {
                    selectedIdxRef.current = idx;
                    setSelectedIdx(idx);
                    glyphDrag.bind.onPointerDown(e);
                  }
                }}
                style={{
                  position: 'relative',
                  fontFamily: "'EB Garamond', Georgia, serif",
                  fontSize: 'clamp(52px, 11vw, 108px)',
                  fontWeight: 500,
                  lineHeight: 1,
                  transform: `translateX(${cumulativeShift}px)`,
                  color: isSelected ? '#60A5FA' : '#F3EFE6',
                  cursor: locked || submitted ? 'default' : 'ew-resize',
                  padding: '0 2px',
                  borderBottom: isSelected ? '2px solid #60A5FA' : '2px solid transparent',
                }}
              >
                {ch}
                {/* Target Ghost Glyph Overlay */}
                {showGuides && idx > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 2 + (targetCumulative - cumulativeShift),
                      top: 0,
                      color: '#4ADE80',
                      opacity: 0.45,
                      pointerEvents: 'none',
                    }}
                  >
                    {ch}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {scenario.word.split('').map((ch, idx) =>
              idx === 0 ? null : (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    minHeight: 36,
                    padding: '0 13px',
                    borderRadius: 6,
                    border: '1px solid rgba(243,239,230,0.22)',
                    background: selectedIdx === idx ? '#60A5FA' : 'rgba(255,255,255,0.06)',
                    color: selectedIdx === idx ? '#0F172A' : '#F3EFE6',
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  Letter “{ch}”
                </button>
              )
            )}
          </div>
        )}
      </div>
    ) : (
      <div
        className="studio-canvas-surface"
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '0 auto',
          background: '#FFFFFF',
          color: '#141413',
          borderRadius: 16,
          padding: '36px 44px',
          boxShadow: 'var(--shadow-artboard)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderLeft: showGuides ? '1.5px solid #216E4E' : '1px dashed rgba(20,20,19,0.18)',
            paddingLeft: 0,
          }}
        >
          {!submitted && <SnapGuideOverlay lines={activeSnaps} />}
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: `${((showTargetOnly ? scenario.targetCapsTracking : state.capsTracking) / 100).toFixed(2)}em`,
              color: '#585650',
              marginBottom: 12,
            }}
          >
            {scenario.eyebrow}
          </div>

          <blockquote
            {...quoteDrag.bind}
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 25,
              lineHeight: 1.32,
              letterSpacing: `${((showTargetOnly ? scenario.targetBodyTracking : state.bodyTracking) / 100).toFixed(3)}em`,
              textIndent: `${-0.42 * ((showTargetOnly ? scenario.targetHangPct : state.hangPct) / 100)}em`,
              cursor: submitted ? 'default' : 'ew-resize',
            }}
          >
            {scenario.quote}
          </blockquote>

          <div style={{ marginTop: 14, fontSize: 13, color: '#848179' }}>{scenario.author}</div>
        </div>
      </div>
    );

  const fineControls =
    scenario.mode === 'kern' ? (
      <SliderControl
        label={`Kern Pair Offset (“${scenario.word[selectedIdx]}”)`}
        value={state.offsets[selectedIdx] ?? 0}
        min={-45}
        max={25}
        step={0.5}
        unit=" px"
        onChange={(v) =>
          setState((s) => {
            const next = [...s.offsets];
            next[selectedIdx] = v;
            return { ...s, offsets: next };
          })
        }
        hint="Equalize negative space area between adjacent strokes."
      />
    ) : (
      <>
        <SliderControl
          label="ALL CAPS Eyebrow Tracking"
          value={state.capsTracking}
          min={-4}
          max={18}
          step={1}
          formatValue={(v) => `+${v}%`}
          onChange={(v) => setState((s) => ({ ...s, capsTracking: v }))}
          hint="Open uppercase labels +5% to +12%."
        />
        <SliderControl
          label="Mixed-Case Tracking"
          value={state.bodyTracking}
          min={-4}
          max={12}
          step={1}
          formatValue={(v) => `${v > 0 ? '+' : ''}${v}%`}
          onChange={(v) => setState((s) => ({ ...s, bodyTracking: v }))}
          hint="Keep lowercase body tracking at 0%."
        />
        <SliderControl
          label="Optical Quote Margin Hang"
          value={state.hangPct}
          min={0}
          max={120}
          step={5}
          unit="%"
          onChange={(v) => setState((s) => ({ ...s, hangPct: v }))}
          hint="100% hangs the opening quote cleanly past the left edge."
        />
      </>
    );

  return (
    <StudioFrame
      prompt={
        scenario.mode === 'kern'
          ? `Drag individual glyphs horizontally in “${scenario.word}” (Apple Pencil nudges at 0.5× precision) until every letter pair shares equal optical area.`
          : 'Open the ALL CAPS eyebrow tracking, restore lowercase prose tracking to 0%, and drag the quote left to hang its opening quotation mark cleanly outside the margin.'
      }
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
      isPenActive={glyphDrag.isPenActive || quoteDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
