import { EDITORIAL_BRIEFS, EditorialBrief, HYGIENE_EXCERPTS, KERNING_WORDS } from '../../data/briefs';
import { SeededRng } from '../../engine/prng';
import { bandForScore, ExerciseResult } from '../../engine/types';

/* ─── L05: FONT PAIRING & MODULAR TYPE SCALES ───────────────────────────────────────────── */

export interface FontCandidate {
  id: string;
  name: string;
  cssFamily: string;
  classification: 'serif' | 'sans' | 'humanist-sans';
  xHeightRatio: number; // relative to body face
  isNearMiss: boolean;
  note: string;
}

export const HEADLINE_CANDIDATES: FontCandidate[] = [
  {
    id: 'fraunces',
    name: 'Fraunces',
    cssFamily: "'Fraunces Variable', Georgia, serif",
    classification: 'serif',
    xHeightRatio: 0.96,
    isNearMiss: false,
    note: 'Warm expressive serif contrasts cleanly with a clean sans body at matched x-height.',
  },
  {
    id: 'newsreader',
    name: 'Newsreader',
    cssFamily: "'Newsreader Variable', Georgia, serif",
    classification: 'serif',
    xHeightRatio: 0.94,
    isNearMiss: false,
    note: 'Crisp editorial serif establishes clear structural contrast against neo-grotesque body.',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    cssFamily: "'Plus Jakarta Sans Variable', sans-serif",
    classification: 'sans',
    xHeightRatio: 1.01,
    isNearMiss: true,
    note: 'Geometric sans closely mimics Inter body text, creating subtle near-miss friction.',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    cssFamily: "'DM Sans Variable', sans-serif",
    classification: 'sans',
    xHeightRatio: 0.99,
    isNearMiss: true,
    note: 'Too structurally similar to the body sans; reads like an accidental font mismatch.',
  },
];

export interface L05Scenario {
  brief: EditorialBrief;
  bodyFontName: string;
  bodyCssFamily: string;
  candidates: FontCandidate[];
  initialCandidateId: string;
  initialScaleRatio: number;
  targetScaleRatio: number;
}

export interface L05State {
  selectedId: string;
  scaleRatio: number;
}

export function generateL05(seed: string): L05Scenario {
  const rng = new SeededRng(`05${seed}`);
  const candidates = rng.shuffle(HEADLINE_CANDIDATES);
  const nearMiss = candidates.find((c) => c.isNearMiss) ?? candidates[0];
  return {
    brief: rng.pick(EDITORIAL_BRIEFS),
    bodyFontName: 'Inter',
    bodyCssFamily: "'Inter Variable', sans-serif",
    candidates,
    initialCandidateId: nearMiss.id,
    initialScaleRatio: rng.pick([1.08, 1.12]),
    targetScaleRatio: 1.25,
  };
}

export function scoreL05(state: L05State, scenario: L05Scenario): ExerciseResult {
  const chosen =
    scenario.candidates.find((c) => c.id === state.selectedId) ?? scenario.candidates[0];
  const pairScore = chosen.isNearMiss ? 15 : 55;
  const scaleErr = Math.abs(state.scaleRatio - scenario.targetScaleRatio);
  const scaleScore = Math.max(0, 45 - scaleErr * 170);

  const total = Math.round(Math.max(0, Math.min(100, pairScore + scaleScore)));

  let diagnosis = 'Strong serif-to-sans contrast with matched x-heights and a crisp 1.25 Major Third scale.';
  if (chosen.isNearMiss && scaleErr > 0.08) {
    diagnosis =
      `${chosen.name} looks too close to ${scenario.bodyFontName}, and the flat ${state.scaleRatio.toFixed(2)}× scale blurs heading hierarchy.`;
  } else if (chosen.isNearMiss) {
    diagnosis = `${chosen.name} shares the same sans-serif skeleton as ${scenario.bodyFontName}; pair contrasting classes (serif + sans) instead.`;
  } else if (scaleErr > 0.07) {
    diagnosis = `${chosen.name} contrasts well, though stepping headings near a 1.25× Major Third ratio gives clearer rhythm.`;
  }

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Class Contrast',
        yours: `${chosen.name} (${chosen.classification})`,
        target: 'Serif + Sans',
        status: !chosen.isNearMiss ? 'pass' : 'miss',
      },
      {
        label: 'x-Height Ratio',
        yours: `${chosen.xHeightRatio.toFixed(2)}×`,
        target: '0.90–1.10×',
        status: chosen.xHeightRatio >= 0.9 && chosen.xHeightRatio <= 1.1 ? 'pass' : 'close',
      },
      {
        label: 'Type Scale Ratio',
        yours: `${state.scaleRatio.toFixed(2)}×`,
        target: '1.25×',
        status: scaleErr <= 0.05 ? 'pass' : scaleErr <= 0.1 ? 'close' : 'miss',
      },
    ],
  };
}

