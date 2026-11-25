import React, { useId } from 'react';
import type { TipArtKind } from '../content/tips';

/**
 * Small vector diagrams for the tips. Shapes only: no text and no fonts, so they look the same
 * everywhere. Colours come from the app's tokens through the ta- classes.
 */

const Stem = ({ x, y = 14, h = 44 }: { x: number; y?: number; h?: number }) => <rect className="ta-ink" x={x} y={y} width={9} height={h} rx={1.5} />;

const Bars = ({ x, y, widths, h = 5, gap = 9, cls = 'ta-ink' }: { x: number; y: number; widths: number[]; h?: number; gap?: number; cls?: string }) => (
  <>
    {widths.map((w, i) => (
      <rect key={i} className={cls} x={x} y={y + i * (h + gap)} width={w} height={h} rx={1.5} />
    ))}
  </>
);

export const TipArt: React.FC<{ kind: TipArtKind }> = ({ kind }) => {
  const id = useId().replace(/:/g, '');
  let art: React.ReactNode;
  switch (kind) {
    case 'pair-area':
      // A stem and a round letter. The tinted area between them is the white that kerning balances.
      art = (
        <>
          <rect className="ta-tint" x={29} y={16} width={32} height={40} />
          <Stem x={20} y={16} h={40} />
          <circle className="ta-line" cx={79} cy={36} r={19} strokeWidth={9} />
          <path className="ta-arrow" d="M31 64h28M31 64l4-3M31 64l4 3M59 64l-4-3M59 64l-4 3" />
        </>
      );
      break;
    case 'diagonal':
      art = (
        <>
          <polygon className="ta-tint" points="38,14 62,14 84,58 60,58" />
          <path className="ta-line" strokeWidth={8} d="M12 58 L34 14 L56 58" />
          <path className="ta-line" strokeWidth={8} d="M64 14 L86 58 L108 14" />
        </>
      );
      break;
    case 'overhang':
      art = (
        <>
          <rect className="ta-tint" x={50} y={24} width={32} height={20} />
          <rect className="ta-ink" x={14} y={14} width={44} height={10} rx={1.5} />
          <Stem x={31} y={24} h={36} />
          <circle className="ta-line" cx={76} cy={46} r={11} strokeWidth={7} />
        </>
      );
      break;
    case 'squint':
      art = (
        <>
          <defs>
            <filter id={`b${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={3.2} />
            </filter>
          </defs>
          <g>
            {[14, 28, 42, 62, 74, 98].map((x) => <Stem key={x} x={x - 6} y={8} h={22} />)}
          </g>
          <g filter={`url(#b${id})`}>
            {[14, 28, 42, 62, 74, 98].map((x) => <Stem key={x} x={x - 6} y={42} h={22} />)}
          </g>
        </>
      );
      break;
    case 'zoom-out':
      art = (
        <>
          <g>
            {[14, 32, 50].map((x) => <rect key={x} className="ta-ink" x={x} y={12} width={11} height={30} rx={2} />)}
          </g>
          <path className="ta-arrow" d="M70 27h14M80 23l4 4-4 4" />
          <g>
            {[92, 98, 104].map((x) => <rect key={x} className="ta-ink" x={x} y={22} width={3.4} height={10} rx={1} />)}
          </g>
          <Bars x={14} y={52} widths={[74]} h={4} gap={0} cls="ta-soft" />
        </>
      );
      break;
    case 'rhythm':
      art = (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect key={`g${i}`} className="ta-tint" x={29 + i * 22} y={14} width={13} height={44} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => <Stem key={i} x={20 + i * 22} />)}
        </>
      );
      break;
    case 'tracking-size':
      art = (
        <>
          {[14, 26, 38, 50].map((x) => <rect key={x} className="ta-ink" x={x} y={10} width={10} height={26} rx={2} />)}
          {[14, 31, 48, 65, 82].map((x) => <rect key={x} className="ta-ink" x={x} y={50} width={9} height={10} rx={1.5} />)}
          <path className="ta-arrow" d="M88 24h18M92 20l-4 4 4 4M102 20l4 4-4 4" />
        </>
      );
      break;
    case 'leading':
      art = (
        <>
          <Bars x={14} y={12} widths={[78, 78, 78, 52]} h={5} gap={9} />
          <path className="ta-arrow" d="M104 14.5v14M101 18l3-3.5 3 3.5M101 25l3 3.5 3-3.5" />
          <path className="ta-guide" d="M12 26.5h86" />
        </>
      );
      break;
    case 'measure':
      art = (
        <>
          <Bars x={14} y={14} widths={[92, 92, 92, 60]} h={5} gap={9} />
          <path className="ta-arrow" d="M14 64h92M14 60v8M106 60v8" />
        </>
      );
      break;
    case 'word-space':
      art = (
        <>
          <rect className="ta-tint" x={42} y={22} width={14} height={28} />
          <rect className="ta-tint" x={88} y={22} width={14} height={28} />
          {[16, 56, 102].map((x, i) => <rect key={x} className="ta-ink" x={x} y={26} width={i === 2 ? 12 : 26} height={20} rx={2} />)}
        </>
      );
      break;
    case 'paragraph':
      art = (
        <>
          <Bars x={20} y={10} widths={[84, 84, 50]} h={4.5} gap={5.5} />
          <Bars x={14} y={44} widths={[90, 90, 60]} h={4.5} gap={5.5} />
          <path className="ta-arrow" d="M110 32v10M107 35l3-3 3 3M107 39l3 3 3-3" />
        </>
      );
      break;
    case 'pad-box':
      art = (
        <>
          <rect className="ta-soft" x={14} y={10} width={92} height={52} rx={6} />
          <Bars x={34} y={26} widths={[52, 34]} h={6} gap={8} />
          <path className="ta-arrow" d="M14 36h16M26 32l4 4-4 4M106 36H90M94 32l-4 4 4 4" />
        </>
      );
      break;
    case 'grid-edges':
      art = (
        <>
          <path className="ta-guide" d="M30 6v60" />
          <rect className="ta-ink" x={30} y={10} width={50} height={14} rx={2} />
          <rect className="ta-ink" x={30} y={30} width={66} height={14} rx={2} />
          <rect className="ta-accent" x={36} y={50} width={50} height={14} rx={2} />
        </>
      );
      break;
    case 'grid-axes':
      art = (
        <>
          <path className="ta-guide" d="M14 22h92M14 50h92M40 8v56M80 8v56" />
          <rect className="ta-ink" x={40} y={22} width={40} height={28} rx={2} opacity={0.35} />
          <rect className="ta-accent" x={46} y={27} width={40} height={28} rx={2} />
          <path className="ta-arrow" d="M44 62h10M50 59l4 3-4 3M96 28v10M93 34l3 4 3-4" />
        </>
      );
      break;
    case 'keep-good':
    default:
      art = (
        <>
          <rect className="ta-ink" x={14} y={14} width={40} height={24} rx={3} />
          <rect className="ta-ink" x={62} y={14} width={44} height={24} rx={3} />
          <rect className="ta-accent" x={14} y={46} width={92} height={14} rx={3} />
          <path className="ta-check" d="M30 26l5 5 10-11" />
        </>
      );
  }
  return (
    <svg className="dp-tipart" viewBox="0 0 120 72" role="img" aria-hidden="true" focusable="false">
      {art}
    </svg>
  );
};
