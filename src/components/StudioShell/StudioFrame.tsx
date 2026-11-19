import React, { useState } from 'react';
import { Check, EyeOff, Palette, PenTool, X } from 'lucide-react';
import { ExerciseResult, EyeLens, OverlayMode } from '../../engine/types';
import { FineTuneDialIcon } from '../Icons/CraftIcons';
import { EyeLensBar } from './EyeLensBar';
import { RevealDrawer } from './RevealDrawer';

interface StudioFrameProps {
  prompt: string;
  styleWorld?: string;
  styleRef?: string;
  availableLenses: EyeLens[];
  activeLenses: Set<EyeLens>;
  onToggleLens: (lens: EyeLens) => void;
  submitted: boolean;
  result: ExerciseResult | null;
  overlayMode: OverlayMode;
  onChangeOverlayMode: (mode: OverlayMode) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onNewSeed: () => void;
  onNextLesson?: () => void;
  nextLabel?: string;
  railSide: 'right' | 'left';
  isPenActive?: boolean;
  /** Direct interactive artboard JSX */
  artboard: React.ReactNode;
  /** Optional pop-out fine-tuning sliders rendered inside the collapsible rail / drawer */
  fineControls?: React.ReactNode;
  /** Optional header action (e.g. 2s Recall Flash or 60s Ragtime toggle) */
  stageAction?: React.ReactNode;
}

export const StudioFrame: React.FC<StudioFrameProps> = ({
  prompt,
  styleWorld,
  styleRef,
  availableLenses,
  activeLenses,
  onToggleLens,
  submitted,
  result,
  overlayMode,
  onChangeOverlayMode,
  onSubmit,
  onRetry,
  onNewSeed,
  onNextLesson,
  nextLabel,
  railSide,
  isPenActive,
  artboard,
  fineControls,
  stageAction,
}) => {
  const [popoutOpen, setPopoutOpen] = useState(false);

  const lensFilterStyle: React.CSSProperties = {
    filter:
      [
        activeLenses.has('blur') ? 'blur(3.5px)' : '',
        activeLenses.has('grayscale') ? 'grayscale(100%)' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    transform: activeLenses.has('flip') ? 'scaleX(-1)' : undefined,
    transition: 'filter 160ms ease, transform 160ms ease',
  };

  return (
    <div
      className={`studio-workspace has-rail ${railSide === 'left' ? 'rail-left' : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Main Artboard Stage */}
      <div className="studio-stage">
        {/* Design World Context + Task Prompt */}
        <div
          style={{
            width: '100%',
            maxWidth: 760,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {styleWorld && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                <Palette size={13} aria-hidden="true" />
                <span>{styleWorld}</span>
                {styleRef && (
                  <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>
                    ({styleRef})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isPenActive && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11.5,
                      padding: '3px 9px',
                      borderRadius: 6,
                      background: 'var(--bg-subtle)',
                      color: 'var(--ink-secondary)',
                      border: '1px solid var(--rule)',
                    }}
                  >
                    <PenTool size={12} strokeWidth={1.75} aria-hidden="true" />
                    <span>Apple Pencil 0.5×</span>
                  </span>
                )}
                {stageAction}
              </div>
            </div>
          )}

          <p
            style={{
              fontSize: 14,
              color: 'var(--ink-primary)',
              lineHeight: 1.45,
              maxWidth: '64ch',
            }}
          >
            {prompt}
          </p>
        </div>

        {/* Center Interactive Artboard */}
        <div
          style={{
            width: '100%',
            maxWidth: 760,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div style={{ width: '100%', ...lensFilterStyle }}>{artboard}</div>
        </div>

        {/* Bottom Floating Studio Dock: Eye Lenses + Pop-out Fine Tune Trigger */}
        <div
          style={{
            width: '100%',
            maxWidth: 760,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <EyeLensBar
            availableLenses={availableLenses}
            activeLenses={activeLenses}
            onToggleLens={onToggleLens}
          />

          {!submitted && fineControls && (
            <button
              type="button"
              onClick={() => setPopoutOpen((o) => !o)}
              aria-expanded={popoutOpen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                minHeight: 44,
                padding: '0 14px',
                borderRadius: 10,
                background: popoutOpen ? 'var(--ink-primary)' : 'var(--bg-surface)',
                color: popoutOpen ? 'var(--bg-surface)' : 'var(--ink-primary)',
                border: '1px solid var(--rule-strong)',
                boxShadow: 'var(--shadow-tactile)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <FineTuneDialIcon size={16} />
              <span>{popoutOpen ? 'Hide Fine Sliders' : 'Fine Sliders'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Side Rail (Landscape) / Bottom Bar (Portrait) */}
      <aside className="studio-rail" aria-label="Studio controls and critique">
        {!submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOff size={15} color="var(--ink-muted)" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Blind Practice
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)' }}>
                    Score stays hidden until you check
                  </div>
                </div>
              </div>
              {popoutOpen && (
                <button
                  type="button"
                  aria-label="Close fine controls"
                  onClick={() => setPopoutOpen(false)}
                  style={{ padding: 6, color: 'var(--ink-muted)' }}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            {fineControls && (
              <div
                style={{
                  display: popoutOpen ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: 16,
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--rule)',
                }}
              >
                {fineControls}
              </div>
            )}

            {!popoutOpen && fineControls && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: '1px dashed var(--rule-strong)',
                  fontSize: 13,
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.45,
                }}
              >
                Manipulate elements directly on the specimen with finger or Apple Pencil, or open{' '}
                <button
                  type="button"
                  onClick={() => setPopoutOpen(true)}
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  Fine Sliders
                </button>{' '}
                for micro-adjustments.
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <button
                type="button"
                onClick={onSubmit}
                className="touch-target"
                style={{
                  width: '100%',
                  minHeight: 48,
                  borderRadius: 10,
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  fontSize: 14.5,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 3px 0 rgba(17, 19, 23, 0.2)',
                }}
              >
                <Check size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>Check Evaluation</span>
              </button>
            </div>
          </div>
        ) : (
          result && (
            <RevealDrawer
              result={result}
              overlayMode={overlayMode}
              onChangeOverlayMode={onChangeOverlayMode}
              onRetry={onRetry}
              onNewSeed={onNewSeed}
              onNextLesson={onNextLesson}
              nextLabel={nextLabel}
            />
          )
        )}
      </aside>
    </div>
  );
};