/* ─── L06: PARAGRAPH FLOW (WIDOWS, RUNTS, RIVERS & RAGS) ────────────────────────────────── */

export interface L06Scenario {
  title: string;
  /** Paragraph split into words so tapping a trailing pair inserts a non-breaking space */
  words: string[];
  initialAlign: 'justify' | 'left';
  initialWidthPx: number;
  initialHyphenate: boolean;
  targetAlign: 'left';
  targetWidthPx: number;
}

export interface L06State {
  align: 'justify' | 'left';
  widthPx: number;
  hyphenate: boolean;
  boundLastPair: boolean;
}

const FLOW_PARAGRAPHS = [
  'Good typesetting balances negative space along the right edge so no lone trailing syllable mimics an accidental line break at the finish.',
  'Narrow justified columns without hyphenation force browsers to stretch spaces into ugly white rivers snaking vertically down the prose.',
  'Sculpting a calm editorial rag takes only a subtle column adjustment and binding the final two short words together cleanly.',
];

export function generateL06(seed: string): L06Scenario {
  const rng = new SeededRng(`06${seed}`);
  const para = rng.pick(FLOW_PARAGRAPHS);
  return {
    title: rng.pick(EDITORIAL_BRIEFS).headline,
    words: para.split(' '),
    initialAlign: 'justify',
    initialWidthPx: rng.int(235, 255),
    initialHyphenate: false,
    targetAlign: 'left',
    targetWidthPx: 336,
  };
}

export function scoreL06(state: L06State, scenario: L06Scenario): ExerciseResult {
  const alignScore = state.align === 'left' ? 40 : state.hyphenate ? 25 : 0;
  const runtScore = state.boundLastPair ? 35 : 0;
  const widthIdealMin = 305;
  const widthIdealMax = 380;
  let widthScore = 25;
  if (state.widthPx < widthIdealMin) {
    widthScore = Math.max(0, 25 - (widthIdealMin - state.widthPx) * 0.45);
  } else if (state.widthPx > widthIdealMax) {
    widthScore = Math.max(0, 25 - (state.widthPx - widthIdealMax) * 0.45);
  }

  const total = Math.round(Math.max(0, Math.min(100, alignScore + runtScore + widthScore)));

  const problems: string[] = [];
  if (state.align === 'justify' && !state.hyphenate) {
    problems.push('narrow justified text carves white rivers without hyphenation or ragged-right alignment');
  }
  if (!state.boundLastPair) {
    problems.push('the final word still risks stranding as a runt: tap the closing word pair to bind it with &nbsp;');
  }
  if (state.widthPx < widthIdealMin) {
    problems.push(`at ${state.widthPx} px the column is too tight for an even rag (${scenario.targetWidthPx} px works smoothly)`);
  }

  const diagnosis =
    problems.length === 0
      ? 'Ragged-right flow eliminates vertical rivers while the non-breaking space secures the final line.'
      : `${problems[0].charAt(0).toUpperCase() + problems[0].slice(1)}${problems[1] ? `, and ${problems[1]}` : ''}.`;

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Flow & Rivers',
        yours: state.align === 'left' ? 'Ragged-right' : state.hyphenate ? 'Hyphenated justify' : 'Rivers present',
        target: 'Ragged-right',
        status: state.align === 'left' ? 'pass' : state.hyphenate ? 'close' : 'miss',
      },
      {
        label: 'Closing Runt Lock',
        yours: state.boundLastPair ? 'Bound (&nbsp;)' : 'Unbound',
        target: 'Bound (&nbsp;)',
        status: state.boundLastPair ? 'pass' : 'miss',
      },
      {
        label: 'Column Measure',
        yours: `${state.widthPx} px`,
        target: '310–370 px',
        status: state.widthPx >= widthIdealMin && state.widthPx <= widthIdealMax ? 'pass' : 'close',
      },
    ],
  };
}

/* ─── L07: MICRO-TYPOGRAPHY (KERNING, TRACKING & HANGING PUNCTUATION) ───────────────────── */

