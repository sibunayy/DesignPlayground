import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL11, IconPoint, L11State, scoreL11 } from './scoring/challengeScoring';

export const L11Iconography: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL11(seed), [seed]);
  const [state, setState] = useState<L11State>(() => ({
    points: scenario.initialPoints.map((p) => ({ ...p })),
    stroke: scenario.initialStroke,
  }));
  const [selectedPt, setSelectedPt] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const selectedPtRef = useRef(selectedPt);
  selectedPtRef.current = selectedPt;

  React.useEffect(() => {
    setState({
      points: scenario.initialPoints.map((p) => ({ ...p })),
      stroke: scenario.initialStroke,
    });
    setSelectedPt(0);
    selectedPtRef.current = 0;
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const updatePointFromClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg || submitted) return;
    const rect = svg.getBoundingClientRect();
    const gx = ((clientX - rect.left) / rect.width) * 24;
    const gy = ((clientY - rect.top) / rect.height) * 24;
    // Soft integer snapping when within 0.3px of whole pixel grid
    const sx = Math.abs(gx - Math.round(gx)) < 0.3 ? Math.round(gx) : Number(gx.toFixed(1));
    const sy = Math.abs(gy - Math.round(gy)) < 0.3 ? Math.round(gy) : Number(gy.toFixed(1));
    const activeIdx = selectedPtRef.current;
    setState((prev) => {
      const next = prev.points.map((p, i) =>
        i === activeIdx
          ? {
              x: Math.max(1, Math.min(23, sx)),
              y: Math.max(1, Math.min(23, sy)),
            }
          : p
      );
      return { ...prev, points: next };
    });
  };

  const vertexDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onMove: ({ clientX, clientY }) => updatePointFromClient(clientX, clientY),
  });

  const handleSubmit = () => {
    const res = scoreL11(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      points: scenario.initialPoints.map((p) => ({ ...p })),
      stroke: scenario.initialStroke,
    });
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const activePoints = showTarget ? scenario.targetPoints : state.points;
  const activeStroke = showTarget ? scenario.targetStroke : state.stroke;

  const toPoly = (pts: IconPoint[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#141923',
        color: '#E2E8F0',
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        padding: 24,
        boxShadow: 'var(--shadow-artboard)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 24,
        alignItems: 'center',
      }}
    >
      {/* 24x24 Magnified Pixel CAD Artboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 290 }}>
        <div className="tabular" style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8' }}>
          24×24 CAD Matrix · {scenario.iconName}
        </div>
        <svg
          ref={svgRef}
          data-studio-drag="true"
          viewBox="0 0 24 24"
          width="100%"
          style={{
            aspectRatio: '1 / 1',
            background: '#0D1119',
            borderRadius: 8,
            border: '1px solid rgba(96, 165, 250, 0.28)',
            touchAction: 'none',
          }}
        >
          {/* 24x24 Grid Lines */}
          {Array.from({ length: 23 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i + 1} y1={0} x2={i + 1} y2={24} stroke="rgba(148,163,184,0.14)" strokeWidth={0.05} />
              <line x1={0} y1={i + 1} x2={24} y2={i + 1} stroke="rgba(148,163,184,0.14)" strokeWidth={0.05} />
            </React.Fragment>
          ))}

          {/* 2px Live Safe Padding Guide */}
          <rect
            x={2}
            y={2}
            width={20}
            height={20}
            fill="none"
            stroke="#60A5FA"
            strokeOpacity={0.55}
            strokeWidth={0.09}
            strokeDasharray="0.4 0.3"
          />

          {/* Keyline Templates on Reveal */}
          {showGuides && (
            <g stroke="#4ADE80" strokeOpacity={0.55} strokeWidth={0.12} fill="none">
              <circle cx={12} cy={12} r={9.5} />
              <rect x={3} y={3} width={18} height={18} rx={2} />
            </g>
          )}

          {/* Target Ghost */}
          {showGuides && (
            <polygon
              points={toPoly(scenario.targetPoints)}
              fill="none"
              stroke="#4ADE80"
              strokeWidth={scenario.targetStroke}
              strokeOpacity={0.42}
              strokeLinejoin="round"
            />
          )}

          {/* User Icon */}
          <polygon
            points={toPoly(activePoints)}
            fill="none"
            stroke="#F8FAFC"
            strokeWidth={activeStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Live Vertex CAD Alignment Crosshair While Dragging */}
          {!submitted && vertexDrag.isDragging && state.points[selectedPt] && (
            <g pointerEvents="none">
              <line
                x1={state.points[selectedPt].x}
                y1={0}
                x2={state.points[selectedPt].x}
                y2={24}
                stroke={Number.isInteger(state.points[selectedPt].x) ? '#D946EF' : '#0EA5E9'}
                strokeWidth={0.14}
                strokeDasharray="0.45 0.3"
              />
              <line
                x1={0}
                y1={state.points[selectedPt].y}
                x2={24}
                y2={state.points[selectedPt].y}
                stroke={Number.isInteger(state.points[selectedPt].y) ? '#D946EF' : '#0EA5E9'}
                strokeWidth={0.14}
                strokeDasharray="0.45 0.3"
              />
            </g>
          )}

          {/* Interactive Anchor Handles with Generous Finger Hit Target */}
          {!submitted &&
            state.points.map((pt, idx) => (
              <g
                key={idx}
                data-studio-drag="true"
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  selectedPtRef.current = idx;
                  setSelectedPt(idx);
                  vertexDrag.bind.onPointerDown(e as unknown as React.PointerEvent<HTMLElement>);
                }}
              >
                <circle cx={pt.x} cy={pt.y} r={1.85} fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={0.85}
                  fill={selectedPt === idx ? '#60A5FA' : '#0D1119'}
                  stroke="#F8FAFC"
                  strokeWidth={0.22}
                />
              </g>
            ))}
        </svg>
      </div>

      {/* Actual 1:1 Scale Density Comparison Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
            100% Toolbar Parity Check (24×24 px)
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 20px',
              borderRadius: 10,
              background: '#FFFFFF',
              color: '#111317',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Reference Circle */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="none" stroke="#111317" strokeWidth={scenario.targetStroke} />
            </svg>
            {/* User Icon at 1x */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <polygon
                points={toPoly(activePoints)}
                fill="none"
                stroke="#111317"
                strokeWidth={activeStroke}
                strokeLinejoin="round"
              />
            </svg>
            {/* Reference Square */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="#111317" strokeWidth={scenario.targetStroke} />
            </svg>
          </div>
        </div>

        <div className="tabular" style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.5 }}>
          Active Vertex #{selectedPt + 1}: ({state.points[selectedPt]?.x.toFixed(1)},{' '}
          {state.points[selectedPt]?.y.toFixed(1)})
        </div>
      </div>
    </div>
  );

  const pt = state.points[selectedPt] ?? { x: 12, y: 12 };
  const fineControls = (
    <>
      <SliderControl
        label="Stroke Weight"
        value={state.stroke}
        min={1.25}
        max={3}
        step={0.25}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, stroke: v }))}
        hint="Match optical weight against the reference circle and square."
      />
      <SliderControl
        label={`Vertex #${selectedPt + 1} X`}
        value={pt.x}
        min={1}
        max={23}
        step={0.5}
        onChange={(v) =>
          setState((s) => ({
            ...s,
            points: s.points.map((p, i) => (i === selectedPt ? { ...p, x: v } : p)),
          }))
        }
      />
      <SliderControl
        label={`Vertex #${selectedPt + 1} Y`}
        value={pt.y}
        min={1}
        max={23}
        step={0.5}
        onChange={(v) =>
          setState((s) => ({
            ...s,
            points: s.points.map((p, i) => (i === selectedPt ? { ...p, y: v } : p)),
          }))
        }
      />
    </>
  );

  return (
    <StudioFrame
      prompt="Drag off-grid vector handles onto crisp integer pixel intersections inside the 2 px live margin, and dial stroke weight in Fine Sliders to match neighboring icons."
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
      isPenActive={vertexDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
