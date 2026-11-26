import React, { useLayoutEffect, useRef, useState } from 'react';
import { FontSpec } from '../logic/fonts';
import { HandleReview } from '../logic/scoring';
import type { FontLines } from '../logic/kern';
import type { HandleOptions } from './useHandles';

type Bind = (index: number, o: HandleOptions) => Record<string, unknown>;

interface KernWordProps {
  /** Characters in order. A space is a fixed word space. */
  letters: string[];
  /** For each gap (letters.length - 1), the handle that sets it, or null for a fixed gap. */
  gapHandle: Array<number | null>;
  /** Kerning per handle, in 1/1000 em. */
  values: number[];
  fontSize: number;
  font?: FontSpec;
  /** Drag binding. Without it the word is read-only (review). */
  bind?: Bind;
  /** Value change per pixel of drag. */
  perPx?: number;
  labels?: string[];
  step?: number;
  guides?: boolean;
  /**
   * Pinned ends: the first and last letters are fixed and show a lock. The letters between them are
   * the handles, and letterBind gives the drag props of letter i (the index in `letters`).
   */
  letterBind?: (letterIndex: number) => Record<string, unknown>;
  /** Called when the learner presses a pinned letter, so the stage can say it is fixed. */
  onPinnedPress?: () => void;
  /** Horizontal guide lines at the ascender, x-height and baseline. Drawn across the stage behind the word. */
  lines?: FontLines;
  /** Review: the ideal values, drawn as an outline over the learner's word. */
  ghost?: number[];
  /** Review: one mark per handle under its gap. */
  marks?: HandleReview[];
  /** Review: show only the outline, so the learner can compare without their own word. */
  ghostOnly?: boolean;
  /**
   * Anchors the word. The width it has when this key changes is kept, and the letters line up from
   * the left. So a changed gap moves only the letters to its right. A centred word would move
   * every letter by half the change, and the whole word sways while the learner makes a fine move.
   */
  anchor?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MARK_TEXT = { exact: 'Exact', zone: 'Close', miss: 'Off' } as const;

/** A row of letters with an adjustable gap after each one. The gap value is added to the font's plain spacing. */
function Row({
  letters,
  gapHandle,
  values,
  fontSize,
  bind,
  perPx,
  labels,
  step,
  guides,
  marks,
  ghost,
  letterBind,
  onPinnedPress,
}: Pick<
  KernWordProps,
  'letters' | 'gapHandle' | 'values' | 'fontSize' | 'bind' | 'perPx' | 'labels' | 'step' | 'guides' | 'marks' | 'letterBind' | 'onPinnedPress'
> & {
  ghost?: boolean;
}) {
  const px = fontSize / 1000;
  return (
    <>
      {letters.map((ch, i) => {
        const h = i > 0 ? gapHandle[i - 1] : null;
        const v = h === null || h === undefined ? 0 : values[h] ?? 0;
        const mark = h !== null && h !== undefined && marks ? marks[h] : undefined;
        const pinnedMode = Boolean(letterBind);
        const isEnd = pinnedMode && (i === 0 || i === letters.length - 1);
        const movable = !ghost && (pinnedMode ? !isEnd : Boolean(bind) && h !== null && h !== undefined && i > 0);
        const handleProps: Record<string, unknown> = ghost
          ? { 'aria-hidden': true }
          : pinnedMode
            ? isEnd
              ? { 'aria-hidden': true, onPointerDown: onPinnedPress }
              : letterBind!(i)
            : bind && h !== null && h !== undefined
              ? bind(h, { axis: 'x', perPx: perPx ?? 1 / px, label: labels?.[h] ?? `Gap ${h + 1}`, step })
              : { 'aria-hidden': true };
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`dp-gap${h === null ? ' dp-gap--fixed' : ''}`}
                style={{ width: Math.max(0, v) * px, height: fontSize * 0.52 }}
              >
                {guides && h !== null && !ghost && (
                  <>
                    <span className="dp-gap-edge" style={{ left: -1 }} />
                    <span className="dp-gap-edge" style={{ right: -1 }} />
                  </>
                )}
                {mark && (
                  <span
                    className={`dp-mark dp-mark--${mark.grade}${mark.index % 2 ? ' dp-mark--low' : ''}`}
                    title={MARK_TEXT[mark.grade]}
                  >
                    <span className="dp-mark-num">{(mark.index ?? 0) + 1}</span>
                  </span>
                )}
              </span>
            )}
            <span
              className={`dp-kern-letter${movable ? ' dp-grab' : ''}${isEnd && !ghost ? ' dp-kern-letter--pinned' : ''}`}
              style={v < 0 ? { marginLeft: v * px } : undefined}
              {...handleProps}
            >
              {ch === ' ' ? '\u00a0' : ch}
              {isEnd && !ghost && (
                <svg className="dp-pin" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <rect x="3" y="7" width="10" height="7" rx="1.6" />
                  <path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" />
                </svg>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </>
  );
}

export const KernWord: React.FC<KernWordProps> = (props) => {
  const { font, fontSize, ghost, ghostOnly, label, className, style, anchor, lines } = props;
  const fontStyle: React.CSSProperties = font ? { fontFamily: font.family, fontWeight: font.weight } : {};
  const rowRef = useRef<HTMLSpanElement>(null);
  const [anchored, setAnchored] = useState<number | null>(null);
  // Measure the row when the anchor changes (a new drill, a new font size). The row has its own
  // width, so a fixed outer width does not change what is measured. offsetWidth ignores scale transforms.
  useLayoutEffect(() => {
    if (anchor === undefined) return setAnchored(null);
    const w = rowRef.current?.offsetWidth ?? 0;
    setAnchored(w > 0 ? w : null);
  }, [anchor, fontSize, font?.id]);
  const anchorStyle: React.CSSProperties =
    anchor !== undefined && anchored ? { width: anchored, justifyContent: 'flex-start' } : {};
  return (
    <span
      role="group"
      aria-label={label}
      className={`dp-kw dp-kern-word${className ? ` ${className}` : ''}`}
      style={{ fontSize, ...fontStyle, ...anchorStyle, ...style }}
    >
      {lines && (
        <span className="dp-kw-lines" aria-hidden="true">
          <i className="dp-kw-line" style={{ top: `${(lines.baseline - lines.ascender) * 100}%` }} />
          <i className="dp-kw-line" style={{ top: `${(lines.baseline - lines.xHeight) * 100}%` }} />
          <i className="dp-kw-line dp-kw-line--base" style={{ top: `${lines.baseline * 100}%` }} />
        </span>
      )}
      <span ref={rowRef} className="dp-kw-row" style={ghostOnly ? { visibility: 'hidden' } : undefined}>
        <Row {...props} ghost={false} />
      </span>
      {ghost && (
        <span className="dp-kw-row dp-kw-ghost" aria-hidden="true">
          <Row {...props} values={ghost} bind={undefined} marks={undefined} guides={false} ghost />
        </span>
      )}
    </span>
  );
};
