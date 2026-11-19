import React, { useMemo, useRef, useState } from 'react';
import { StudioFrame } from '../components/StudioShell/StudioFrame';
import { SliderControl } from '../components/StudioShell/SliderControl';
import { apcaContrast, hexToRgb, oklchToHex, wcagContrastRatio } from '../engine/colorMath';
import { ExerciseResult, OverlayMode } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { ExerciseComponentProps } from './L01WhiteSpace';
import { generateL10, L10State, scoreL10 } from './scoring/challengeScoring';

export const L10PerceptualColor: React.FC<ExerciseComponentProps> = ({
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
  const scenario = useMemo(() => generateL10(seed), [seed]);
  const [state, setState] = useState<L10State>(() => ({
    l: scenario.initialL,
    c: scenario.initialC,
    bgL: scenario.initialBgL,
  }));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('overlay');
  const padRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setState({
      l: scenario.initialL,
      c: scenario.initialC,
      bgL: scenario.initialBgL,
    });
    setSubmitted(false);
    setResult(null);
    setOverlayMode('overlay');
  }, [scenario]);

  const updateFromPad = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el || submitted) return;
    const rect = el.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    // Horizontal = Chroma (0..0.28), Vertical = Lightness (0.95..0.15)
    setState((s) => ({
      ...s,
      c: Number((nx * 0.28).toFixed(3)),
      l: Number((0.92 - ny * 0.74).toFixed(3)),
    }));
  };

  const padDrag = useStudioPointer({
    penPrecisionScale: 0.75,
    onStart: (cx, cy) => updateFromPad(cx, cy),
    onMove: ({ clientX, clientY }) => updateFromPad(clientX, clientY),
  });

  const handleSubmit = () => {
    const res = scoreL10(state, scenario);
    setResult(res);
    setSubmitted(true);
    onComplete(res);
  };

  const handleRetry = () => {
    setState({
      l: scenario.initialL,
      c: scenario.initialC,
      bgL: scenario.initialBgL,
    });
    setSubmitted(false);
    setResult(null);
  };

  const showTarget = submitted && overlayMode === 'target';
  const showGuides = submitted && (overlayMode === 'overlay' || overlayMode === 'guides');

  const view: L10State = showTarget
    ? {
        l: scenario.targetLightness,
        c: scenario.targetChroma,
        bgL: scenario.mode === 'dark-mode' ? 0.21 : 1,
      }
    : state;

  const userSwatchHex = oklchToHex({ l: view.l, c: view.c, h: scenario.targetHue });
  const targetSwatchHex = oklchToHex({
    l: scenario.targetLightness,
    c: scenario.targetChroma,
    h: scenario.targetHue,
  });

  const darkBgHex = oklchToHex({ l: view.bgL, c: 0.005, h: 260 });
  const padX = Math.min(100, (view.c / 0.28) * 100);
  const padY = Math.min(100, Math.max(0, ((0.92 - view.l) / 0.74) * 100));

  const targetPadX = Math.min(100, (scenario.targetChroma / 0.28) * 100);
  const targetPadY = Math.min(100, Math.max(0, ((0.92 - scenario.targetLightness) / 0.74) * 100));

  const artboard = (
    <div
      className="studio-canvas-surface"
      style={{
        width: '100%',
        background: '#DCDDE0',
        color: '#141518',
        borderRadius: 10,
        border: '1px solid rgba(20, 21, 24, 0.16)',
        padding: 24,
        boxShadow: 'var(--shadow-artboard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11.5,
          fontWeight: 600,
          color: '#4B4E57',
        }}
      >
        <span>Munsell Neutral-50 Surround (Colorimetric Bench)</span>
        <span className="tabular">OKLCH Hue {scenario.targetHue}°</span>
      </div>
      {/* Specimen Preview Card */}
      {scenario.mode === 'oklch-match' && (() => {
        const refRgb = hexToRgb(scenario.referenceHex);
        const refRelLum = (0.2126 * refRgb.r + 0.7152 * refRgb.g + 0.0722 * refRgb.b) / 255;
        const refInk = refRelLum < 0.45 ? '#F7F6F2' : '#141413';
        const userInk = view.l < 0.56 ? '#F7F6F2' : '#141413';
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div
              style={{
                height: 150,
                borderRadius: 12,
                background: scenario.referenceHex,
                display: 'flex',
                alignItems: 'flex-end',
                padding: 14,
                color: refInk,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Reference Luminance
            </div>
            <div
              style={{
                height: 150,
                borderRadius: 12,
                background: userSwatchHex,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: 14,
                color: userInk,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span>Your Matched Swatch</span>
              {showGuides && <span className="tabular">{userSwatchHex}</span>}
            </div>
          </div>
        );
      })()}

      {scenario.mode === 'apca-contrast' && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid rgba(20,20,19,0.12)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#848179', marginBottom: 6 }}>
            BODY TEXT READABILITY SPECIMEN (16 PX)
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: userSwatchHex, fontWeight: 500 }}>
            Good contrast prevents eye fatigue across long paragraphs without forcing pure harsh saturation.
          </p>
          {showGuides && (
            <div className="tabular" style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#216E4E' }}>
              APCA Lc: {Math.abs(apcaContrast(hexToRgb(userSwatchHex), hexToRgb('#FFFFFF')))} · WCAG:{' '}
              {wcagContrastRatio(hexToRgb(userSwatchHex), hexToRgb('#FFFFFF')).toFixed(1)}:1
            </div>
          )}
        </div>
      )}

      {scenario.mode === 'dark-mode' && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: darkBgHex,
            color: '#E6E4DE',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.07em', opacity: 0.65, fontWeight: 600 }}>
            DARKROOM ELEVATION SURFACE
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 6 }}>
            Calm Reading Without Astigmatic Halation
          </h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, opacity: 0.85, marginTop: 6 }}>
            Avoid pure #000000 grounds and radioactive accents: raise base surface lightness slightly and soften chroma.
          </p>
          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              padding: '8px 16px',
              borderRadius: 999,
              background: userSwatchHex,
              color: '#141413',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Primary Action
          </div>
        </div>
      )}

      {/* 2D Touch / Apple Pencil OKLCH Lightness × Chroma Pad */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11.5,
            color: '#585650',
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          <span>Drag on OKLCH Plane (Vertical = Lightness · Horizontal = Chroma)</span>
          {submitted && <span className="tabular">L {view.l.toFixed(2)} · C {view.c.toFixed(2)}</span>}
        </div>
        <div
          ref={padRef}
          role="application"
          aria-label="OKLCH Lightness and Chroma plane"
          {...padDrag.bind}
          style={{
            position: 'relative',
            height: 150,
            borderRadius: 12,
            overflow: 'hidden',
            cursor: submitted ? 'default' : 'crosshair',
            border: '1px solid rgba(20,20,19,0.16)',
            background: `linear-gradient(to bottom, #FFFFFF 0%, transparent 50%, #111111 100%),
                         linear-gradient(to right, #8A8A88 0%, ${oklchToHex({ l: 0.65, c: 0.25, h: scenario.targetHue })} 100%)`,
          }}
        >
          {/* User Reticle */}
          <div
            style={{
              position: 'absolute',
              left: `${padX}%`,
              top: `${padY}%`,
              transform: 'translate(-50%, -50%)',
              width: 22,
              height: 22,
              borderRadius: 999,
              background: userSwatchHex,
              border: '2.5px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
              pointerEvents: 'none',
            }}
          />

          {/* Target Reticle Overlay */}
          {showGuides && (
            <div
              style={{
                position: 'absolute',
                left: `${targetPadX}%`,
                top: `${targetPadY}%`,
                transform: 'translate(-50%, -50%)',
                width: 24,
                height: 24,
                borderRadius: 999,
                background: targetSwatchHex,
                border: '2.5px dashed #216E4E',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const fineControls = (
    <>
      <SliderControl
        label="OKLCH Lightness (L)"
        value={state.l}
        min={0.18}
        max={0.92}
        step={0.01}
        formatValue={(v) => v.toFixed(2)}
        onChange={(v) => setState((s) => ({ ...s, l: v }))}
      />
      <SliderControl
        label="OKLCH Chroma (C)"
        value={state.c}
        min={0}
        max={0.28}
        step={0.01}
        formatValue={(v) => v.toFixed(2)}
        onChange={(v) => setState((s) => ({ ...s, c: v }))}
      />
      {scenario.mode === 'dark-mode' && (
        <SliderControl
          label="Dark Surface Ground (L)"
          value={state.bgL}
          min={0}
          max={0.34}
          step={0.01}
          formatValue={(v) => `${oklchToHex({ l: v, c: 0.005, h: 260 })} (L ${v.toFixed(2)})`}
          onChange={(v) => setState((s) => ({ ...s, bgL: v }))}
          hint="Target dark gray elevation (#121212–#1F1F23 ≈ L 0.18–0.24), never pure #000000."
        />
      )}
    </>
  );

  return (
    <StudioFrame
      prompt={
        scenario.mode === 'oklch-match'
          ? 'Drag on the OKLCH plane so the cool swatch matches the perceived brightness of the reference swatch (try the Grayscale lens to verify).'
          : scenario.mode === 'apca-contrast'
            ? 'Adjust lightness and chroma on the OKLCH plane until the 16 px body copy reads effortlessly above APCA Lc 75.'
            : 'Calibrate this Dark Mode card: raise the pure black ground in Fine Sliders to eliminate halation and desaturate the glowing accent.'
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
      isPenActive={padDrag.isPenActive}
      artboard={artboard}
      fineControls={fineControls}
    />
  );
};
