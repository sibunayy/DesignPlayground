import React, { useEffect, useMemo, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL08, L08State, scoreL08 } from './scoring/buildingScoring';

export const L08CharacterHygiene: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL08(seed), [seed]);
  const [state, setState] = useState<L08State>(() => ({
    selections: { ...scenario.initialSelections },
    tableTabular: scenario.initialTableTabular,
    proseOldstyle: scenario.initialProseOldstyle,
  }));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');

  useEffect(() => {
    setState({
      selections: { ...scenario.initialSelections },
      tableTabular: scenario.initialTableTabular,
      proseOldstyle: scenario.initialProseOldstyle,
    });
    setOpenMenuId(null);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  // Subtle live counter tick so learners actually SEE proportional jitter vs tabular alignment!
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => (t + 1) % 10), 900);
    return () => window.clearInterval(id);
  }, []);

  const handleSubmit = () => {
    setOpenMenuId(null);
    const res = scoreL08(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      selections: { ...scenario.initialSelections },
      tableTabular: scenario.initialTableTabular,
      proseOldstyle: scenario.initialProseOldstyle,
    });
    setOpenMenuId(null);
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const activeTableTabular = showTarget ? true : state.tableTabular;
  const activeProseOldstyle = showTarget ? true : state.proseOldstyle;

  const artboard = (
    <div
      style={{
        width: '100%',
        background: '#EAEAE4',
        color: '#191A18',
        borderRadius: 6,
        border: '1.5px solid #262724',
        padding: 26,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #262724', paddingBottom: 12 }}>
        <div>
          <div className="tabular" style={{ fontSize: 11, fontWeight: 600, color: '#D95D16' }}>
            {scenario.excerpt.headline}
          </div>
          <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: 22, marginTop: 4, fontWeight: 600 }}>
            {scenario.excerpt.title}
          </h3>
        </div>
        <span className="tabular" style={{ fontSize: 11, color: '#585A53' }}>SPEC-08</span>
      </div>

      {/* Interactive Proofreading Prose */}
      <div
        style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 19.5,
          lineHeight: 1.65,
          padding: '14px 16px',
          background: '#F7F7F4',
          border: '1px solid rgba(25,26,24,0.12)',
          borderRadius: 4,
          fontVariantNumeric: activeProseOldstyle ? 'oldstyle-nums proportional-nums' : 'lining-nums tabular-nums',
          position: 'relative',
        }}
      >
        {scenario.excerpt.proseSegments.map((seg) => {
          const val = showTarget ? seg.good : state.selections[seg.id];
          const isCorrect = val === seg.good;
          const isOpen = openMenuId === seg.id && !submitted;

          return (
            <span key={seg.id} style={{ position: 'relative', display: 'inline' }}>
              <button
                type="button"
                disabled={submitted}
                onClick={() => setOpenMenuId((cur) => (cur === seg.id ? null : seg.id))}
                style={{
                  display: 'inline',
                  padding: '2px 6px',
                  margin: '0 2px',
                  borderRadius: 6,
                  borderBottom: showGuides
                    ? isCorrect
                      ? '2px solid #216E4E'
                      : '2px solid #D94526'
                    : '1.5px dashed rgba(20, 20, 19, 0.35)',
                  background: showGuides
                    ? isCorrect
                      ? 'rgba(33,110,78,0.1)'
                      : 'rgba(217,69,38,0.12)'
                    : 'rgba(20, 20, 19, 0.04)',
                }}
              >
                {val}
              </button>

              {isOpen && (
                <span
                  className="hygiene-choice-popover"
                  style={{
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: 8,
                    borderRadius: 10,
                    background: '#141413',
                    color: '#F7F6F2',
                    boxShadow: 'var(--shadow-float)',
                  }}
                >
                  {seg.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setState((s) => ({
                          ...s,
                          selections: { ...s.selections, [seg.id]: choice },
                        }));
                        setOpenMenuId(null);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 6,
                        background:
                          state.selections[seg.id] === choice ? '#D94526' : 'rgba(255,255,255,0.08)',
                        color: '#FFFFFF',
                        fontSize: 15,
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </span>
              )}{' '}
            </span>
          );
        })}
      </div>

      {/* Live Metrics Table Demonstrating Proportional Jitter vs Tabular Lining */}
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: '#FAF9F5',
          border: '1px solid rgba(20,20,19,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#585650' }}>
            {scenario.excerpt.tableTitle}
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={submitted}
              onClick={() => setState((s) => ({ ...s, proseOldstyle: !s.proseOldstyle }))}
              style={{
                minHeight: 32,
                padding: '0 10px',
                borderRadius: 999,
                border: '1px solid rgba(20,20,19,0.2)',
                background: activeProseOldstyle ? '#141413' : '#FFFFFF',
                color: activeProseOldstyle ? '#FFFFFF' : '#141413',
                fontSize: 11.5,
                fontWeight: 500,
              }}
            >
              Prose: {activeProseOldstyle ? 'Oldstyle ✓' : 'Lining'}
            </button>

            <button
              type="button"
              disabled={submitted}
              onClick={() => setState((s) => ({ ...s, tableTabular: !s.tableTabular }))}
              style={{
                minHeight: 32,
                padding: '0 10px',
                borderRadius: 999,
                border: '1px solid rgba(20,20,19,0.2)',
                background: activeTableTabular ? '#141413' : '#FFFFFF',
                color: activeTableTabular ? '#FFFFFF' : '#141413',
                fontSize: 11.5,
                fontWeight: 500,
              }}
            >
              Table: {activeTableTabular ? 'Tabular ✓' : 'Proportional'}
            </button>
          </div>
        </div>

        {scenario.excerpt.rows.map((row, idx) => {
          const val = idx === 2 ? `${row.value.slice(0, -1)}${tick}` : row.value;
          return (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                borderTop: '1px solid rgba(20,20,19,0.08)',
                fontSize: 14,
              }}
            >
              <span style={{ color: '#585650' }}>{row.label}</span>
              <span
                style={{
                  fontFamily: "'EB Garamond', Georgia, serif",
                  fontSize: 17,
                  fontVariantNumeric: activeTableTabular
                    ? 'tabular-nums lining-nums'
                    : 'proportional-nums oldstyle-nums',
                }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <StudioFrame
      prompt="Tap each underlined token in the prose to fix quotes, decade apostrophes, en dashes, primes, and spacing, then assign Oldstyle figures to prose and Tabular figures to the ticking table."
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
      artboard={artboard}
    />
  );
};
