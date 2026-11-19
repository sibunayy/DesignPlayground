import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ActiveSnapLine, SnapGuideOverlay } from '../components/StudioShell/SnapGuideOverlay';
import { snapValue, stepTargets } from '../engine/snapEngine';
import { ExerciseResult, EyeLens, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { generateL01, L01State, scoreL01 } from './scoring/foundationScoring';

export interface ExerciseComponentProps {
  seed: string;
  styleWorld?: string;
  styleRef?: string;
  availableLenses: EyeLens[];
  activeLenses: Set<EyeLens>;
  onToggleLens: (lens: EyeLens) => void;
  railSide: 'right' | 'left';
  onComplete: (result: ExerciseResult) => void;
  onNewSeed: () => void;
  onNextLesson?: () => void;
  nextLabel?: string;
}

export const L01WhiteSpace: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL01(seed), [seed]);
  const [state, setState] = useState<L01State>(() => ({
    margin: scenario.initialMargin,
    blockX: scenario.initialBlockX,
    blockY: scenario.initialBlockY,
    hasBox: scenario.hasRedundantBox,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [activeSnaps, setActiveSnaps] = useState<ActiveSnapLine[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const rawBlockRef = useRef({ x: scenario.initialBlockX, y: scenario.initialBlockY });
  const rawMarginRef = useRef(scenario.initialMargin);

  React.useEffect(() => {
    setState({
      margin: scenario.initialMargin,
      blockX: scenario.initialBlockX,
      blockY: scenario.initialBlockY,
      hasBox: scenario.hasRedundantBox,
    });
    rawBlockRef.current = { x: scenario.initialBlockX, y: scenario.initialBlockY };
    rawMarginRef.current = scenario.initialMargin;
    setActiveSnaps([]);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const blockDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onStart: () => {
      rawBlockRef.current = { x: stateRef.current.blockX, y: stateRef.current.blockY };
    },
    onMove: ({ dx, dy }) => {
      if (submitted) return;
      rawBlockRef.current.x = Math.max(0, Math.min(72, rawBlockRef.current.x + dx * 0.55));
      rawBlockRef.current.y = Math.max(0, Math.min(36, rawBlockRef.current.y + dy * 0.55));
      const snapX = snapValue(
        rawBlockRef.current.x,
        [{ value: 0, label: 'flush 0px', kind: 'zero' }, ...stepTargets(8, 72, 8, 'grid', 'px')],
        3.5
      );
      const snapY = snapValue(
        rawBlockRef.current.y,
        [{ value: 0, label: 'top 0px', kind: 'zero' }, ...stepTargets(8, 36, 8, 'grid', 'px')],
        3
      );
      const lines: ActiveSnapLine[] = [];
      const padOffset = stateRef.current.margin + (stateRef.current.hasBox ? 14 : 0);
      if (snapX.snapped) {
        lines.push({
          axis: 'x',
          pos: `${padOffset + snapX.value}px`,
          label: snapX.target?.label,
          kind: snapX.target?.kind,
        });
      }
      if (snapY.snapped) {
        lines.push({
          axis: 'y',
          pos: `${padOffset + 96 + snapY.value}px`,
          label: snapY.target?.label,
          kind: snapY.target?.kind,
        });
      }
      setActiveSnaps(lines);
      setState((prev) => ({
        ...prev,
        blockX: Number(snapX.value.toFixed(1)),
        blockY: Number(snapY.value.toFixed(1)),
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const marginDrag = useStudioPointer({
    penPrecisionScale: 0.65,
    onStart: () => {
      rawMarginRef.current = stateRef.current.margin;
    },
    onMove: ({ dx }) => {
      if (submitted) return;
      rawMarginRef.current = Math.max(6, Math.min(48, rawMarginRef.current + dx * 0.45));
      const snapM = snapValue(rawMarginRef.current, stepTargets(8, 48, 4, 'edge', 'px'), 1.8);
      setActiveSnaps(
        snapM.snapped
          ? [
              { axis: 'x', pos: `${snapM.value}px`, label: `${Math.round(snapM.value)}px`, kind: 'edge' },
              { axis: 'y', pos: `${snapM.value}px`, kind: 'edge' },
            ]
          : []
      );
      setState((prev) => ({
        ...prev,
        margin: Math.round(snapM.value),
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const handleSubmit = () => {
    const res = scoreL01(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      margin: scenario.initialMargin,
      blockX: scenario.initialBlockX,
      blockY: scenario.initialBlockY,
      hasBox: scenario.hasRedundantBox,
    });
    setSubmitted(false);
    setResult(null);
  };

  const displayState: L01State =
    submitted && overlayMode === 'target'
      ? {
          margin: scenario.targetMargin,
          blockX: scenario.targetBlockX,
          blockY: scenario.targetBlockY,
          hasBox: false,
        }
      : state;

  const showTargetGhost = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');
  const trappedWidth = Math.max(0, displayState.blockX);

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#F4F0E7',
        color: '#191815',
        borderRadius: 4,
        border: '1px solid rgba(25, 24, 21, 0.14)',
        boxShadow: 'var(--shadow-artboard)',
        padding: displayState.margin,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 380,
        transition: submitted ? 'padding 220ms ease' : undefined,
      }}
    >
      {/* Drag edge handle for outer margin */}
      {!submitted && (
        <div
          {...marginDrag.bind}
          role="slider"
          tabIndex={0}
          aria-label="Drag left margin inward"
          aria-valuemin={6}
          aria-valuemax={48}
          aria-valuenow={displayState.margin}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              setState((s) => ({ ...s, margin: Math.max(6, s.margin - 2) }));
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              setState((s) => ({ ...s, margin: Math.min(48, s.margin + 2) }));
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: Math.max(0, displayState.margin - 18),
            width: 36,
            cursor: 'ew-resize',
            zIndex: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 4,
              height: 48,
              borderRadius: 999,
              background: marginDrag.isDragging ? '#0EA5E9' : 'rgba(25, 24, 21, 0.32)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.55)',
            }}
          />
        </div>
      )}

      {!submitted && <SnapGuideOverlay lines={activeSnaps} />}

      {/* Inner Kinfolk Editorial Composition */}
      <div
        style={{
          position: 'relative',
          border: displayState.hasBox ? '1.5px solid rgba(25, 24, 21, 0.42)' : '1.5px solid transparent',
          borderRadius: 2,
          padding: displayState.hasBox ? 14 : 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {/* Tap badge to strip redundant box */}
        {!submitted && displayState.hasBox && (
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, hasBox: false }))}
            style={{
              position: 'absolute',
              top: -12,
              right: 12,
              padding: '4px 10px',
              borderRadius: 4,
              background: '#191815',
              color: '#F4F0E7',
              fontSize: 11,
              fontWeight: 600,
              zIndex: 15,
            }}
          >
            Tap to strip box
          </button>
        )}

        {/* Left Editorial Text Column (Draggable to close trapped void) */}
        <div
          {...blockDrag.bind}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            cursor: submitted ? 'default' : 'grab',
            paddingRight: 4,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B665D' }}>
              {scenario.brief.client}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 27,
                lineHeight: 1.12,
                marginTop: 6,
                fontWeight: 400,
              }}
            >
              {scenario.brief.headline}
            </h3>
          </div>

          <div
            style={{
              transform: `translate(${displayState.blockX}px, ${displayState.blockY}px)`,
              padding: 12,
              borderRadius: 3,
              background: !submitted ? 'rgba(25, 24, 21, 0.04)' : 'transparent',
              border: !submitted ? '1px dashed rgba(25, 24, 21, 0.22)' : 'none',
            }}
          >
            <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 15, lineHeight: 1.52, color: '#383630' }}>
              {scenario.brief.subhead}
            </p>
            <div
              style={{
                marginTop: 14,
                display: 'inline-flex',
                padding: '9px 18px',
                borderRadius: 2,
                background: '#191815',
                color: '#F4F0E7',
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              {scenario.brief.ctaLabel}
            </div>
          </div>
        </div>

        {/* Right Photo Specimen */}
        <div
          style={{
            borderRadius: 2,
            overflow: 'hidden',
            minHeight: 245,
            background: '#E5E0D5',
          }}
        >
          <img
            src={scenario.photoUrl}
            alt={scenario.brief.client}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Trapped Void Highlight Overlay */}
        {showTargetGhost && trappedWidth > 8 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 108,
              width: trappedWidth + 24,
              height: 92,
              borderRadius: 3,
              background: 'rgba(200, 50, 38, 0.14)',
              border: '1.5px dashed #C83226',
              pointerEvents: 'none',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C83226' }}>Trapped Void</span>
          </div>
        )}
      </div>

      {/* Ideal Perimeter Guide Overlay */}
      {showTargetGhost && (
        <div
          style={{
            position: 'absolute',
            inset: scenario.targetMargin,
            border: '1.5px dashed #157347',
            borderRadius: 3,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -22,
              right: 8,
              fontSize: 10.5,
              fontWeight: 600,
              color: '#157347',
              background: 'rgba(244,240,231,0.96)',
              padding: '1px 6px',
              borderRadius: 3,
              border: '1px solid rgba(21,115,71,0.28)',
            }}
          >
            Ideal {scenario.targetMargin}px Perimeter
          </span>
        </div>
      )}
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Outer Margin"
        value={Math.round(state.margin)}
        min={6}
        max={48}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, margin: v }))}
      />
      <SliderControl
        label="Horizontal Void Shift"
        value={Math.round(state.blockX)}
        min={0}
        max={72}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, blockX: v }))}
        hint="0 px releases trapped space cleanly to the margin."
      />
      <SliderControl
        label="Vertical Void Shift"
        value={Math.round(state.blockY)}
        min={0}
        max={36}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, blockY: v }))}
      />
      <button
        type="button"
        onClick={() => setState((s) => ({ ...s, hasBox: !s.hasBox }))}
        style={{
          minHeight: 40,
          borderRadius: 8,
          border: '1px solid var(--rule-strong)',
          background: state.hasBox ? 'var(--bg-surface)' : 'var(--ink-primary)',
          color: state.hasBox ? 'var(--ink-primary)' : 'var(--bg-surface)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {state.hasBox ? 'Remove Redundant Border Box' : 'Border Box Removed ✓'}
      </button>
    </>
  );

  return (
    <StudioFrame
      prompt="Release the trapped interior void back to the edge: drag the copy flush left, widen outer breathing margins, and strip the unnecessary border box."
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
      isPenActive={blockDrag.isPenActive || marginDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
