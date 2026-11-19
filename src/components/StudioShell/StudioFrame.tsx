import React, { useState } from 'react';
import { Check, EyeOff, Hand, Maximize2, Palette, PenTool, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ExerciseResult, EyeLens, OverlayMode } from '../../engine/types';
import { useStudioPointer } from '../../hooks/useStudioPointer';
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
  /** Optional pop-out fine-tuning sliders rendered inside the collapsible rail / mobile sheet */
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
  const [handMode, setHandMode] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [mobileLensesOpen, setMobileLensesOpen] = useState(false);

  // Canvas Hand-Panning (works on empty canvas backdrop OR anywhere when Hand Mode is active)
  const canvasPanDrag = useStudioPointer({
    penPrecisionScale: 1,
    ignoreInteractiveChildren: true,
    onMove: ({ dx, dy }) => {
      setPan((prev) => ({
        x: Math.max(-260, Math.min(260, prev.x + dx)),
        y: Math.max(-220, Math.min(220, prev.y + dy)),
      }));
    },
  });

  const resetCanvasView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHandMode(false);
  };

  const isViewModified = pan.x !== 0 || pan.y !== 0 || zoom !== 1;

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
      {/* Main Artboard Stage — touch-pannable around the canvas or anywhere in Hand mode */}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  flexWrap: 'wrap',
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                    <span>Pencil 0.5×</span>
                  </span>
                )}
                {stageAction}
              </div>
            </div>
          )}

          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink-primary)',
              lineHeight: 1.45,
              maxWidth: '64ch',
            }}
          >
            {prompt}
          </p>
        </div>

        {/* Pan & Zoomable Interactive Artboard Viewport */}
        <div
          {...canvasPanDrag.bind}
          style={{
            width: '100%',
            maxWidth: 760,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            padding: 4,
            cursor: handMode ? (canvasPanDrag.isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <div
            style={{
              width: '100%',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: canvasPanDrag.isDragging ? 'none' : 'transform 140ms ease',
            }}
          >
            <div style={{ width: '100%', ...lensFilterStyle }}>{artboard}</div>
          </div>

          {/* Hand Pan Shield when Hand Mode is explicitly toggled ON so touching anywhere pans the canvas */}
          {handMode && (
            <div
              {...canvasPanDrag.bind}
              aria-label="Pan canvas by hand"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 38,
                cursor: canvasPanDrag.isDragging ? 'grabbing' : 'grab',
                background: 'rgba(29, 78, 216, 0.04)',
                border: '2px dashed var(--accent)',
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 10,
                  padding: '3px 8px',
                  borderRadius: 5,
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Hand Pan Active — Drag anywhere to move canvas
              </span>
            </div>
          )}
        </div>

        {/* Tablet / Desktop Floating Studio Dock */}
        <div className="desktop-studio-dock">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <EyeLensBar
              availableLenses={availableLenses}
              activeLenses={activeLenses}
              onToggleLens={onToggleLens}
            />

            {/* Hand Pan + Zoom Controls */}
            <div
              role="group"
              aria-label="Canvas hand pan and zoom"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: 4,
                borderRadius: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule-strong)',
                boxShadow: 'var(--shadow-tactile)',
              }}
            >
              <button
                type="button"
                aria-pressed={handMode}
                aria-label="Toggle canvas hand pan"
                onClick={() => setHandMode((h) => !h)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  minHeight: 36,
                  padding: '0 10px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  background: handMode ? 'var(--accent)' : 'transparent',
                  color: handMode ? 'var(--accent-ink)' : 'var(--ink-secondary)',
                }}
              >
                <Hand size={14} aria-hidden="true" />
                <span>Hand</span>
              </button>
              <button
                type="button"
                aria-label="Zoom out canvas"
                onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
                style={{ width: 34, height: 36, display: 'grid', placeItems: 'center', color: 'var(--ink-secondary)' }}
              >
                <ZoomOut size={14} aria-hidden="true" />
              </button>
              <span className="tabular" style={{ fontSize: 11.5, minWidth: 38, textAlign: 'center', color: 'var(--ink-muted)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Zoom in canvas"
                onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                style={{ width: 34, height: 36, display: 'grid', placeItems: 'center', color: 'var(--ink-secondary)' }}
              >
                <ZoomIn size={14} aria-hidden="true" />
              </button>
              {isViewModified && (
                <button
                  type="button"
                  aria-label="Reset canvas pan and zoom"
                  onClick={resetCanvasView}
                  style={{ width: 34, height: 36, display: 'grid', placeItems: 'center', color: 'var(--accent)' }}
                >
                  <Maximize2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

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

      {/* Collapsible Side Rail (Landscape Tablet/Desktop) / Critique Drawer (Portrait & Mobile Post-Submit) */}
      <aside
        className={`studio-rail ${!submitted ? 'is-attempting' : ''}`}
        aria-label="Studio controls and critique"
      >
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
                Drag objects directly with finger or Apple Pencil (snaps to alignment guides), or open{' '}
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
                for exact tuning.
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

      {/* Dedicated Mobile Sticky Thumb Bar (< 768px) */}
      {!submitted && (
        <div className="mobile-sticky-bar">
          {popoutOpen && fineControls && (
            <div
              style={{
                maxHeight: '34dvh',
                overflowY: 'auto',
                padding: '12px 12px',
                borderRadius: 10,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {fineControls}
            </div>
          )}

          {mobileLensesOpen && availableLenses.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <EyeLensBar
                availableLenses={availableLenses}
                activeLenses={activeLenses}
                onToggleLens={onToggleLens}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              aria-pressed={handMode}
              aria-label="Toggle canvas hand pan"
              onClick={() => setHandMode((h) => !h)}
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: '0 10px',
                borderRadius: 9,
                border: '1px solid var(--rule-strong)',
                background: handMode ? 'var(--ink-primary)' : 'var(--bg-paper)',
                color: handMode ? 'var(--bg-surface)' : 'var(--ink-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Hand size={16} aria-hidden="true" />
            </button>

            {availableLenses.length > 0 && (
              <button
                type="button"
                aria-expanded={mobileLensesOpen}
                onClick={() => setMobileLensesOpen((v) => !v)}
                style={{
                  minHeight: 44,
                  padding: '0 12px',
                  borderRadius: 9,
                  border: '1px solid var(--rule-strong)',
                  background: mobileLensesOpen ? 'var(--ink-primary)' : 'var(--bg-paper)',
                  color: mobileLensesOpen ? 'var(--bg-surface)' : 'var(--ink-primary)',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Lenses
              </button>
            )}

            {fineControls && (
              <button
                type="button"
                aria-expanded={popoutOpen}
                onClick={() => setPopoutOpen((v) => !v)}
                style={{
                  minHeight: 44,
                  padding: '0 12px',
                  borderRadius: 9,
                  border: '1px solid var(--rule-strong)',
                  background: popoutOpen ? 'var(--ink-primary)' : 'var(--bg-paper)',
                  color: popoutOpen ? 'var(--bg-surface)' : 'var(--ink-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <FineTuneDialIcon size={15} />
                <span>Sliders</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSubmit}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 9,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                fontSize: 14,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Check size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>Check</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
