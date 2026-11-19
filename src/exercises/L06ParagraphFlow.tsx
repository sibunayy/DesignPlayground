import React, { useEffect, useMemo, useState } from 'react';
import { Timer } from 'lucide-react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL06, L06State, scoreL06 } from './scoring/buildingScoring';

export const L06ParagraphFlow: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL06(seed), [seed]);
  const [state, setState] = useState<L06State>(() => ({
    align: scenario.initialAlign,
    widthPx: scenario.initialWidthPx,
    hyphenate: scenario.initialHyphenate,
    boundLastPair: false,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [timedMode, setTimedMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    setState({
      align: scenario.initialAlign,
      widthPx: scenario.initialWidthPx,
      hyphenate: scenario.initialHyphenate,
      boundLastPair: false,
    });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
    setSecondsLeft(60);
  }, [scenario]);

  useEffect(() => {
    if (!timedMode || submitted) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timedMode, submitted]);

  const widthDrag = useStudioPointer({
    penPrecisionScale: 0.7,
    onMove: ({ dx }) => {
      if (submitted) return;
      setState((s) => ({
        ...s,
        widthPx: Math.max(210, Math.min(440, Math.round(s.widthPx + dx * 0.8))),
      }));
    },
  });

  const handleSubmit = () => {
    const res = scoreL06(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      align: scenario.initialAlign,
      widthPx: scenario.initialWidthPx,
      hyphenate: scenario.initialHyphenate,
      boundLastPair: false,
    });
    setSubmitted(false);
    setResult(null);
    setSecondsLeft(60);
  };

  const view: L06State =
    submitted && overlayMode === 'target'
      ? { align: 'left', widthPx: scenario.targetWidthPx, hyphenate: false, boundLastPair: true }
      : state;

  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const prefixWords = scenario.words.slice(0, -2).join(' ');
  const lastTwo = scenario.words.slice(-2);
  const closingText = view.boundLastPair ? `${lastTwo[0]}\u00A0${lastTwo[1]}` : `${lastTwo[0]} ${lastTwo[1]}`;

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#FFFFFF',
        color: '#141413',
        borderRadius: 16,
        padding: 28,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Inline Quick Flow Toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          disabled={submitted}
          onClick={() =>
            setState((s) => ({ ...s, align: s.align === 'justify' ? 'left' : 'justify' }))
          }
          style={{
            minHeight: 38,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid rgba(20,20,19,0.2)',
            background: view.align === 'left' ? '#141413' : '#FAF9F5',
            color: view.align === 'left' ? '#FFFFFF' : '#141413',
            fontSize: 12.5,
            fontWeight: 500,
          }}
        >
          Alignment: {view.align === 'left' ? 'Ragged Right ✓' : 'Justified'}
        </button>

        <button
          type="button"
          disabled={submitted}
          onClick={() => setState((s) => ({ ...s, boundLastPair: !s.boundLastPair }))}
          style={{
            minHeight: 38,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid rgba(20,20,19,0.2)',
            background: view.boundLastPair ? '#216E4E' : '#FAF9F5',
            color: view.boundLastPair ? '#FFFFFF' : '#141413',
            fontSize: 12.5,
            fontWeight: 500,
          }}
        >
          {view.boundLastPair ? 'Closing Pair Bound (&nbsp;) ✓' : 'Bind Final 2 Words (&nbsp;)'}
        </button>
      </div>

      {/* Column Specimen */}
      <div
        style={{
          position: 'relative',
          width: view.widthPx,
          maxWidth: '100%',
          padding: '18px 20px',
          background: '#FAF9F5',
          borderRadius: 10,
          borderRight: submitted ? '1px solid rgba(20,20,19,0.14)' : '2px dashed #D94526',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>
          {scenario.title}
        </h3>
        <p
          lang="en"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16.5,
            lineHeight: 1.55,
            textAlign: view.align,
            hyphens: view.hyphenate ? 'auto' : 'manual',
            color: '#232220',
          }}
        >
          {prefixWords}{' '}
          <button
            type="button"
            disabled={submitted}
            onClick={() => setState((s) => ({ ...s, boundLastPair: !s.boundLastPair }))}
            style={{
              display: 'inline',
              padding: '1px 4px',
              borderRadius: 4,
              background: view.boundLastPair
                ? 'rgba(33,110,78,0.14)'
                : showGuides
                  ? 'rgba(217,69,38,0.16)'
                  : 'rgba(20,20,19,0.06)',
              borderBottom: view.boundLastPair ? '1.5px solid #216E4E' : '1.5px dashed #D94526',
            }}
          >
            {closingText}
          </button>
        </p>

        {showGuides && view.align === 'justify' && !view.hyphenate && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11.5,
              color: '#D94526',
              fontWeight: 600,
            }}
          >
            River channels active: switch to Ragged Right or widen column past 310 px.
          </div>
        )}

        {!submitted && (
          <div
            {...widthDrag.bind}
            aria-label="Drag right column boundary"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: -16,
              width: 30,
              cursor: 'ew-resize',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div style={{ width: 5, height: 42, borderRadius: 999, background: '#D94526' }} />
          </div>
        )}
      </div>
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Column Width"
        value={state.widthPx}
        min={210}
        max={440}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, widthPx: v }))}
      />
      <button
        type="button"
        onClick={() => setState((s) => ({ ...s, hyphenate: !s.hyphenate }))}
        style={{
          minHeight: 38,
          borderRadius: 8,
          border: '1px solid var(--rule-strong)',
          background: state.hyphenate ? 'var(--ink-primary)' : 'var(--bg-surface)',
          color: state.hyphenate ? 'var(--bg-surface)' : 'var(--ink-primary)',
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        Auto-Hyphenation: {state.hyphenate ? 'On' : 'Off'}
      </button>
    </>
  );

  const stageAction = !submitted ? (
    <button
      type="button"
      onClick={() => {
        setTimedMode((t) => !t);
        setSecondsLeft(60);
      }}
      className="tabular"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 34,
        padding: '0 12px',
        borderRadius: 999,
        border: '1px solid var(--rule-strong)',
        background: timedMode ? 'var(--ink-primary)' : 'var(--bg-surface)',
        color: timedMode ? 'var(--bg-surface)' : 'var(--ink-primary)',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Timer size={13} />
      <span>{timedMode ? `Ragtime ${secondsLeft}s` : 'Opt-in 60s Clock'}</span>
    </button>
  ) : null;

  return (
    <StudioFrame
      prompt="Eliminate rivers and the stranded closing runt: switch away from forced narrow justification, drag the right rag boundary smoothly, and tap the closing word pair to bind it."
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
      isPenActive={widthDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
      stageAction={stageAction}
    />
  );
};