export interface L07KernScenario {
  mode: 'kern';
  word: string;
  pairNote: string;
  initialOffsets: number[];
  targetOffsets: number[];
}

export interface L07MarginScenario {
  mode: 'tracking-margin';
  quote: string;
  eyebrow: string;
  author: string;
  initialCapsTracking: number; // % e.g. 0
  initialBodyTracking: number; // % e.g. +8 (bad!)
  initialHangPct: number; // % e.g. 0
  targetCapsTracking: number; // ~8%
  targetBodyTracking: number; // 0%
  targetHangPct: number; // 100%
}

export type L07Scenario = L07KernScenario | L07MarginScenario;

export interface L07State {
  offsets: number[];
  capsTracking: number;
  bodyTracking: number;
  hangPct: number;
}

export function generateL07(seed: string): L07Scenario {
  const rng = new SeededRng(`07${seed}`);
  if (rng.chance(0.55)) {
    const entry = rng.pick(KERNING_WORDS);
    // Start with noticeably clumsy spacing on interior letters while keeping endpoints usable
    const initialOffsets = entry.targets.map((t, i) =>
      i === 0 ? 0 : t + rng.int(10, 22) * (rng.chance(0.3) ? -1 : 1)
    );
    return {
      mode: 'kern',
      word: entry.word,
      pairNote: entry.pairNote,
      initialOffsets,
      targetOffsets: entry.targets,
    };
  }

  const brief = rng.pick(EDITORIAL_BRIEFS);
  return {
    mode: 'tracking-margin',
    eyebrow: brief.eyebrow,
    quote: `“${brief.subhead}”`,
    author: brief.client,
    initialCapsTracking: 0,
    initialBodyTracking: 8,
    initialHangPct: 0,
    targetCapsTracking: 8,
    targetBodyTracking: 0,
    targetHangPct: 100,
  };
}

export function scoreL07(state: L07State, scenario: L07Scenario): ExerciseResult {
  if (scenario.mode === 'kern') {
    const diffs = scenario.targetOffsets.slice(1).map((t, idx) => {
      const user = state.offsets[idx + 1] ?? 0;
      return Math.abs(user - t);
    });
    const avgErr = diffs.reduce((a, b) => a + b, 0) / Math.max(1, diffs.length);
    const maxErr = Math.max(...diffs);
    const score = Math.round(Math.max(0, Math.min(100, 100 - avgErr * 3.8)));

    const worstIdx = diffs.indexOf(maxErr);
    const pairLabel = `${scenario.word[worstIdx]}${scenario.word[worstIdx + 1]}`;
    const diagnosis =
      avgErr <= 2.5
        ? `Even negative volume between every letterform gives ${scenario.word} crisp optical poise.`
        : `The ${pairLabel} pair still sits ${state.offsets[worstIdx + 1] > scenario.targetOffsets[worstIdx + 1] ? 'too loose' : 'too tight'} by ${Math.round(maxErr)} px; equalize the white area between strokes.`;

    return {
      score,
      band: bandForScore(score),
      diagnosis,
      metrics: [
        {
          label: 'Average Pair Error',
          yours: `${avgErr.toFixed(1)} px`,
          target: '< 2.5 px',
          status: avgErr <= 2.5 ? 'pass' : avgErr <= 6 ? 'close' : 'miss',
        },
        {
          label: `Worst Pair (${pairLabel})`,
          yours: `${Math.round(state.offsets[worstIdx + 1])} px`,
          target: `${scenario.targetOffsets[worstIdx + 1]} px`,
          status: maxErr <= 3 ? 'pass' : maxErr <= 7 ? 'close' : 'miss',
        },
      ],
    };
  }

  // Tracking + Hanging Margins mode
  const capsErr = Math.abs(state.capsTracking - scenario.targetCapsTracking);
  const bodyErr = Math.abs(state.bodyTracking - scenario.targetBodyTracking);
  const hangErr = Math.abs(state.hangPct - scenario.targetHangPct);

  const capsScore = Math.max(0, 30 - capsErr * 3);
  const bodyScore = Math.max(0, 35 - bodyErr * 5);
  const hangScore = Math.max(0, 35 - hangErr * 0.4);
  const score = Math.round(Math.max(0, Math.min(100, capsScore + bodyScore + hangScore)));

  const errs: string[] = [];
  if (state.bodyTracking > 1.5) errs.push('never letterspace lowercase body copy');
  if (state.capsTracking < 4) errs.push('open ALL CAPS eyebrow tracking to +5–12%');
  if (state.hangPct < 70) errs.push('push the opening quote out into the left margin so letters align flush');

  const diagnosis =
    errs.length === 0
      ? 'Lowercase stays natural, uppercase breathes cleanly, and the hung quote keeps the left text rail crisp.'
      : `${errs[0].charAt(0).toUpperCase() + errs[0].slice(1)}${errs[1] ? ` and ${errs[1]}` : ''}.`;

  return {
    score,
    band: bandForScore(score),
    diagnosis,
    metrics: [
      {
        label: 'ALL CAPS Tracking',
        yours: `+${state.capsTracking.toFixed(0)}%`,
        target: '+5–12%',
        status: state.capsTracking >= 5 && state.capsTracking <= 12 ? 'pass' : 'miss',
      },
      {
        label: 'Lowercase Tracking',
        yours: `${state.bodyTracking > 0 ? '+' : ''}${state.bodyTracking.toFixed(0)}%`,
        target: '0%',
        status: Math.abs(state.bodyTracking) <= 1 ? 'pass' : 'miss',
      },
      {
        label: 'Hanging Quote',
        yours: `${Math.round(state.hangPct)}%`,
        target: '100%',
        status: state.hangPct >= 80 ? 'pass' : state.hangPct >= 50 ? 'close' : 'miss',
      },
    ],
  };
}

