import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Challenge, UNITS_PER_SQUARE } from '../logic/challenge';
import { useElementWidth } from '../state/useElementWidth';
import { AssistId, Assists, Mode } from '../types';
import { HandleReview } from '../logic/scoring';
import { FinePopout } from './FinePopout';
import { ASSIST_LABELS, DpIcon } from './Icons';
import type { Tip } from '../content/tips';
import { fontLines, textWidthEm } from '../logic/kern';
import { KernWord } from './KernWord';
import { TipStrip } from './TipStrip';
import { useHandles } from './useHandles';

interface StageProps {
  mode: Mode;
  challenge: Challenge;
  values: number[];
  assists: Assists;
  /** The handle the fine control acts on. */
  selected: number;
  fineOpen: boolean;
  /** Where the learner is in the run, such as "2 of 6". */
  counter: string;
  onSelect: (index: number) => void;
  onChange: (index: number, value: number) => void;
  onToggleAssist: (id: AssistId) => void;
  onToggleFine: () => void;
  onLockIn: () => void;
  /** Review: the answer is locked. Handles do not move and the review shows in place of the foot. */
  locked?: boolean;
  /** Review, kerning: the ideal values drawn as an outline. */
  ghost?: number[];
  /** Review, kerning: show only the ideal word. */
  ghostOnly?: boolean;
  marks?: HandleReview[];
  /** Kerning with pinned ends: sets every value at once, because moving one letter changes two gaps. */
  onChangeAll?: (values: number[]) => void;
  /** The lesson shown above the work, and whether it is open. */
  tip?: Tip;
  tipsOpen?: boolean;
  onToggleTips?: () => void;
  children?: React.ReactNode;
}

/** Width each mode needs at full size. The stage scales down below it. */
const DESIGN_WIDTH: Record<Mode['id'], number> = {
  kerning: 1040,
  tracking: 900,
  leading: 1000,
  wordspace: 1000,
  measure: 1000,
  paragraph: 1000,
  margins: 900,
};

/** Breathing room kept inside the canvas on each side of the stage content. */
const CANVAS_MARGIN = 16;

