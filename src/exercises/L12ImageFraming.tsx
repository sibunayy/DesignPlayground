import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { CropRect, generateL12, L12State, scoreL12 } from './scoring/challengeScoring';

export const L12ImageFraming: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL12(seed), [seed]);
  const [state, setState] = useState<L12State>(() => ({
    crop: { ...scenario.initialCrop },
    rotationDeg: 0,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const stageRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setState({ crop: { ...scenario.initialCrop }, rotationDeg: 0 });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  // Keep crop aspect ratio locked proportionally to natural photo dims
  const photoRatio = scenario.photo.naturalWidth / scenario.photo.naturalHeight;
  const normHeightForWidth = (normW: number) =>
    Math.min(0.95, Math.max(0.22, (normW * photoRatio) / scenario.aspectRatio));

  const clampCrop = (c: CropRect): CropRect => {
    const w = Math.max(0.28, Math.min(0.92, c.w));
    const h = normHeightForWidth(w);
    const x = Math.max(0, Math.min(1 - w, c.x));
    const y = Math.max(0, Math.min(1 - h, c.y));
    return { x, y, w, h };
  };

  const panDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onMove: ({ dx, dy }) => {
      if (submitted || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const nx = dx / rect.width;
      const ny = dy / rect.height;
      setState((s) => ({
        ...s,
        crop: clampCrop({
          ...s.crop,
          x: s.crop.x + nx,
          y: s.crop.y + ny,
        }),
      }));
    },
  });

  const resizeDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onMove: ({ dx }) => {
      if (submitted || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const nw = dx / rect.width;
      setState((s) => ({
        ...s,
        crop: clampCrop({
          ...s.crop,
          w: s.crop.w + nw,
        }),
      }));
    },
  });

  const handleSubmit = () => {
    const res = scoreL12(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({ crop: { ...scenario.initialCrop }, rotationDeg: 0 });
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');
  const activeCrop = showTarget ? scenario.idealCrop : state.crop;
  const displayTilt = showTarget ? 0 : scenario.initialTiltDeg + state.rotationDeg;

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#FFFFFF',
        color: '#141413',
        borderRadius: 16,
        padding: 20,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#585650',
          fontWeight: 500,
        }}
      >
        <span>{scenario.photo.title}</span>
        <span>Target Aspect: {scenario.aspectLabel}</span>
      </div>

      {/* Photo Stage */}
      <div
        ref={stageRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: scenario.photo.kind === 'architecture' ? 620 : 380,
          aspectRatio: `${scenario.photo.naturalWidth} / ${scenario.photo.naturalHeight}`,
          overflow: 'hidden',
          borderRadius: 10,
          background: '#1C1B19',
        }}
      >
        <img
          src={scenario.photo.url}
          alt={scenario.photo.title}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            transform: `rotate(${displayTilt}deg) scale(${Math.abs(displayTilt) > 0.2 ? 1.07 : 1})`,
            transition: submitted ? 'transform 200ms ease' : undefined,
          }}
        />

        {/* Dim Mask Outside Active Crop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(14, 14, 13, 0.56)',
            clipPath: `polygon(
              0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
              ${activeCrop.x * 100}% ${activeCrop.y * 100}%,
              ${activeCrop.x * 100}% ${(activeCrop.y + activeCrop.h) * 100}%,
              ${(activeCrop.x + activeCrop.w) * 100}% ${(activeCrop.y + activeCrop.h) * 100}%,
              ${(activeCrop.x + activeCrop.w) * 100}% ${activeCrop.y * 100}%,
              ${activeCrop.x * 100}% ${activeCrop.y * 100}%
            )`,
            pointerEvents: 'none',
          }}
        />

        {/* Anatomical Joint Danger Bands & Ideal Frame (Reveal Only) */}
        {showGuides && (
          <>
            {scenario.photo.joints.map((j) => (
              <div
                key={j.label}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${j.y * 100}%`,
                  height: 2,
                  background: 'rgba(217, 69, 38, 0.72)',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: -15,
                    fontSize: 9.5,
                    fontWeight: 700,
                    background: '#D94526',
                    color: '#FFFFFF',
                    padding: '1px 5px',
                    borderRadius: 3,
                  }}
                >
                  Joint: {j.label}
                </span>
              </div>
            ))}

            {/* Ideal Frame Overlay */}
            <div
              style={{
                position: 'absolute',
                left: `${scenario.idealCrop.x * 100}%`,
                top: `${scenario.idealCrop.y * 100}%`,
                width: `${scenario.idealCrop.w * 100}%`,
                height: `${scenario.idealCrop.h * 100}%`,
                border: '2px dashed #4CA97E',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Active Draggable Crop Box */}
        <div
          {...panDrag.bind}
          style={{
            position: 'absolute',
            left: `${activeCrop.x * 100}%`,
            top: `${activeCrop.y * 100}%`,
            width: `${activeCrop.w * 100}%`,
            height: `${activeCrop.h * 100}%`,
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
            cursor: submitted ? 'default' : 'move',
          }}
        >
          {/* Rule-of-thirds Hairlines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.32)' }} />
            <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.32)' }} />
            <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.38)' }} />
            <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.32)' }} />
          </div>

          {/* Bottom-right Scale Handle */}
          {!submitted && (
            <div
              {...resizeDrag.bind}
              aria-label="Resize crop frame"
              style={{
                position: 'absolute',
                right: -12,
                bottom: -12,
                width: 30,
                height: 30,
                borderRadius: 999,
                background: '#D94526',
                border: '2.5px solid #FFFFFF',
                cursor: 'nwse-resize',
              }}
            />
          )}
        </div>
      </div>

      {/* Tactile Horizon Level Bar */}
      {scenario.initialTiltDeg !== 0 && (
        <div style={{ width: '100%', maxWidth: 420 }}>
          <SliderControl
            label="Level Horizon"
            value={state.rotationDeg}
            min={-6}
            max={6}
            step={0.5}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}°`}
            onChange={(v) => setState((s) => ({ ...s, rotationDeg: v }))}
          />
        </div>
      )}
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="Crop Width"
        value={Math.round(state.crop.w * 100)}
        min={28}
        max={92}
        unit="%"
        onChange={(v) => setState((s) => ({ ...s, crop: clampCrop({ ...s.crop, w: v / 100 }) }))}
      />
      <SliderControl
        label="Horizontal Position"
        value={Math.round(state.crop.x * 100)}
        min={0}
        max={72}
        unit="%"
        onChange={(v) => setState((s) => ({ ...s, crop: clampCrop({ ...s.crop, x: v / 100 }) }))}
      />
      <SliderControl
        label="Vertical Position"
        value={Math.round(state.crop.y * 100)}
        min={0}
        max={72}
        unit="%"
        onChange={(v) => setState((s) => ({ ...s, crop: clampCrop({ ...s.crop, y: v / 100 }) }))}
      />
    </>
  );

  return (
    <StudioFrame
      prompt="Drag the frame and bottom-right resize dot to eliminate joint amputations and edge tangents, preserve breathing headroom, and align eyes along the upper third."
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
      isPenActive={panDrag.isPenActive || resizeDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
