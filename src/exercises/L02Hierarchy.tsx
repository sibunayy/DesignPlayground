import React, { useMemo, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { snapValue, stepTargets } from '../engine/snapEngine';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL02, L02State, scoreL02 } from './scoring/foundationScoring';

export const L02Hierarchy: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL02(seed), [seed]);
  const [state, setState] = useState<L02State>(() => ({
    headGap: scenario.initialHeadGap,
    sectionGap: scenario.initialSectionGap,
    badgeAccent: scenario.initialBadgeAccent,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [flashHidden, setFlashHidden] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const rawHeadRef = useRef(scenario.initialHeadGap);
  const rawSectionRef = useRef(scenario.initialSectionGap);

  React.useEffect(() => {
    setState({
      headGap: scenario.initialHeadGap,
      sectionGap: scenario.initialSectionGap,
      badgeAccent: scenario.initialBadgeAccent,
    });
    rawHeadRef.current = scenario.initialHeadGap;
    rawSectionRef.current = scenario.initialSectionGap;
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
    setFlashHidden(false);
  }, [scenario]);

  const headDrag = useStudioPointer({
    penPrecisionScale: 0.65,
    onStart: () => {
      rawHeadRef.current = stateRef.current.headGap;
    },
    onMove: ({ dy }) => {
      if (submitted) return;
      rawHeadRef.current = Math.max(4, Math.min(34, rawHeadRef.current + dy * 0.55));
      const snapH = snapValue(rawHeadRef.current, stepTargets(4, 34, 4, 'grid', 'px'), 1.8);
      setState((s) => ({
        ...s,
        headGap: Math.round(snapH.value),
      }));
    },
  });

  const sectionDrag = useStudioPointer({
    penPrecisionScale: 0.65,
    onStart: () => {
      rawSectionRef.current = stateRef.current.sectionGap;
    },
    onMove: ({ dy }) => {
      if (submitted) return;
      rawSectionRef.current = Math.max(8, Math.min(48, rawSectionRef.current + dy * 0.55));
      const snapS = snapValue(rawSectionRef.current, stepTargets(8, 48, 4, 'grid', 'px'), 1.8);
      setState((s) => ({
        ...s,
        sectionGap: Math.round(snapS.value),
      }));
    },
  });

  const triggerTwoSecRecall = () => {
    setFlashHidden(false);
    window.setTimeout(() => setFlashHidden(true), 2000);
  };

  const handleSubmit = () => {
    setFlashHidden(false);
    const res = scoreL02(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      headGap: scenario.initialHeadGap,
      sectionGap: scenario.initialSectionGap,
      badgeAccent: scenario.initialBadgeAccent,
    });
    setSubmitted(false);
    setResult(null);
    setFlashHidden(false);
  };

  const viewState: L02State =
    submitted && overlayMode === 'target'
      ? {
          headGap: scenario.targetHeadGap,
          sectionGap: scenario.targetSectionGap,
          badgeAccent: false,
        }
      : state;

  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');
  const ratio = viewState.sectionGap / Math.max(4, viewState.headGap);

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        maxWidth: 540,
        margin: '0 auto',
        background: '#0E1117',
        color: '#F1F5F9',
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: 'clamp(18px, 4vw, 30px)',
        boxShadow: 'var(--shadow-artboard)',
        position: 'relative',
      }}
    >
      {flashHidden && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 25,
            background: 'rgba(14, 17, 23, 0.96)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--font-grotesk)', fontSize: 20, fontWeight: 600 }}>
            2-Second Recall Check
          </span>
          <p style={{ fontSize: 13.5, color: '#94A3B8', maxWidth: '34ch' }}>
            What registered first? If your eye bounced between the badge and button, strip the competing accent and widen section spacing.
          </p>
          <button
            type="button"
            onClick={() => setFlashHidden(false)}
            style={{
              marginTop: 4,
              padding: '9px 18px',
              borderRadius: 8,
              background: '#F8FAFC',
              color: '#0E1117',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Resume Editing
          </button>
        </div>
      )}

      {/* Eyebrow Badge — competing accent tap target */}
      <button
        type="button"
        disabled={submitted}
        onClick={() => setState((s) => ({ ...s, badgeAccent: !s.badgeAccent }))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          borderRadius: 6,
          fontSize: 11.5,
          fontWeight: 600,
          background: viewState.badgeAccent ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)',
          color: viewState.badgeAccent ? '#FFFFFF' : '#94A3B8',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <span>{scenario.brief.client}</span>
        {!submitted && viewState.badgeAccent && <span style={{ opacity: 0.85 }}>(Tap to mute)</span>}
      </button>

      {/* Section 1 */}
      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: 25, lineHeight: 1.15, fontWeight: 600, letterSpacing: '-0.02em' }}>
          {scenario.brief.headline}
        </h3>
        <div
          {...headDrag.bind}
          style={{
            marginTop: viewState.headGap,
            padding: '6px 8px',
            marginLeft: -8,
            marginRight: -8,
            borderRadius: 6,
            cursor: submitted ? 'default' : 'ns-resize',
            background: !submitted ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
            border: !submitted ? '1px dashed rgba(255, 255, 255, 0.2)' : 'none',
            position: 'relative',
          }}
        >
          <p style={{ fontSize: 14.5, lineHeight: 1.5, color: '#CBD5E1' }}>
            {scenario.brief.subhead}
          </p>
          {headDrag.isDragging && !submitted && (
            <span
              className="tabular"
              style={{
                position: 'absolute',
                right: 6,
                top: -12,
                fontSize: 10.5,
                fontWeight: 600,
                padding: '1px 7px',
                borderRadius: 4,
                background: '#0EA5E9',
                color: '#FFFFFF',
                pointerEvents: 'none',
              }}
            >
              {viewState.headGap}px
            </span>
          )}
          {showGuides && (
            <span
              className="tabular"
              style={{
                position: 'absolute',
                right: 6,
                top: -12,
                fontSize: 10.5,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 4,
                background: '#157347',
                color: '#FFFFFF',
              }}
            >
              Inside: {viewState.headGap}px
            </span>
          )}
        </div>
      </div>

      {/* Section 2 — drag vertically to set Outside gap (~2x inside) */}
      <div
        {...sectionDrag.bind}
        style={{
          marginTop: viewState.sectionGap,
          paddingTop: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          cursor: submitted ? 'default' : 'ns-resize',
          position: 'relative',
        }}
      >
        {sectionDrag.isDragging && !submitted && (
          <span
            className="tabular"
            style={{
              position: 'absolute',
              right: 6,
              top: -12,
              fontSize: 10.5,
              fontWeight: 600,
              padding: '1px 7px',
              borderRadius: 4,
              background: '#0EA5E9',
              color: '#FFFFFF',
              pointerEvents: 'none',
            }}
          >
            {viewState.sectionGap}px
          </span>
        )}
        {showGuides && (
          <span
            className="tabular"
            style={{
              position: 'absolute',
              right: 6,
              top: -12,
              fontSize: 10.5,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 4,
              background: ratio >= 2 ? '#157347' : '#C83226',
              color: '#FFFFFF',
            }}
          >
            Outside: {viewState.sectionGap}px ({ratio.toFixed(1)}×)
          </span>
        )}
        <h4 style={{ fontSize: 15, fontWeight: 600, color: '#F8FAFC' }}>Release Notes & Schedule</h4>
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#94A3B8', marginTop: 6 }}>
          {scenario.brief.body}
        </p>
      </div>

      {/* Primary Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
        <span
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: '#3B82F6',
            color: '#FFFFFF',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {scenario.brief.ctaLabel}
        </span>
        <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
          {scenario.brief.secondaryLabel}
        </span>
      </div>
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Heading → Copy (Inside Gap)"
        value={state.headGap}
        min={4}
        max={34}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, headGap: v }))}
      />
      <SliderControl
        label="Between Sections (Outside Gap)"
        value={state.sectionGap}
        min={8}
        max={48}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, sectionGap: v }))}
        hint="Target roughly 2× larger gap between sections than inside headings."
      />
      <button
        type="button"
        onClick={() => setState((s) => ({ ...s, badgeAccent: !s.badgeAccent }))}
        style={{
          minHeight: 40,
          borderRadius: 8,
          border: '1px solid var(--rule-strong)',
          background: state.badgeAccent ? 'var(--bg-surface)' : 'var(--ink-primary)',
          color: state.badgeAccent ? 'var(--ink-primary)' : 'var(--bg-surface)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {state.badgeAccent ? 'Neutralize Eyebrow Tag Accent' : 'Single CTA Accent Active ✓'}
      </button>
    </>
  );

  const stageAction = !submitted ? (
    <button
      type="button"
      onClick={triggerTwoSecRecall}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 34,
        padding: '0 12px',
        borderRadius: 999,
        border: '1px solid var(--rule-strong)',
        background: 'var(--bg-surface)',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Eye size={13} />
      <span>2s Flash Test</span>
    </button>
  ) : null;

  return (
    <StudioFrame
      prompt="Bind the heading to its copy (drag vertically), separate the second section cleanly (~2× gap), and tap the loud tag so only the primary action carries accent blue."
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
      isPenActive={headDrag.isPenActive || sectionDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
      stageAction={stageAction}
    />
  );
};