/* ─── L08: CHARACTER HYGIENE & OPENTYPE NUMERALS ────────────────────────────────────────── */

export interface L08Scenario {
  excerpt: (typeof HYGIENE_EXCERPTS)[number];
  initialSelections: Record<string, string>;
  initialTableTabular: boolean;
  initialProseOldstyle: boolean;
}

export interface L08State {
  selections: Record<string, string>;
  tableTabular: boolean;
  proseOldstyle: boolean;
}

export function generateL08(seed: string): L08Scenario {
  const rng = new SeededRng(`08${seed}`);
  const excerpt = rng.pick(HYGIENE_EXCERPTS);
  const initialSelections: Record<string, string> = {};
  for (const seg of excerpt.proseSegments) {
    initialSelections[seg.id] = seg.bad;
  }
  return {
    excerpt,
    initialSelections,
    initialTableTabular: false,
    initialProseOldstyle: false,
  };
}

export function scoreL08(state: L08State, scenario: L08Scenario): ExerciseResult {
  const totalSegs = scenario.excerpt.proseSegments.length;
  const fixedSegs = scenario.excerpt.proseSegments.filter(
    (seg) => state.selections[seg.id] === seg.good
  );
  const missedSegs = scenario.excerpt.proseSegments.filter(
    (seg) => state.selections[seg.id] !== seg.good
  );

  const charScore = (fixedSegs.length / totalSegs) * 65;
  const tableScore = state.tableTabular ? 20 : 0;
  const proseScore = state.proseOldstyle ? 15 : 0;
  const total = Math.round(charScore + tableScore + proseScore);

  const issues: string[] = [];
  if (missedSegs.length > 0) {
    issues.push(`${missedSegs.length} punctuation flaw${missedSegs.length > 1 ? 's' : ''} remain (${missedSegs[0].defectLabel.toLowerCase()})`);
  }
  if (!state.tableTabular) {
    issues.push('proportional numerals cause horizontal jitter in the live table');
  }
  if (!state.proseOldstyle) {
    issues.push('prose digits tower above lowercase without oldstyle numerals');
  }

  const diagnosis =
    issues.length === 0
      ? 'Clean smart quotes, primes, and en dashes pair with tabular lining tables and oldstyle prose numerals.'
      : `${issues[0].charAt(0).toUpperCase() + issues[0].slice(1)}${issues[1] ? `; ${issues[1]}` : ''}.`;

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Punctuation Fixed',
        yours: `${fixedSegs.length} / ${totalSegs}`,
        target: `${totalSegs} / ${totalSegs}`,
        status: fixedSegs.length === totalSegs ? 'pass' : fixedSegs.length >= 3 ? 'close' : 'miss',
      },
      {
        label: 'Table Numerals',
        yours: state.tableTabular ? 'Tabular Lining' : 'Proportional (jitter)',
        target: 'Tabular Lining',
        status: state.tableTabular ? 'pass' : 'miss',
      },
      {
        label: 'Prose Numerals',
        yours: state.proseOldstyle ? 'Oldstyle Proportional' : 'Default Lining',
        target: 'Oldstyle Proportional',
        status: state.proseOldstyle ? 'pass' : 'miss',
      },
    ],
  };
}
