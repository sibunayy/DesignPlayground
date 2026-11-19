import { EDITORIAL_BRIEFS, EditorialBrief, LONG_PROSE_SPECIMENS } from '../../data/briefs';
import { STILL_LIFE_PHOTOS } from '../../data/photoCatalog';
import { SeededRng } from '../../engine/prng';
import { bandForScore, ExerciseResult } from '../../engine/types';

/* ─── L01: WHITE SPACE & TRAPPED SPACE ────────────────────────────────────────────────────── */

export interface L01Scenario {
  brief: EditorialBrief;
  photoUrl: string;
  initialMargin: number;
  initialBlockX: number; // % offset shifting card inset awkwardly
  initialBlockY: number;
  hasRedundantBox: boolean;
  targetMargin: number;
  targetBlockX: number;
  targetBlockY: number;
}

export interface L01State {
  margin: number;
  blockX: number;
  blockY: number;
  hasBox: boolean;
}

export function generateL01(seed: string): L01Scenario {
  const rng = new SeededRng(`01${seed}`);
  const brief = rng.pick(EDITORIAL_BRIEFS);
  const photoUrl = rng.pick([STILL_LIFE_PHOTOS.ceramic, STILL_LIFE_PHOTOS.coffee, STILL_LIFE_PHOTOS.gallery]);
  return {
    brief,
    photoUrl,
    initialMargin: rng.int(8, 14),
    initialBlockX: rng.int(36, 56),
    initialBlockY: rng.int(16, 26),
    hasRedundantBox: true,
    targetMargin: 32,
    targetBlockX: 0,
    targetBlockY: 0,
  };
}

export function scoreL01(state: L01State, scenario: L01Scenario): ExerciseResult {
  const marginErr = Math.abs(state.margin - scenario.targetMargin);
  const marginScore = Math.max(0, 40 - marginErr * 1.9);

  // Distance of floating inset from clean perimeter alignment (0, 0)
  const dist = Math.hypot(state.blockX - scenario.targetBlockX, state.blockY - scenario.targetBlockY);
  const voidScore = Math.max(0, 35 - dist * 0.9);

  const boxScore = state.hasBox ? 0 : 25;
  const total = Math.round(Math.max(0, Math.min(100, marginScore + voidScore + boxScore)));

  const issues: string[] = [];
  if (state.hasBox) issues.push('a redundant border still traps empty space inside the layout');
  if (dist > 14) issues.push('the stray interior pocket pulls focus away from the headline');
  if (state.margin < 22) issues.push('cramped outer margins make the card feel crowded');
  else if (state.margin > 44) issues.push('excessive margins compress the content column');

  const diagnosis =
    issues.length === 0
      ? 'Clean breathing margins frame the content while empty space flows smoothly to the outer edge.'
      : `${issues[0].charAt(0).toUpperCase() + issues[0].slice(1)}${issues[1] ? `, and ${issues[1]}` : ''}.`;

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Outer Margin',
        yours: `${Math.round(state.margin)} px`,
        target: `${scenario.targetMargin} px`,
        status: marginErr <= 4 ? 'pass' : marginErr <= 10 ? 'close' : 'miss',
      },
      {
        label: 'Trapped Void',
        yours: dist <= 10 ? 'Released' : `${Math.round(dist)} px pocket`,
        target: '0 px (open edge)',
        status: dist <= 10 ? 'pass' : dist <= 22 ? 'close' : 'miss',
      },
      {
        label: 'Redundant Border',
        yours: state.hasBox ? 'Present' : 'Removed',
        target: 'Removed',
        status: !state.hasBox ? 'pass' : 'miss',
      },
    ],
  };
}

/* ─── L02: VISUAL HIERARCHY & PROXIMITY ─────────────────────────────────────────────────── */

export interface L02Scenario {
  brief: EditorialBrief;
  initialHeadGap: number; // gap between heading and its own body
  initialSectionGap: number; // gap between section 1 and section 2
  initialBadgeAccent: boolean; // competing bright accent on decorative tag
  targetHeadGap: number;
  targetSectionGap: number;
}

export interface L02State {
  headGap: number;
  sectionGap: number;
  badgeAccent: boolean;
}

export function generateL02(seed: string): L02Scenario {
  const rng = new SeededRng(`02${seed}`);
  return {
    brief: rng.pick(EDITORIAL_BRIEFS),
    initialHeadGap: rng.int(18, 24),
    initialSectionGap: rng.int(16, 22),
    initialBadgeAccent: true,
    targetHeadGap: 8,
    targetSectionGap: 28,
  };
}

