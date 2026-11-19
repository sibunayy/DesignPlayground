import React, { useMemo, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL05, HEADLINE_CANDIDATES, L05State, scoreL05 } from './scoring/buildingScoring';

export const L05FontPairing: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL05(seed), [seed]);
  const [state, setState] = useState<L05State>(() => ({
    selectedId: scenario.initialCandidateId,
    scaleRatio: scenario.initialScaleRatio,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');

  React.useEffect(() => {
    setState({
      selectedId: scenario.initialCandidateId,
      scaleRatio: scenario.initialScaleRatio,
    });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const handleSubmit = () => {
    const res = scoreL05(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      selectedId: scenario.initialCandidateId,
      scaleRatio: scenario.initialScaleRatio,
    });
    setSubmitted(false);
    setResult(null);
  };

  const idealHeadline =
    scenario.candidates.find((c) => !c.isNearMiss) ?? HEADLINE_CANDIDATES[0];

  const activeState: L05State =
    submitted && overlayMode === 'target'
      ? { selectedId: idealHeadline.id, scaleRatio: scenario.targetScaleRatio }
      : state;

  const selectedFace =
    scenario.candidates.find((c) => c.id === activeState.selectedId) ?? scenario.candidates[0];

  const bodySize = 16;
  const h2Size = Math.round(bodySize * activeState.scaleRatio);
  const h1Size = Math.round(bodySize * activeState.scaleRatio * activeState.scaleRatio);
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const artboard = (
    <div
      style={{
        width: '100%',
        background: '#FFFFFF',
        color: '#141413',
        borderRadius: 16,
        padding: 28,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Headline Candidate Picker */}
      <div>
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#848179',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Headline Partner (Body locked to {scenario.bodyFontName})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
          {scenario.candidates.map((cand) => {
            const active = activeState.selectedId === cand.id;
            return (
              <button
                key={cand.id}
                type="button"
                disabled={submitted}
                onClick={() => setState((s) => ({ ...s, selectedId: cand.id }))}
                style={{
                  minHeight: 46,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: active ? '2px solid #141413' : '1px solid rgba(20,20,19,0.16)',
                  background: active ? '#F7F6F2' : '#FFFFFF',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{ fontFamily: cand.cssFamily, fontSize: 15, fontWeight: 600 }}>
                  {cand.name}
                </span>
                <span style={{ fontSize: 10.5, color: '#848179' }}>
                  {cand.classification === 'serif' ? 'Editorial Serif' : 'Sans-Serif'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Specimen Spread */}
      <div style={{ paddingTop: 12, borderTop: '1px solid rgba(20,20,19,0.1)' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.08em', color: '#848179', fontWeight: 600 }}>
          {scenario.brief.eyebrow}
        </div>
        <h3
          style={{
            fontFamily: selectedFace.cssFamily,
            fontSize: h1Size,
            lineHeight: 1.15,
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          {scenario.brief.headline}
        </h3>
        <h4
          style={{
            fontFamily: selectedFace.cssFamily,
            fontSize: h2Size,
            lineHeight: 1.25,
            marginTop: 8,
            color: '#4A4843',
            fontWeight: 500,
          }}
        >
          {scenario.brief.subhead}
        </h4>
        <p
          style={{
            fontFamily: scenario.bodyCssFamily,
            fontSize: bodySize,
            lineHeight: 1.55,
            marginTop: 12,
            color: '#2B2A28',
          }}
        >
          {scenario.brief.body}
        </p>
      </div>

      {/* Interactive "handgloves" x-height Comparator */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: '#FAF9F5',
          border: '1px solid rgba(20,20,19,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: 10.5, fontWeight: 600, color: '#848179', marginBottom: 6 }}>
          “handgloves” x-Height Comparator
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 2, lineHeight: 1 }}>
          {showGuides && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 8,
                  borderBottom: '1px solid rgba(20,20,19,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 30,
                  borderBottom: '1.5px dashed #216E4E',
                }}
              />
            </>
          )}
          <span style={{ fontFamily: selectedFace.cssFamily, fontSize: 42, color: '#141413' }}>
            hand
          </span>
          <span style={{ fontFamily: scenario.bodyCssFamily, fontSize: 42, color: '#D94526' }}>
            gloves
          </span>
        </div>
        {showGuides && (
          <div className="tabular" style={{ fontSize: 11, color: '#216E4E', marginTop: 8, fontWeight: 600 }}>
            x-height ratio: {selectedFace.xHeightRatio.toFixed(2)}× · Scale: {activeState.scaleRatio.toFixed(2)}× (target 1.25×)
          </div>
        )}
      </div>
    </div>
  );

  const fineControls = (
    <SliderControl
      label="Modular Type Scale Ratio"
      value={activeState.scaleRatio}
      min={1.06}
      max={1.5}
      step={0.01}
      formatValue={(v) => `${v.toFixed(2)}× (H1 ${Math.round(16 * v * v)}px)`}
      onChange={(v) => setState((s) => ({ ...s, scaleRatio: v }))}
      hint="1.25× (Major Third) separates H1, H2, and body cleanly without bloat."
    />
  );

  return (
    <StudioFrame
      prompt="Pick a headline partner that contrasts clearly with Inter without clashing in x-height, then tune the modular type scale in Fine Sliders."
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
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