export const Stage: React.FC<StageProps> = ({
  mode,
  challenge,
  values,
  assists,
  selected,
  fineOpen,
  counter,
  onSelect,
  onChange,
  onToggleAssist,
  onToggleFine,
  onLockIn,
  locked,
  ghost,
  ghostOnly,
  marks,
  onChangeAll,
  tip,
  tipsOpen = true,
  onToggleTips,
  children,
}) => {
  const { exercise, parts } = challenge;
  // Measure the canvas, not the stage: the lesson drawer takes padding from the stage,
  // so the stage width overstates the room the text really has.
  const ref = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref, 800);
  const inner = Math.max(200, width - CANVAS_MARGIN * 2);

  // A word's width depends on its letters, so Kerning works its design width out from the word.
  const designWidth =
    mode.id === 'kerning'
      ? parts.length * 0.66 * exercise.size + (parts.length - 1) * 0.1 * exercise.size
      : mode.id === 'leading' || mode.id === 'paragraph'
        ? exercise.width ?? DESIGN_WIDTH[mode.id]
        : DESIGN_WIDTH[mode.id];
  const scale = Math.min(1, inner / designWidth);
  // Stage text never drops below 16px. Wrapping text wraps more instead.
  const wraps = mode.id === 'leading' || mode.id === 'paragraph' || mode.id === 'margins';
  // Kerning fills the stage: the word is sized so that its own width is most of the canvas, up to a
  // height limit. The word keeps its width while the learner works (pinned ends), so the size is steady.
  const pinned = mode.id === 'kerning' && Boolean(challenge.pinned);
  const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const kernEm =
    mode.id === 'kerning'
      ? (challenge.font ? textWidthEm(challenge.font, exercise.text) : parts.length * 0.64) + challenge.start.reduce((a, b) => a + b, 0) / 1000
      : 1;
  const kernMax = locked ? viewH * 0.26 : Math.min(viewH * 0.42, 440);
  const fontSize =
    mode.id === 'kerning'
      ? Math.max(16, Math.min(kernMax, (inner * 0.94) / Math.max(1, kernEm)))
      : Math.max(16, exercise.size * scale);
  const blur = assists.blur && mode.assists.includes('blur') ? `blur(${Math.max(1.5, fontSize * 0.03)}px)` : undefined;

  // Kerning: one grid cell is 0.1 em at the current word size.
  const cell = mode.id === 'kerning' ? (UNITS_PER_SQUARE * fontSize) / 1000 : 40 * Math.max(0.6, scale);
  // In kerning the Grid tool draws the type's guide lines (ascender, x-height, baseline) in place of squares.
  const showGrid = mode.id !== 'kerning' && assists.grid && mode.assists.includes('grid');

  // With one handle there is nothing to choose between, so none is shown as selected.
  const liveBind = useHandles(values, challenge.min, challenge.max, onChange, onSelect, values.length > 1 && !locked ? selected : -1);
  // A locked answer keeps its slider names for screen readers, but nothing moves.
  const bind: typeof liveBind = locked
    ? (index, o) => ({ ...liveBind(index, o), onPointerDown: undefined, onPointerMove: undefined, onKeyDown: undefined, 'aria-readonly': true } as unknown as ReturnType<typeof liveBind>)
    : liveBind;
  const step = challenge.fine.step;

  // Pinned ends: the handles are the letters between the first and last. Letter k+1 sits at the sum of
  // the gaps before it, and moving it by d opens the gap before it by d and closes the gap after it by d.
  const positions = useMemo(
    () => (pinned ? parts.slice(1, -1).map((_, k) => values.slice(0, k + 1).reduce((a, b) => a + b, 0)) : []),
    [pinned, parts, values]
  );
  const moveLetter = (k: number, v: number) => {
    if (!onChangeAll || k < 0 || k >= positions.length) return;
    const lo = Math.max(challenge.min - values[k], values[k + 1] - challenge.max);
    const hi = Math.min(challenge.max - values[k], values[k + 1] - challenge.min);
    const d = Math.min(hi, Math.max(lo, v - positions[k]));
    if (d === 0) return;
    const next = values.slice();
    next[k] += d;
    next[k + 1] -= d;
    onChangeAll(next);
  };
  const liveLetters = useHandles(positions, -4000, 4000, moveLetter, onSelect, pinned && !locked ? selected : -1);
  const letterBind = (i: number) => {
    const props = liveLetters(i - 1, { axis: 'x', perPx: 1000 / fontSize, label: `Letter ${parts[i]}`, step });
    return locked
      ? ({ ...props, onPointerDown: undefined, onPointerMove: undefined, onKeyDown: undefined, 'aria-readonly': true } as Record<string, unknown>)
      : (props as unknown as Record<string, unknown>);
  };
  // Pressing a pinned letter says why it does not move.
  const [pinNote, setPinNote] = useState(false);
  const pinTimer = useRef<number | undefined>(undefined);
  const onPinnedPress = () => {
    setPinNote(true);
    window.clearTimeout(pinTimer.current);
    pinTimer.current = window.setTimeout(() => setPinNote(false), 1800);
  };
  useEffect(() => () => window.clearTimeout(pinTimer.current), []);

  let canvas: React.ReactNode;
  switch (mode.id) {
    case 'kerning': {
      // Every letter after the first is a handle. Dragging it opens or closes the gap before it.
      // The word is anchored at its left edge, so a letter moves by the full change in its gap.
      // One pixel of drag is one pixel of movement: the letter stays under the pointer.
      canvas = (
        <KernWord
          letters={parts}
          gapHandle={parts.slice(1).map((_, i) => i)}
          values={values}
          fontSize={fontSize}
          font={challenge.font}
          bind={bind as never}
          letterBind={pinned ? letterBind : undefined}
          onPinnedPress={pinned ? onPinnedPress : undefined}
          lines={assists.grid && challenge.font ? fontLines(challenge.font) : undefined}
          perPx={1000 / fontSize}
          anchor={`${challenge.seed}:${parts.join('')}:${challenge.font?.id ?? ''}:${challenge.start.join(',')}`}
          labels={challenge.labels}
          step={step}
          guides={assists.guides}
          ghost={ghost}
          ghostOnly={ghostOnly}
          marks={marks}
          label={`The word ${exercise.text}`}
          className={ghostOnly ? 'dp-kw--ideal' : undefined}
          style={{ filter: blur }}
        />
      );
      break;
    }
    case 'tracking': {
      const lineStyle: React.CSSProperties = { fontSize, letterSpacing: `${(values[0] ?? 0) / 1000}em` };
      const ghostStyle: React.CSSProperties = { fontSize, opacity: assists.compare ? 0.35 : 0 };
      // The line is centred, so its edge moves by half of any change in width.
      const perPx = 2000 / (fontSize * exercise.text.length);
      canvas = (
        <div className="dp-overlay">
          <div aria-hidden="true" className="dp-stage-line dp-ghost" style={ghostStyle}>
            {exercise.text}
          </div>
          <div
            className="dp-stage-line dp-grab"
            style={{ ...lineStyle, filter: blur }}
            {...bind(0, { axis: 'x', perPx, label: challenge.labels[0], step })}
          >
            {exercise.text}
          </div>
        </div>
      );
      break;
    }
    case 'wordspace': {
      const perPx = 2000 / fontSize;
      const ghostStyle: React.CSSProperties = {
        fontSize,
        letterSpacing: exercise.caps ? '0.12em' : undefined,
        opacity: assists.compare ? 0.35 : 0,
      };
      canvas = (
        <div className="dp-overlay">
          <div aria-hidden="true" className="dp-stage-line dp-ghost" style={ghostStyle}>
            {exercise.text}
          </div>
          <div
            role="group"
            aria-label={exercise.label}
            className="dp-stage-line"
            style={{ fontSize, letterSpacing: exercise.caps ? '0.12em' : undefined, filter: blur }}
          >
            {parts.map((w, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span aria-hidden="true" style={{ whiteSpace: 'pre', wordSpacing: `${(values[i - 1] ?? 0) / 1000}em` }}>
                    {' '}
                  </span>
                )}
                <span
                  className={`dp-word${i > 0 ? ' dp-grab' : ''}`}
                  {...(i > 0
                    ? bind(i - 1, { axis: 'x', perPx, label: challenge.labels[i - 1], step })
                    : { 'aria-hidden': true })}
                >
                  {w}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );
      break;
    }
    case 'leading': {
      const value = values[0] ?? 100;
      const lineHeightPx = (fontSize * value) / 100;
      const guides = assists.guides
        ? `repeating-linear-gradient(to bottom, transparent 0, transparent ${lineHeightPx - 2}px, var(--accent) ${
            lineHeightPx - 2
          }px, var(--accent) ${lineHeightPx}px)`
        : undefined;
      // The block is centred, so its bottom edge moves by half of any change in height.
      const perPx = () => {
        const lines = Math.max(1, Math.round((blockRef.current?.getBoundingClientRect().height ?? lineHeightPx) / lineHeightPx));
        return 200 / (lines * fontSize);
      };
      canvas = (
        <div
          ref={blockRef}
          className="dp-grab dp-grab--block"
          style={{
            width: (exercise.width ?? 1000) * scale,
            maxWidth: '100%',
            fontSize,
            fontWeight: 800,
            lineHeight: value / 100,
            backgroundImage: guides,
            filter: blur,
          }}
          {...bind(0, { axis: 'y', perPx, label: challenge.labels[0], step })}
        >
          {exercise.text}
        </div>
      );
      break;
    }
    case 'paragraph': {
      const LINE_HEIGHT = 1.45;
      const lineHeightPx = fontSize * LINE_HEIGHT;
      const perPx = 200 / lineHeightPx;
      canvas = (
        <div
          role="group"
          aria-label={exercise.label}
          style={{
            width: (exercise.width ?? 1000) * scale,
            maxWidth: '100%',
            fontSize,
            fontWeight: 400,
            lineHeight: LINE_HEIGHT,
            filter: blur,
          }}
        >
          {parts.map((para, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    height: (lineHeightPx * (values[i - 1] ?? 0)) / 100,
                    borderRadius: 4,
                    background: assists.guides ? 'var(--accent-tint)' : undefined,
                  }}
                />
              )}
              <p
                className={i > 0 ? 'dp-grab dp-grab--block' : undefined}
                style={{ textIndent: exercise.indent && i > 0 ? '2em' : undefined }}
                {...(i > 0
                  ? bind(i - 1, { axis: 'y', perPx, label: challenge.labels[i - 1], step })
                  : { 'aria-hidden': true })}
              >
                {para}
              </p>
            </React.Fragment>
          ))}
        </div>
      );
      break;
    }
    case 'margins': {
      const padX = (fontSize * (values[0] ?? 0)) / 100;
      const padY = (fontSize * (values[1] ?? 0)) / 100;
      const isPoster = exercise.box === 'poster';
      const half = exercise.box === 'button';
      // A box edge moves by exactly the change in its padding, so one pixel is one pixel of padding.
      const perPx = 100 / fontSize;
      canvas = (
        <div className="dp-margin-wrap" role="group" aria-label={exercise.label}>
          <div
            aria-hidden="true"
            className={`dp-margin-box dp-margin-box--${exercise.box ?? 'card'}${assists.guides ? ' dp-margin-box--guides' : ''}`}
            style={{ padding: `${padY}px ${padX}px`, maxWidth: '100%', filter: blur }}
          >
            <div
              className="dp-margin-content"
              style={{
                width: exercise.width ? exercise.width * scale : undefined,
                maxWidth: '100%',
                fontSize,
                fontWeight: isPoster || half ? 800 : 500,
                lineHeight: isPoster ? 1.05 : 1.4,
                letterSpacing: exercise.caps ? '0.08em' : undefined,
                whiteSpace: half ? 'nowrap' : undefined,
              }}
            >
              {exercise.text}
            </div>
          </div>
          <span
            className="dp-edge dp-edge--x"
            {...bind(0, { axis: 'x', perPx, label: challenge.labels[0], step })}
          />
          <span
            className="dp-edge dp-edge--y"
            {...bind(1, { axis: 'y', perPx, label: challenge.labels[1], step })}
          />
        </div>
      );
      break;
    }
    case 'measure': {
      // Fit the longest line inside the stage where possible. One ch is about 0.6 em.
      // Text never goes below 16px. On a narrow stage, long lines scroll inside the stage.
      const measureFont = Math.max(16, Math.min(exercise.size, inner / (mode.slider.max * 0.6)));
      const perPx = () => {
        const full = measureRef.current?.getBoundingClientRect().width ?? measureFont * 0.5 * mode.slider.max;
        return mode.slider.max / full;
      };
      canvas = (
        <div ref={measureRef} style={{ fontSize: measureFont, width: `${mode.slider.max}ch`, flexShrink: 0, margin: '0 auto' }}>
          {assists.guides && (
            <div
              aria-hidden="true"
              style={{
                width: `${mode.slider.max}ch`,
                height: 10,
                marginBottom: 10,
                backgroundImage:
                  'repeating-linear-gradient(to right, var(--muted) 0, var(--muted) 1px, transparent 1px, transparent 10ch)',
              }}
            />
          )}
          <p
            className="dp-grab dp-grab--edge"
            style={{
              width: `${values[0] ?? 0}ch`,
              fontWeight: 400,
              lineHeight: 1.5,
              borderRight: assists.guides ? '2px solid var(--accent)' : undefined,
            }}
            {...bind(0, { axis: 'x', perPx, label: challenge.labels[0], step })}
          >
            {exercise.text}
          </p>
        </div>
      );
      break;
    }
  }

  const selectedValue = values[selected] ?? 0;

  return (
    <section
      aria-label="Stage"
      className={`dp-stage${showGrid ? ' dp-stage--grid' : ''}${locked ? ' dp-stage--locked' : ''}`}
      style={{ backgroundSize: `${cell}px ${cell}px` }}
    >
      {tip && !locked && onToggleTips && <TipStrip tip={tip} open={tipsOpen} onToggle={onToggleTips} />}
      <div className="dp-stage-top">
        <p className="dp-stage-prompt">
          {challenge.prompt} <span className="dp-count">{counter}</span>
        </p>
        {!locked && (
        <div role="group" aria-label="Tools" className="dp-assists">
          {mode.assists.map((id) => (
            <button
              key={id}
              type="button"
              className="dp-toggle"
              aria-pressed={assists[id]}
              aria-label={mode.id === 'kerning' && id === 'grid' ? 'Guide lines' : ASSIST_LABELS[id]}
              title={mode.id === 'kerning' && id === 'grid' ? 'Guide lines' : ASSIST_LABELS[id]}
              onClick={() => onToggleAssist(id)}
            >
              <span className="dp-toggle-chip">
                <DpIcon name={id} />
              </span>
            </button>
          ))}
          <button
            type="button"
            className="dp-toggle"
            aria-pressed={fineOpen}
            aria-label="Fine control"
            title="Fine control"
            onClick={onToggleFine}
          >
            <span className="dp-toggle-chip">
              <DpIcon name="fine" />
            </span>
          </button>
        </div>
        )}
        {!locked && (
        <button
          type="button"
          className="dp-toggle dp-lock"
          aria-label="Lock in answer"
          title="Lock in answer"
          onClick={onLockIn}
        >
          <span className="dp-toggle-chip">
            <DpIcon name="lock" />
          </span>
        </button>
        )}
      </div>

      <div
        ref={ref}
        className={`dp-stage-canvas${mode.id === 'kerning' ? ' dp-stage-canvas--kern' : ''}${mode.id === 'measure' ? ' dp-stage-canvas--scroll' : ''}${
          wraps ? ' dp-stage-canvas--tall' : ''
        }`}
      >
        {canvas}
      </div>
      {pinned && !locked && (
        <p className="dp-pin-note" role="status">
          {pinNote ? 'This letter is fixed.' : ''}
        </p>
      )}

      {mode.id === 'kerning' && !locked && (
        <div className="dp-preview" role="group" aria-label="Small size check" aria-hidden="true">
          <span className="dp-preview-label">Small size</span>
          {[26, 14].map((size) => (
            <KernWord key={size} letters={parts} gapHandle={parts.slice(1).map((_, i) => i)} values={values} fontSize={size} font={challenge.font} />
          ))}
        </div>
      )}

      {children ?? (
        <div className="dp-stage-foot">
          <p className="dp-caption">
            {challenge.font ? `${challenge.font.name}, ${challenge.font.desc} \u00b7 ` : ''}Seed: #{challenge.seed}
          </p>
        </div>
      )}

      {fineOpen && !locked && (
        <FinePopout
          label={pinned ? `Letter ${parts[selected + 1] ?? parts[1]}` : challenge.labels[selected] ?? challenge.labels[0]}
          value={pinned ? positions[selected] ?? 0 : selectedValue}
          min={pinned ? -4000 : challenge.min}
          max={pinned ? 4000 : challenge.max}
          fine={challenge.fine}
          onChange={(v) => (pinned ? moveLetter(selected, v) : onChange(selected, v))}
        />
      )}
    </section>
  );
};
