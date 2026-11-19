import React from 'react';
import { lerp, seg } from './ease';

export const ChallengeScene: React.FC<{ lessonId: string; t: number }> = ({ lessonId, t }) => {
  const fix = seg(t, 0.52, 0.88);
  const diag = seg(t, 0.28, 0.5);

  if (lessonId === '10-perceptual-color') {
    const pureBlack = fix < 0.5;
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="OKLCH, APCA and Dark Mode explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        {/* Left: HSL uneven lightness vs OKLCH uniform */}
        <rect x={60} y={36} width={248} height={288} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        <text x={84} y={68} fontSize="12" fontWeight="600" fill="#585650">
          {fix > 0.6 ? 'OKLCH Uniform L = 0.65' : 'HSL L = 50% Brightness Drift'}
        </text>
        <circle cx={124} cy={148} r={34} fill={fix > 0.6 ? '#B3881E' : '#FFFF00'} />
        <circle cx={240} cy={148} r={34} fill={fix > 0.6 ? '#5B88F6' : '#0000FF'} />
        <text x={182} y={224} textAnchor="middle" fontSize="12" fill="#585650">
          {fix > 0.6 ? 'Balanced perceptual luminance' : 'Yellow glows white · Blue sinks dark'}
        </text>

        {/* Right: Darkroom halation vs #161618 calibrated */}
        <rect
          x={332}
          y={36}
          width={248}
          height={288}
          rx={12}
          fill={pureBlack ? '#000000' : '#161618'}
          stroke="rgba(20,20,19,0.2)"
        />
        <text
          x={456}
          y={152}
          textAnchor="middle"
          fontSize="24"
          fontWeight="600"
          fill={pureBlack ? '#FFFFFF' : '#E8E6E0'}
        >
          Aa 75 Lc
        </text>
        <text
          x={456}
          y={224}
          textAnchor="middle"
          fontSize="12"
          fill={pureBlack ? '#FF4D4D' : '#4CA97E'}
        >
          {pureBlack ? '#000 + #FFF causes halation' : '#161618 + 89% ink eases eye strain'}
        </text>
      </svg>
    );
  }

  if (lessonId === '11-iconography') {
    const snap = fix;
    const vx = lerp(10.6, 12, snap);
    const vy = lerp(4.4, 5, snap);
    const scale = 10;
    const ox = 200;
    const oy = 60;
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Iconography pixel grid explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={56} y={24} width={528} height={312} rx={12} fill="#FFFFFF" stroke="rgba(20,20,19,0.12)" />
        {/* 24x24 pixel matrix */}
        <g transform={`translate(${ox}, ${oy})`}>
          {Array.from({ length: 25 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * scale} y1={0} x2={i * scale} y2={240} stroke="rgba(20,20,19,0.08)" />
              <line x1={0} y1={i * scale} x2={240} y2={i * scale} stroke="rgba(20,20,19,0.08)" />
            </React.Fragment>
          ))}
          {/* 2px live safe area */}
          <rect
            x={20}
            y={20}
            width={200}
            height={200}
            fill="none"
            stroke="#D94526"
            strokeDasharray="4 4"
            opacity={diag + 0.3}
          />
          <polygon
            points={`${vx * scale},${vy * scale} ${19 * scale},${19 * scale} ${5 * scale},${19 * scale}`}
            fill="none"
            stroke="#141413"
            strokeWidth={16}
            strokeLinejoin="round"
          />
          <circle cx={vx * scale} cy={vy * scale} r={6} fill={fix > 0.7 ? '#216E4E' : '#D94526'} />
        </g>
        <text x={320} y={322} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
          {fix > 0.7 ? 'Snapped to integer pixel intersections inside 2 px safe border' : 'Fractional coordinates blur at 1× scale'}
        </text>
      </svg>
    );
  }

  if (lessonId === '12-image-framing') {
    const cropTop = lerp(128, 72, fix);
    const cropBot = lerp(218, 250, fix);
    return (
      <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Photo cropping anatomy explainer">
        <rect width="640" height="360" fill="#FAF9F5" />
        <rect x={170} y={32} width={300} height={296} rx={10} fill="#E6E2D8" />
        {/* Stylized studio silhouette with clear head, shoulders, elbows, waist */}
        <circle cx={320} cy={104} r={22} fill="#585650" />
        <path d="M276 168 Q276 134 320 134 Q364 134 364 168 L374 238 L266 238 Z" fill="#3E3C38" />
        {/* Elbow joint danger band */}
        {diag > 0.1 && (
          <line x1={190} y1={218} x2={450} y2={218} stroke="#D94526" strokeDasharray="5 4" strokeWidth={2} opacity={diag} />
        )}
        {/* Crop frame moving off elbow & forehead */}
        <rect
          x={226}
          y={cropTop}
          width={188}
          height={cropBot - cropTop}
          fill="none"
          stroke={fix > 0.7 ? '#216E4E' : '#D94526'}
          strokeWidth={3}
        />
        <text x={320} y={310} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
          {fix > 0.7 ? 'Generous headroom · mid-limb crop clears joints' : 'Never graze hairline or amputate through elbows'}
        </text>
      </svg>
    );
  }

  // 13-print-prepress
  const artMargin = lerp(0, -18, fix);
  const textInset = lerp(8, 26, fix);
  return (
    <svg viewBox="0 0 640 360" width="100%" height="100%" aria-label="Print prepress bleed and safe zone explainer">
      <rect width="640" height="360" fill="#FAF9F5" />
      {/* Bleed boundary */}
      <rect x={140} y={44} width={360} height={260} fill="#FFFFFF" stroke="#D94526" strokeDasharray="4 4" />
      {/* Hero panel extending to bleed */}
      <rect
        x={158 + artMargin}
        y={62 + artMargin}
        width={180 - artMargin}
        height={224 - artMargin * 2}
        fill="#2C2B28"
      />
      {/* Trim line */}
      <rect x={158} y={62} width={324} height={224} fill="none" stroke="#141413" strokeWidth={2} />
      {/* Safe zone */}
      <rect x={178} y={82} width={284} height={184} fill="none" stroke="#216E4E" strokeDasharray="3 3" opacity={diag + 0.3} />
      {/* Headline moving inside safe zone */}
      <rect x={346} y={62 + textInset} width={116 - textInset * 0.4} height={16} rx={2} fill="#141413" />
      <rect x={346} y={88 + textInset} width={96} height={9} rx={2} fill="#585650" />
      <text x={320} y={332} textAnchor="middle" fontSize="12" fontWeight="600" fill={fix > 0.7 ? '#216E4E' : '#D94526'}>
        {fix > 0.7 ? '3 mm bleed + 4 mm safe margin absorbs ±0.5 mm cut drift' : 'Zero bleed leaves white slivers; edge type gets sliced'}
      </text>
    </svg>
  );
};
