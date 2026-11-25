import React, { useLayoutEffect, useRef, useState } from 'react';
import { FontSpec } from '../logic/fonts';
import { HandleReview } from '../logic/scoring';
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
}: Pick<KernWordProps, 'letters' | 'gapHandle' | 'values' | 'fontSize' | 'bind' | 'perPx' | 'labels' | 'step' | 'guides' | 'marks'> & {
  ghost?: boolean;
}) {
  const px = fontSize / 1000;
  return (
    <>
      {letters.map((ch, i) => {
        const h = i > 0 ? gapHandle[i - 1] : null;
        const v = h === null || h === undefined ? 0 : values[h] ?? 0;
        const mark = h !== null && h !== undefined && marks ? marks[h] : undefined;
        const handleProps = !ghost && bind && h !== null && h !== undefined
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
              className={`dp-kern-letter${!ghost && bind && h !== null && i > 0 ? ' dp-grab' : ''}`}
              style={v < 0 ? { marginLeft: v * px } : undefined}
              {...handleProps}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          </React.Fragment>
        );
      })}
    </>
  );
}

export const KernWord: React.FC<KernWordProps> = (props) => {
  const { font, fontSize, ghost, ghostOnly, label, className, style, anchor } = props;
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
