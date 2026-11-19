import React from 'react';
import { lerp, seg } from './ease';

export const FoundationScene: React.FC<{ lessonId: string; t: number }> = ({ lessonId, t }) => {
  const fix = seg(t, 0.52, 0.88);
  const diag = seg(t, 0.28, 0.5);

  if (lessonId === '01-whitespace') {
    const boxOpacity = lerp(1, 0, seg(t, 0.5, 0.72));
    const cardPad = lerp(14, 34, fix);
    const blockGap = lerp(52, 16, fix);
    const voidAlpha = diag * lerp(1, 0, seg(t, 0.62, 0.82));
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="White space explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect
          x={90}
          y={28}
          width={460}
          height={304}
          rx={12}
          fill="#FFFFFF"
          stroke="rgba(20,20,19,0.16)"
        />
        {/* Outer redundant border box that traps void */}
        <rect
          x={90 + cardPad - 6}
          y={28 + cardPad - 6}
          width={460 - (cardPad - 6) * 2}
          height={304 - (cardPad - 6) * 2}
          rx={8}
          fill="none"
          stroke="#141413"
          strokeOpacity={0.35 * boxOpacity}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        {/* Headline block */}
        <rect x={90 + cardPad} y={28 + cardPad} width={220} height={26} rx={3} fill="#141413" />
        <rect x={90 + cardPad} y={28 + cardPad + 36} width={160} height={10} rx={2} fill="#848179" />
        {/* Trapped pocket highlight */}
        <rect
          x={260}
          y={118}
          width={185}
          height={80}
          rx={6}
          fill="rgba(217,69,38,0.16)"
          stroke="#D94526"
          strokeDasharray="5 4"
          opacity={voidAlpha}
        />
        {voidAlpha > 0.15 && (
          <text
            x={352}
            y={162}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#D94526"
            opacity={voidAlpha}
          >
            Trapped Void
          </text>
        )}
        {/* Body & CTA blocks sliding together */}
        <rect
          x={90 + cardPad}
          y={28 + cardPad + 54 + blockGap}
          width={330 - cardPad}
          height={10}
          rx={2}
          fill="#585650"
        />
        <rect
          x={90 + cardPad}
          y={28 + cardPad + 72 + blockGap}
          width={290 - cardPad}
          height={10}
          rx={2}
          fill="#585650"
        />
        <rect
          x={90 + cardPad}
          y={28 + cardPad + 102 + blockGap}
          width={116}
          height={32}
          rx={999}
          fill="#D94526"
        />
      </svg>
    );
  }

  if (lessonId === '02-hierarchy') {
    const headTopGap = lerp(22, 34, fix);
    const headBotGap = lerp(22, 8, fix);
    const secGap = lerp(22, 42, fix);
    const badgeAccent = lerp(1, 0, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Visual hierarchy explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={120} y={24} width={400} height={312} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.14)" />
        {/* Competing badge hue -> turns neutral */}
        <rect
          x={152}
          y={48}
          width={96}
          height={20}
          rx={999}
          fill={badgeAccent > 0.45 ? '#D94526' : '#EFEDE6'}
        />
        <rect x={152} y={70 + headTopGap} width={260} height={22} rx={3} fill="#141413" />
        <rect x={152} y={92 + headTopGap + headBotGap} width={310} height={10} rx={2} fill="#585650" />
        <rect x={152} y={108 + headTopGap + headBotGap} width={250} height={10} rx={2} fill="#585650" />
        {/* Section 2 */}
        <rect x={152} y={120 + headTopGap + headBotGap + secGap} width={200} height={16} rx={3} fill="#141413" />
        <rect x={152} y={142 + headTopGap + headBotGap + secGap + headBotGap * 0.8} width={280} height={10} rx={2} fill="#848179" />
        {/* Primary CTA */}
        <rect x={152} y={266} width={140} height={36} rx={999} fill="#D94526" />
        {/* Diagnosis annotation brackets */}
        {diag > 0.08 && (
          <g opacity={diag}>
            <line x1={486} y1={92 + headTopGap} x2={486} y2={92 + headTopGap + headBotGap} stroke="#216E4E" strokeWidth={2.5} />
            <text x={496} y={97 + headTopGap + headBotGap / 2} fontSize="11" fill="#216E4E" fontWeight="600">
              1×
            </text>
            <line
              x1={486}
              y1={118 + headTopGap + headBotGap}
              x2={486}
              y2={120 + headTopGap + headBotGap + secGap}
              stroke="#D94526"
              strokeWidth={2.5}
            />
            <text
              x={496}
              y={122 + headTopGap + headBotGap + secGap / 2}
              fontSize="11"
              fill="#D94526"
              fontWeight="600"
            >
              2×
            </text>
          </g>
        )}
      </svg>
    );
  }

  if (lessonId === '03-grids') {
    const bleed = lerp(18, 0, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Grid margins and gutters explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={60} y={28} width={520} height={304} rx={10} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        {/* 4 columns with clean gutters */}
        {[0, 1, 2, 3].map((col) => {
          const x = 92 + col * 118;
          return (
            <rect
              key={col}
              x={x}
              y={44}
              width={102}
              height={272}
              fill="rgba(217,69,38,0.06)"
              stroke="rgba(217,69,38,0.22)"
              strokeDasharray={diag > 0.1 ? 'none' : '3 3'}
            />
          );
        })}
        {/* Card 1 spanning 2 columns cleanly */}
        <rect
          x={92}
          y={68}
          width={220 + bleed}
          height={190}
          rx={6}
          fill="#EFEDE6"
          stroke={bleed > 4 ? '#D94526' : '#216E4E'}
          strokeWidth={2}
        />
        {/* Card 2 snapping to columns 3-4 */}
        <rect
          x={328 - bleed * 0.5}
          y={68}
          width={220 + bleed * 0.5}
          height={190}
          rx={6}
          fill="#141413"
          fillOpacity={0.08}
          stroke={bleed > 4 ? '#D94526' : '#216E4E'}
          strokeWidth={2}
        />
        {diag > 0.1 && bleed > 2 && (
          <text x={320} y={292} textAnchor="middle" fontSize="12" fill="#D94526" fontWeight="600" opacity={diag}>
            Gutter Violation — keep gutters empty
          </text>
        )}
        {fix > 0.85 && (
          <text x={320} y={292} textAnchor="middle" fontSize="12" fill="#216E4E" fontWeight="600">
            Clean column edges & open 16 px gutters
          </text>
        )}
      </svg>
    );
  }

  // 04-macro-type
  const width = lerp(490, 320, fix);
  const gap = lerp(15, 24, fix);
  return (
    <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Macro-typography measure and leading explainer">
      <rect width="640" height="360" fill="#FAF9F5" />
      <rect x={56} y={28} width={528} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
      {/* 45-75ch guide band */}
      {diag > 0.1 && (
        <rect
          x={90}
          y={48}
          width={320}
          height={260}
          fill="rgba(33,110,78,0.08)"
          stroke="#216E4E"
          strokeDasharray="4 4"
          opacity={diag}
        />
      )}
      <text x={90} y={76} fontSize="20" fontWeight="600" fill="#141413">
        Body Copy Measure & Leading
      </text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={90}
          y={104 + i * gap}
          width={i === 5 ? width * 0.65 : width}
          height={8}
          rx={2}
          fill="#585650"
        />
      ))}
      <text x={90} y={292} fontSize="12" fill={fix > 0.7 ? '#216E4E' : '#D94526'} fontWeight="600">
        {fix > 0.7 ? '58 chars · 150% leading — smooth return sweep' : '96 chars · 118% leading — cramped & too wide'}
      </text>
    </svg>
  );
};