export function scoreL02(state: L02State, scenario: L02Scenario): ExerciseResult {
  const ratio = state.sectionGap / Math.max(4, state.headGap);
  const headErr = Math.abs(state.headGap - scenario.targetHeadGap);
  const secErr = Math.abs(state.sectionGap - scenario.targetSectionGap);

  // Ratio >= 2.0 (up to ~4.2) earns full proximity points; < 2.0 drops sharply
  const ratioPenalty = ratio < 2.0 ? (2.0 - ratio) * 32 : ratio > 4.5 ? (ratio - 4.5) * 10 : 0;
  const proximityScore = Math.max(0, 45 - ratioPenalty - Math.max(0, headErr - 4) * 1.5);
  const secScore = Math.max(0, 30 - secErr * 1.4);
  const focusScore = state.badgeAccent ? 0 : 25;

  const total = Math.round(Math.max(0, Math.min(100, proximityScore + secScore + focusScore)));

  let diagnosis = 'Strong proximity binds headings to their copy while one crisp CTA leads the eye.';
  if (state.badgeAccent && ratio < 1.8) {
    diagnosis =
      'Equal gaps blur group boundaries and the bright eyebrow badge competes directly with your primary CTA.';
  } else if (state.badgeAccent) {
    diagnosis =
      'Spacing separates groups well, yet leaving bright accent ink on the eyebrow tag dilutes primary CTA focus.';
  } else if (ratio < 1.75) {
    diagnosis =
      'Section spacing needs roughly 2× more breathing room than the tight gap linking each heading to its copy.';
  } else if (state.headGap > 14) {
    diagnosis =
      'Pull the heading closer beneath its preceding section by tightening the heading-to-body gap toward 8 px.';
  }

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Outside : Inside Ratio',
        yours: `${ratio.toFixed(1)}×`,
        target: '≥ 2.0×',
        status: ratio >= 2.0 ? 'pass' : ratio >= 1.5 ? 'close' : 'miss',
      },
      {
        label: 'Heading → Copy Gap',
        yours: `${Math.round(state.headGap)} px`,
        target: `${scenario.targetHeadGap} px`,
        status: headErr <= 3 ? 'pass' : headErr <= 6 ? 'close' : 'miss',
      },
      {
        label: 'Accent Discipline',
        yours: state.badgeAccent ? 'Split (2 accents)' : 'Single CTA',
        target: 'Single CTA',
        status: !state.badgeAccent ? 'pass' : 'miss',
      },
    ],
  };
}

/* ─── L03: GRIDS, MARGINS & GUTTERS ─────────────────────────────────────────────────────── */

export interface L03Scenario {
  brief: EditorialBrief;
  columns: number; // 8 columns
  colWidth: number;
  gutter: number;
  initialCard1: { x: number; w: number }; // raw px within 560px grid width
  initialCard2: { x: number; w: number };
  initialPad: number; // e.g. 13px arbitrary
  targetCard1Cols: [number, number]; // [startCol, span] 0-indexed
  targetCard2Cols: [number, number];
}

export interface L03State {
  card1X: number;
  card1W: number;
  card2X: number;
  card2W: number;
  cardPad: number;
}

export function gridColBounds(col: number, span: number, colWidth: number, gutter: number) {
  const x = col * (colWidth + gutter);
  const w = span * colWidth + (span - 1) * gutter;
  return { x, w };
}

export function generateL03(seed: string): L03Scenario {
  const rng = new SeededRng(`03${seed}`);
  const colWidth = 56;
  const gutter = 16;
  // Total 8 cols = 8*56 + 7*16 = 448 + 112 = 560px
  const c1 = gridColBounds(0, 4, colWidth, gutter);
  const c2 = gridColBounds(4, 4, colWidth, gutter);
  return {
    brief: rng.pick(EDITORIAL_BRIEFS),
    columns: 8,
    colWidth,
    gutter,
    initialCard1: { x: c1.x + 6, w: c1.w + 10 }, // bleeds into middle gutter
    initialCard2: { x: c2.x - 10, w: c2.w + 7 }, // starts inside gutter
    initialPad: rng.pick([13, 19, 21]),
    targetCard1Cols: [0, 4],
    targetCard2Cols: [4, 4],
  };
}

export function scoreL03(state: L03State, scenario: L03Scenario): ExerciseResult {
  const t1 = gridColBounds(
    scenario.targetCard1Cols[0],
    scenario.targetCard1Cols[1],
    scenario.colWidth,
    scenario.gutter
  );
  const t2 = gridColBounds(
    scenario.targetCard2Cols[0],
    scenario.targetCard2Cols[1],
    scenario.colWidth,
    scenario.gutter
  );

  const err1 = Math.abs(state.card1X - t1.x) + Math.abs(state.card1W - t1.w);
  const err2 = Math.abs(state.card2X - t2.x) + Math.abs(state.card2W - t2.w);
  const gutterClear = state.card1X + state.card1W <= state.card2X - 12;

  const snapScore = Math.max(0, 75 - (err1 + err2) * 1.15);
  const is8px = state.cardPad % 8 === 0 && state.cardPad >= 16 && state.cardPad <= 32;
  const tokenScore = is8px ? 25 : Math.max(0, 25 - (state.cardPad % 8) * 3);

  const total = Math.round(Math.max(0, Math.min(100, snapScore + tokenScore)));

  let diagnosis = 'Cards align cleanly to column edges, leaving gutters empty and padding quantized on 8 px steps.';
  if (!gutterClear || err1 + err2 > 14) {
    diagnosis =
      'Cards bleed into the dividing gutter instead of ending cleanly at column tracks: snap both edges back to column bounds.';
  } else if (!is8px) {
    diagnosis =
      `Column spans are clean, though ${state.cardPad} px padding breaks the 8 px spacing scale (snap to 16 px or 24 px).`;
  }

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Left Card Drift',
        yours: `${Math.round(err1)} px`,
        target: '0 px',
        status: err1 <= 4 ? 'pass' : err1 <= 12 ? 'close' : 'miss',
      },
      {
        label: 'Right Card Drift',
        yours: `${Math.round(err2)} px`,
        target: '0 px',
        status: err2 <= 4 ? 'pass' : err2 <= 12 ? 'close' : 'miss',
      },
      {
        label: 'Padding Token',
        yours: `${state.cardPad} px`,
        target: '16 / 24 px',
        status: is8px ? 'pass' : 'miss',
      },
    ],
  };
}

