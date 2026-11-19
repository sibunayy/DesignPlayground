import React from 'react';
import { lerp, seg } from './ease';

export const BuildingScene: React.FC<{ lessonId: string; t: number }> = ({ lessonId, t }) => {
  const fix = seg(t, 0.52, 0.88);
  const diag = seg(t, 0.28, 0.5);

  if (lessonId === '05-font-pairing') {
    const xHeightScale = lerp(0.74, 1, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Font pairing x-height explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={56} y={28} width={528} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        {/* Baseline and x-height rails */}
        <line x1={96} y1={220} x2={544} y2={220} stroke="#141413" strokeOpacity={0.3} />
        <line
          x1={96}
          y1={164}
          x2={544}
          y2={164}
          stroke={fix > 0.7 ? '#216E4E' : '#D94526'}
          strokeDasharray="5 4"
          opacity={diag + 0.3}
        />
        <text x={110} y={220} fontSize={72} fontFamily="Georgia, serif" fill="#141413">
          hand
        </text>
        <text
          x={320}
          y={220}
          fontSize={Math.round(72 * xHeightScale)}
          fontFamily="Inter, sans-serif"
          fontWeight={600}
          fill="#D94526"
        >
          gloves
        </text>
        <text x={320} y={286} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
          {fix > 0.7 ? 'Contrasting classes · matched x-height (0.98)' : 'Mismatched x-heights break visual rhythm'}
        </text>
      </svg>
    );
  }

  if (lessonId === '06-paragraph-flow') {
    const wordDrop = lerp(0, 1, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Paragraph flow runt and rag explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={140} y={28} width={360} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        {[240, 210, 245, 220].map((w, i) => (
          <rect key={i} x={180} y={76 + i * 26} width={w} height={11} rx={2} fill="#585650" />
        ))}
        {/* Penultimate short word moving down to join runt */}
        <rect
          x={lerp(368, 180, wordDrop)}
          y={lerp(154, 180, wordDrop)}
          width={52}
          height={11}
          rx={2}
          fill={wordDrop > 0.5 ? '#216E4E' : '#D94526'}
        />
        {/* Runt word sliding right next to bound companion */}
        <rect
          x={lerp(180, 240, wordDrop)}
          y={180}
          width={42}
          height={11}
          rx={2}
          fill={wordDrop > 0.5 ? '#216E4E' : '#D94526'}
        />
        {diag > 0.15 && wordDrop < 0.5 && (
          <rect x={174} y={174} width={54} height={23} rx={4} fill="none" stroke="#D94526" strokeWidth={2} />
        )}
        <text x={320} y={266} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
          {fix > 0.7 ? 'Non-breaking space binds final two words' : 'Stranded runt reads like a broken blank line'}
        </text>
      </svg>
    );
  }

  if (lessonId === '07-micro-type') {
    const shiftA = lerp(0, -18, fix);
    const shiftV = lerp(0, -34, fix);
    const shiftE = lerp(0, -40, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Kerning pairs explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={56} y={28} width={528} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        {diag > 0.1 && (
          <polygon points="184,120 232,120 208,214" fill="rgba(217,69,38,0.16)" opacity={diag * (1 - fix * 0.7)} />
        )}
        <text x={150} y={214} fontSize={96} fontWeight={600} fontFamily="Georgia, serif" fill="#141413">
          W
        </text>
        <text x={244 + shiftA} y={214} fontSize={96} fontWeight={600} fontFamily="Georgia, serif" fill="#141413">
          A
        </text>
        <text x={320 + shiftV} y={214} fontSize={96} fontWeight={600} fontFamily="Georgia, serif" fill="#141413">
          V
        </text>
        <text x={398 + shiftE} y={214} fontSize={96} fontWeight={600} fontFamily="Georgia, serif" fill="#141413">
          E
        </text>
        <text x={320} y={282} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
          {fix > 0.7 ? 'Equalized optical area between diagonal strokes' : 'Uneven diagonal pocket creates a bright gap'}
        </text>
      </svg>
    );
  }

  if (lessonId === '08-character-hygiene') {
    const fixed = fix > 0.55;
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Character hygiene and numerals explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={56} y={28} width={528} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        <text x={320} y={142} textAnchor="middle" fontSize={36} fontFamily="Georgia, serif" fill={fixed ? '#216E4E' : '#D94526'}>
          {fixed ? '“1954–1968 · 6′2″”' : '"1954-1968 · 6’2”"'}
        </text>
        <text x={320} y={208} textAnchor="middle" fontSize={14} fill="#585650">
          {fixed
            ? 'Smart curly quotes · En dash range · True feet/inches primes'
            : 'Dumb quotes · Hyphen range · Backwards curly primes'}
        </text>
        <text x={320} y={258} textAnchor="middle" fontSize={12} fontWeight="600" fill={fixed ? '#216E4E' : '#D94526'}>
          {fixed ? 'Proportional oldstyle in prose · Tabular lining in tables' : 'Default typewriter punctuation weakens editorial authority'}
        </text>
      </svg>
    );
  }

  // 09-optical-geometry
  const nudge = lerp(0, 7, fix);
  const innerR = lerp(24, 10, fix);
  return (
    <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Optical alignment and concentric radii explainer">
      <rect width="640" height="360" fill="#FAF9F5" />
      <rect x={56} y={28} width={528} height={304} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
      {/* Left: Play Triangle optical center */}
      <circle cx={200} cy={170} r={66} fill="#EFEDE6" stroke="rgba(20,20,19,0.2)" />
      {diag > 0.1 && (
        <line x1={200} y1={96} x2={200} y2={244} stroke="#D94526" strokeDasharray="3 3" opacity={diag} />
      )}
      <polygon
        points={`${180 + nudge},138 ${180 + nudge},202 ${234 + nudge},170`}
        fill="#141413"
      />
      <text x={200} y={272} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#585650'}>
        Optical Mass Nudge
      </text>

      {/* Right: Concentric corner radii */}
      <rect x={360} y={96} width={170} height={148} rx={24} fill="#EFEDE6" stroke="#141413" strokeWidth={1.5} />
      <rect
        x={374}
        y={110}
        width={142}
        height={120}
        rx={innerR}
        fill="#FFFFFF"
        stroke={fix > 0.7 ? '#216E4E' : '#D94526'}
        strokeWidth={2}
      />
      <text x={445} y={272} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
        {fix > 0.7 ? 'Inner = Outer − Gap (10 px)' : 'Same 24 px pinches corners'}
      </text>
    </svg>
  );
};
