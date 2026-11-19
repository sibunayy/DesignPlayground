import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ActiveSnapLine, SnapGuideOverlay } from '../components/StudioShell/SnapGuideOverlay';
import { snapPoint2D, snapValue, stepTargets } from '../engine/snapEngine';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL09, L09State, scoreL09 } from './scoring/challengeScoring';

export const L09OpticalGeometry: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL09(seed), [seed]);
  const [state, setState] = useState<L09State>(() => ({
    offsetX: scenario.mode === 'optical-center' ? scenario.initialX : 0,
    offsetY: scenario.mode === 'optical-center' ? scenario.initialY : 0,
    innerRadius: scenario.mode === 'concentric-radii' ? scenario.initialInnerRadius : 0,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const [activeSnaps, setActiveSnaps] = useState<ActiveSnapLine[]>([]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const rawShapeRef = useRef({
    x: scenario.mode === 'optical-center' ? scenario.initialX : 0,
    y: scenario.mode === 'optical-center' ? scenario.initialY : 0,
  });
  const rawRadiusRef = useRef(scenario.mode === 'concentric-radii' ? scenario.initialInnerRadius : 0);

  React.useEffect(() => {
    setState({
      offsetX: scenario.mode === 'optical-center' ? scenario.initialX : 0,
      offsetY: scenario.mode === 'optical-center' ? scenario.initialY : 0,
      innerRadius: scenario.mode === 'concentric-radii' ? scenario.initialInnerRadius : 0,
    });
    rawShapeRef.current = {
      x: scenario.mode === 'optical-center' ? scenario.initialX : 0,
      y: scenario.mode === 'optical-center' ? scenario.initialY : 0,
    };
    rawRadiusRef.current = scenario.mode === 'concentric-radii' ? scenario.initialInnerRadius : 0;
    setActiveSnaps([]);
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const shapeDrag = useStudioPointer({
    penPrecisionScale: 0.5,
    onStart: () => {
      rawShapeRef.current = { x: stateRef.current.offsetX, y: stateRef.current.offsetY };
    },
    onMove: ({ dx, dy }) => {
      if (submitted || scenario.mode !== 'optical-center') return;
      rawShapeRef.current.x = Math.max(-24, Math.min(24, rawShapeRef.current.x + dx * 0.65));
      rawShapeRef.current.y = Math.max(-24, Math.min(24, rawShapeRef.current.y + dy * 0.65));
      const snap2D = snapPoint2D(
        rawShapeRef.current.x,
        rawShapeRef.current.y,
        [{ value: 0, label: 'center X=0', kind: 'center' }],
        [{ value: 0, label: 'center Y=0', kind: 'center' }],
        2.0,
        2.0
      );
      const lines: ActiveSnapLine[] = [];
      if (snap2D.guideX) {
        lines.push({ axis: 'x', pos: '50%', label: 'center X', kind: 'center' });
      }
      if (snap2D.guideY) {
        lines.push({ axis: 'y', pos: '50%', label: 'center Y', kind: 'center' });
      }
      setActiveSnaps(lines);
      setState((s) => ({
        ...s,
        offsetX: Number(snap2D.x.toFixed(1)),
        offsetY: Number(snap2D.y.toFixed(1)),
      }));
    },
    onEnd: () => setActiveSnaps([]),
  });

  const radiusDrag = useStudioPointer({
    penPrecisionScale: 0.6,
    onStart: () => {
      rawRadiusRef.current = stateRef.current.innerRadius;
    },
    onMove: ({ dx, dy }) => {
      if (submitted || scenario.mode !== 'concentric-radii') return;
      const delta = (dx + dy) * 0.4;
      rawRadiusRef.current = Math.max(0, Math.min(40, rawRadiusRef.current + delta));
      const snapR = snapValue(rawRadiusRef.current, stepTargets(0, 40, 2, 'grid', 'px'), 1.1);
      setState((s) => ({
        ...s,
        innerRadius: Math.round(snapR.value),
      }));
    },
  });

  const handleSubmit = () => {
    const res = scoreL09(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      offsetX: scenario.mode === 'optical-center' ? scenario.initialX : 0,
      offsetY: scenario.mode === 'optical-center' ? scenario.initialY : 0,
      innerRadius: scenario.mode === 'concentric-radii' ? scenario.initialInnerRadius : 0,
    });
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const artboard =
    scenario.mode === 'optical-center' ? (
      <div
        className="studio-canvas-surface"
        style={{
          width: '100%',
          background: '#1C1F26',
          color: '#F1F5F9',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: 40,
          boxShadow: 'var(--shadow-artboard)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ fontSize: 13.5, color: '#94A3B8', fontWeight: 500 }}>{scenario.label}</div>

        <div
          {...shapeDrag.bind}
          style={{
            width: 220,
            height: 220,
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            cursor: submitted ? 'default' : 'move',
          }}
        >
          {!submitted && <SnapGuideOverlay lines={activeSnaps} />}
          {/* Container Shape */}
          <svg viewBox="0 0 220 220" width="220" height="220" style={{ overflow: 'visible' }}>
            {scenario.shape === 'avatar-dot' ? (
              <>
                <circle cx={110} cy={110} r={78} fill="#EFEDE6" stroke="rgba(20,20,19,0.22)" strokeWidth={2} />
                <text x={110} y={120} textAnchor="middle" fontSize="28" fontWeight="600" fill="#585650">
                  NK
                </text>
                {/* Bounding-box top-right corner is (188, 32); perimeter lies on circle */}
                <circle
                  cx={176 + (showTarget ? scenario.targetX : state.offsetX)}
                  cy={44 + (showTarget ? scenario.targetY : state.offsetY)}
                  r={14}
                  fill="#216E4E"
                  stroke="#FFFFFF"
                  strokeWidth={4}
                />
                {showGuides && (
                  <circle
                    cx={176 + scenario.targetX}
                    cy={44 + scenario.targetY}
                    r={14}
                    fill="none"
                    stroke="#D94526"
                    strokeDasharray="3 2"
                    strokeWidth={2}
                  />
                )}
              </>
            ) : (
              <>
                <circle cx={110} cy={110} r={88} fill="#141413" />
                {showGuides && (
                  <>
                    <line x1={110} y1={14} x2={110} y2={206} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
                    <line x1={14} y1={110} x2={206} y2={110} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
                  </>
                )}
                <g
                  transform={`translate(${showTarget ? scenario.targetX : state.offsetX}, ${
                    showTarget ? scenario.targetY : state.offsetY
                  })`}
                >
                  {scenario.shape === 'play' && (
                    <polygon points="86,70 86,150 156,110" fill="#F7F6F2" />
                  )}
                  {scenario.shape === 'arrow-right' && (
                    <path
                      d="M72 110 H148 M122 84 L148 110 L122 136"
                      fill="none"
                      stroke="#F7F6F2"
                      strokeWidth={11}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {scenario.shape === 'star' && (
                    <polygon
                      points="110,64 123,93 154,97 131,118 137,150 110,134 83,150 89,118 66,97 97,93"
                      fill="#F7F6F2"
                    />
                  )}
                </g>

                {showGuides && (
                  <g
                    transform={`translate(${scenario.targetX}, ${scenario.targetY})`}
                    opacity={0.55}
                  >
                    {scenario.shape === 'play' && (
                      <polygon points="86,70 86,150 156,110" fill="none" stroke="#D94526" strokeWidth={2.5} />
                    )}
                    {scenario.shape === 'arrow-right' && (
                      <path
                        d="M72 110 H148 M122 84 L148 110 L122 136"
                        fill="none"
                        stroke="#D94526"
                        strokeWidth={2.5}
                      />
                    )}
                    {scenario.shape === 'star' && (
                      <polygon
                        points="110,64 123,93 154,97 131,118 137,150 110,134 83,150 89,118 66,97 97,93"
                        fill="none"
                        stroke="#D94526"
                        strokeWidth={2.5}
                      />
                    )}
                  </g>
                )}
              </>
            )}
          </svg>
        </div>
      </div>
    ) : (
      <div
        className="studio-canvas-surface"
        style={{
          width: '100%',
          background: '#FFFFFF',
          color: '#141413',
          borderRadius: 16,
          padding: 36,
          boxShadow: 'var(--shadow-artboard)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div className="tabular" style={{ fontSize: 12.5, color: '#585650', fontWeight: 500 }}>
          Outer Radius: {scenario.outerRadius} px · Card Inset Gap: {scenario.padding} px
        </div>

        {/* Outer Container */}
        <div
          style={{
            width: '100%',
            maxWidth: 310,
            height: 210,
            borderRadius: scenario.outerRadius,
            padding: scenario.padding,
            background: '#EFEDE6',
            border: '1.5px solid #141413',
            position: 'relative',
          }}
        >
          {/* Inner Nested Card */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: showTarget ? scenario.targetInnerRadius : state.innerRadius,
              background: '#141413',
              color: '#F7F6F2',
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
            }}
          >
            <span className="tabular" style={{ fontSize: 13 }}>
              Inner Radius: {showTarget ? scenario.targetInnerRadius : state.innerRadius} px
            </span>

            {!submitted && (
              <div
                {...radiusDrag.bind}
                aria-label="Drag inner corner radius"
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: radiusDrag.isDragging ? '#0EA5E9' : '#D94526',
                  border: '2px solid #FFFFFF',
                  cursor: 'nwse-resize',
                }}
              />
            )}
          </div>

          {showGuides && (
            <div
              style={{
                position: 'absolute',
                inset: scenario.padding,
                borderRadius: scenario.targetInnerRadius,
                border: '2px dashed #216E4E',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    );

  const fineControls =
    scenario.mode === 'optical-center' ? (
      <>
        <SliderControl
          label="Optical Horizontal Nudge"
          value={state.offsetX}
          min={-20}
          max={20}
          step={0.5}
          unit=" px"
          onChange={(v) => setState((s) => ({ ...s, offsetX: v }))}
        />
        <SliderControl
          label="Optical Vertical Nudge"
          value={state.offsetY}
          min={-20}
          max={20}
          step={0.5}
          unit=" px"
          onChange={(v) => setState((s) => ({ ...s, offsetY: v }))}
        />
      </>
    ) : (
      <SliderControl
        label="Inner Corner Radius"
        value={state.innerRadius}
        min={0}
        max={40}
        step={1}
        unit=" px"
        onChange={(v) => setState((s) => ({ ...s, innerRadius: v }))}
        hint={`Concentric formula: max(0, ${scenario.outerRadius} − ${scenario.padding})`}
      />
    );

  return (
    <StudioFrame
      prompt={
        scenario.mode === 'optical-center'
          ? 'Drag the glyph directly (try the Squint Blur eye lens!) until visual ink weight feels balanced, not merely mathematically centered.'
          : 'Drag the top-left handle to eliminate pinched corners so the inner arc tracks the outer corner concentrically.'
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
      isPenActive={shapeDrag.isPenActive || radiusDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
