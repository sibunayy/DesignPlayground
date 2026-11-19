import React, { useState } from 'react';
import { Check, PenTool, SlidersHorizontal, X } from 'lucide-react';
import { ExerciseResult, EyeLens, OverlayMode } from '../../engine/types';
import { EyeLensBar } from './EyeLensBar';
import { RevealDrawer } from './RevealDrawer';

interface StudioFrameProps {
  prompt: string;
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
    filter: [
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
        {/* Top prompt bar — clean editorial task caption */}
        <div
          style={{
            width: '100%',
            maxWidth: 740,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink-secondary)',
              lineHeight: 1.4,
              maxWidth: '58ch',
            }}
          >
            {prompt}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPenActive && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11.5,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--bg-subtle)',
                  color: 'var(--ink-secondary)',
                  border: '1px solid var(--rule)',
                }}
              >
                <PenTool size={12} strokeWidth={1.75} />
                <span>Pencil Fine</span>
              </span>
            )}
            {stageAction}
          </div>
        </div>

        {/* Center Interactive Artboard */}
        <div
          style={{
            width: '100%',
            maxWidth: 740,
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
            maxWidth: 740,
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
                minHeight: 42,
                padding: '0 14px',
                borderRadius: 999,
                background: popoutOpen ? 'var(--ink-primary)' : 'var(--bg-surface)',
                color: popoutOpen ? 'var(--bg-surface)' : 'var(--ink-primary)',
                border: '1px solid var(--rule)',
                boxShadow: 'var(--shadow-float)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              <span>{popoutOpen ? 'Hide Fine Sliders' : 'Fine Sliders'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Side Rail (Landscape) / Bottom Bar (Portrait) */}
      <aside className="studio-rail" aria-label="Studio controls and critique">
        {!submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-muted)',
                    fontWeight: 600,
                  }}
                >
                  Attempt Mode
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 2 }}>
                  Score stays hidden until submission
                </div>
              </div>
              {popoutOpen && (
                <button
                  type="button"
                  aria-label="Close fine controls"
                  onClick={() => setPopoutOpen(false)}
                  style={{ padding: 6, color: 'var(--ink-muted)' }}
                >
                  <X size={16} />
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
                  borderRadius: 12,
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
                  borderRadius: 12,
                  border: '1px dashed var(--rule-strong)',
                  fontSize: 13,
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.45,
                }}
              >
                Drag directly on the artboard with finger or Apple Pencil, or tap{' '}
                <button
                  type="button"
                  onClick={() => setPopoutOpen(true)}
                  style={{
                    color: 'var(--ink-primary)',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                >
                  Fine Sliders
                </button>{' '}
                for exact numeric nudges.
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
                  borderRadius: 12,
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  fontSize: 14.5,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(217, 69, 38, 0.22)',
                }}
              >
                <Check size={17} strokeWidth={2} />
                <span>Submit Evaluation</span>
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