/* ─── L04: MACRO-TYPOGRAPHY (BODY COPY, MEASURE & RHYTHM) ───────────────────────────────── */

export interface L04Scenario {
  specimen: (typeof LONG_PROSE_SPECIMENS)[number];
  initialFontSize: number;
  initialLeading: number; // ratio e.g. 1.18
  initialMeasurePx: number; // maps ~8.4px per ch at 16px
  targetFontSize: number;
  targetLeading: number;
  targetMeasurePx: number;
}

export interface L04State {
  fontSize: number;
  leading: number;
  measurePx: number;
}

export function estimateCharsPerLine(measurePx: number, fontSize: number): number {
  return Math.round(measurePx / (fontSize * 0.49));
}

export function generateL04(seed: string): L04Scenario {
  const rng = new SeededRng(`04${seed}`);
  const specimen = rng.pick(LONG_PROSE_SPECIMENS);
  const flawMode = rng.int(0, 2);
  return {
    specimen,
    initialFontSize: flawMode === 0 ? 13 : 17,
    initialLeading: flawMode === 1 ? 1.16 : 1.24,
    initialMeasurePx: flawMode === 2 ? 640 : 610,
    targetFontSize: 17,
    targetLeading: 1.55,
    targetMeasurePx: 500, // ~60 chars at 17px
  };
}

export function scoreL04(state: L04State): ExerciseResult {
  const chars = estimateCharsPerLine(state.measurePx, state.fontSize);
  const leadingPct = Math.round(state.leading * 100);

  // Measure target: 45-75 chars (ideal 55-68)
  let measureScore = 40;
  if (chars < 45) measureScore = Math.max(0, 40 - (45 - chars) * 2.2);
  else if (chars > 75) measureScore = Math.max(0, 40 - (chars - 75) * 1.8);

  // Leading target: 140-165% (ideal 145-160%)
  let leadingScore = 35;
  if (leadingPct < 140) leadingScore = Math.max(0, 35 - (140 - leadingPct) * 1.7);
  else if (leadingPct > 168) leadingScore = Math.max(0, 35 - (leadingPct - 168) * 1.4);

  // Body size floor: >= 16px (15 acceptable close, <15 penalty)
  let sizeScore = 25;
  if (state.fontSize < 16) sizeScore = Math.max(0, 25 - (16 - state.fontSize) * 7);
  else if (state.fontSize > 21) sizeScore = Math.max(0, 25 - (state.fontSize - 21) * 5);

  const total = Math.round(Math.max(0, Math.min(100, measureScore + leadingScore + sizeScore)));

  const problems: string[] = [];
  if (chars > 75) problems.push(`lines run ${chars} characters wide, making the eye lose its place on return`);
  else if (chars < 45) problems.push(`lines are too narrow at ${chars} characters, chopping sentence rhythm`);
  if (leadingPct < 140) problems.push(`${leadingPct}% leading crowds adjacent ascenders and descenders`);
  else if (leadingPct > 168) problems.push(`${leadingPct}% leading pulls lines too far apart`);
  if (state.fontSize < 16) problems.push(`${state.fontSize} px body copy falls below the 16 px screen legibility floor`);

  const diagnosis =
    problems.length === 0
      ? `Balanced ${chars}-character lines at ${leadingPct}% leading give long prose effortless vertical rhythm.`
      : `${problems[0].charAt(0).toUpperCase() + problems[0].slice(1)}${problems[1] ? `, and ${problems[1]}` : ''}.`;

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Line Measure',
        yours: `~${chars} chars`,
        target: '45–75 chars',
        status: chars >= 45 && chars <= 75 ? 'pass' : chars >= 40 && chars <= 82 ? 'close' : 'miss',
      },
      {
        label: 'Line Height',
        yours: `${leadingPct}%`,
        target: '140–165%',
        status:
          leadingPct >= 140 && leadingPct <= 165
            ? 'pass'
            : leadingPct >= 132 && leadingPct <= 174
              ? 'close'
              : 'miss',
      },
      {
        label: 'Body Size',
        yours: `${state.fontSize} px`,
        target: '16–20 px',
        status: state.fontSize >= 16 && state.fontSize <= 20 ? 'pass' : state.fontSize === 15 ? 'close' : 'miss',
      },
    ],
  };
}
