import { SeededRng } from '../../engine/prng';
import type { Target } from '../logic/challenge';
import { kernTarget } from '../logic/challenge';
import { FontSpec, pickFont } from '../logic/fonts';
import { fontKern, textWidthEm } from '../logic/kern';

/**
 * Real-world work areas. Each scene is a procedurally made layout based on a common design job.
 * The headline arrives with kerning switched off, the way text often comes in from a brief or a CMS,
 * and someone has nudged a few pairs by hand. Some pairs are already right. The learner fixes the
 * broken pairs and leaves the good ones alone.
 */

export type Genre = 'poster' | 'web' | 'magazine' | 'book' | 'sign';

export interface Palette {
  bg: string;
  ink: string;
  accent: string;
  soft: string;
}

export interface Scene {
  seed: string;
  genre: Genre;
  /** Name of the job, such as "Concert poster". */
  job: string;
  /** Why kerning matters in this job. Based on common practice. */
  brief: string;
  headline: string;
  font: FontSpec;
  palette: Palette;
  /** Artboard size in px. The scene scales to fit the stage. */
  w: number;
  h: number;
  /** Headline size on the artboard, in px. */
  size: number;
  align: 'left' | 'center';
  /** Supporting copy, drawn around the headline. */
  copy: { kicker: string; lines: string[]; small: string; button?: string };
  /** Seeded numbers for shapes. */
  shapes: number[];
  letters: string[];
  gapHandle: Array<number | null>;
  pairs: Array<[string, string]>;
  targets: Target[];
  start: number[];
  labels: string[];
}

interface GenreSpec {
  job: string;
  brief: string;
  headlines: string[];
  fonts: FontSpec['style'][];
  w: number;
  h: number;
  maxSize: number;
  /** Share of the artboard width the headline may use. */
  fill: number;
  align: 'left' | 'center';
  kickers: string[];
  lines: string[][];
  smalls: string[];
  buttons?: string[];
}

const GENRES: Record<Genre, GenreSpec> = {
  poster: {
    job: 'Concert poster',
    brief:
      'Swiss-style concert poster in large capitals. At this size every uneven gap shows from across the street. Fix the pairs before it goes to print.',
    headlines: ['VOLTA', 'AVANT', 'WAVE', 'NOVA YARD', 'LAVA', 'TRAVAY', 'FLY AWAY'],
    fonts: ['grotesk', 'display'],
    w: 800,
    h: 1100,
    maxSize: 230,
    fill: 0.86,
    align: 'left',
    kickers: ['Live at the Hall', 'Open air series', 'One night only', 'Season opener'],
    lines: [
      ['Friday 14 March', 'Doors 19:30', 'Concert Hall, Main Street'],
      ['Saturday 2 August', 'Gates 18:00', 'Riverside Park Stage'],
      ['Thursday 9 October', 'Doors 20:00', 'Old Tram Depot'],
    ],
    smalls: ['Tickets at the box office and online', 'All ages. Free entry before 20:00', 'Presented by the City Arts Trust'],
  },
  web: {
    job: 'Landing page hero',
    brief:
      'Website hero heading. The browser applies the font’s kerning only when it is switched on, and this build has it off. Kern the display heading by hand.',
    headlines: ['Your Way', 'Try Waverly', 'Travel Today', 'Pay Your Way', 'Typeface Lab', 'Raw Data, Faster'],
    fonts: ['grotesk'],
    w: 1280,
    h: 760,
    maxSize: 128,
    fill: 0.52,
    align: 'left',
    kickers: ['New: version 2.0', 'For small teams', 'Now in beta'],
    lines: [
      ['Plan, track and ship your work in one place.', 'Set up in minutes. No card needed.'],
      ['A calm workspace for teams that care about the details.', 'Free for up to five people.'],
      ['Book, pay and change trips without the queue.', 'Live in thirty countries.'],
    ],
    smalls: ['Features', 'Pricing', 'Docs', 'Sign in'],
    buttons: ['Start free', 'Get started', 'Book a demo'],
  },
  magazine: {
    job: 'Magazine masthead',
    brief:
      'Magazine masthead. A masthead prints on every issue, so designers kern it by hand, pair by pair, and lock it as artwork.',
    headlines: ['VOYAGER', 'AVENUE', 'WAYFARE', 'TROVE', 'LAYOVER', 'VELVET'],
    fonts: ['serif', 'display'],
    w: 840,
    h: 1100,
    maxSize: 210,
    fill: 0.88,
    align: 'center',
    kickers: ['Issue 42', 'Spring edition', 'The travel issue'],
    lines: [
      ['48 hours in Lisbon', 'The quiet return of film cameras', 'Why we walk'],
      ['Inside the night trains of Europe', 'A kitchen with no recipes', 'Ten new voices'],
    ],
    smalls: ['£9.50', 'Volume 7', 'Monthly'],
  },
  book: {
    job: 'Book jacket',
    brief:
      'Novel jacket with a serif title. A serif that reads well in body text often needs extra kerning at display size, where its gaps grow with it.',
    headlines: ['The Yarrow', 'Wolf Year', 'Lyra Vale', 'To Avalon', 'Tidewater', 'Raven Days'],
    fonts: ['serif'],
    w: 700,
    h: 1050,
    maxSize: 150,
    fill: 0.84,
    align: 'center',
    kickers: ['A novel', 'Winner of the First Novel Prize', 'The new novel'],
    lines: [['“A quiet, fierce book.”', 'The Sunday Review']],
    smalls: ['ANNA OKAFOR', 'MILES TAVERNER', 'JUNE VALLAS'],
  },
  sign: {
    job: 'Café sign',
    brief:
      'Shop-front sign. People read it from across the road, where a loose pair splits one word into two. Cut vinyl keeps every mistake.',
    headlines: ['Wave Coffee', 'Yolk & Toast', 'Tavola', 'Rye & Wheat', 'Avo Bar'],
    fonts: ['display', 'serif'],
    w: 1200,
    h: 700,
    maxSize: 190,
    fill: 0.82,
    align: 'center',
    kickers: ['Est. 2019', 'Since 1987', 'Bakery and kitchen'],
    lines: [['Open daily 7 till 4'], ['Breakfast all day'], ['Fresh bread from 8']],
    smalls: ['Coffee · Bread · Wine', 'Eat in or take away'],
  },
};

export const GENRE_IDS = Object.keys(GENRES) as Genre[];

export const PALETTES: Palette[] = [
  { bg: '#F2EFE6', ink: '#141414', accent: '#E4362C', soft: '#D9D3C3' },
  { bg: '#101820', ink: '#F4F1EA', accent: '#F2B134', soft: '#26323D' },
  { bg: '#D9EEE1', ink: '#10302A', accent: '#FF6B3D', soft: '#B5DCC5' },
  { bg: '#1E2A78', ink: '#FFF7E8', accent: '#FFB4A2', soft: '#2E3C96' },
  { bg: '#FFFFFF', ink: '#1A1A1A', accent: '#3A5BFF', soft: '#ECEEF5' },
  { bg: '#E8D5C4', ink: '#3B1F14', accent: '#2F6B5F', soft: '#D7BFA9' },
];

/** Starting values: how far a nudged pair is moved, in kerning target half-widths. See the plan. */
const NUDGE_MIN = 2.5;
const NUDGE_MAX = 5.5;
/** Share of pairs that someone has nudged by hand. Starting value. */
const NUDGE_SHARE = 0.35;
/** A scene always has at least this many broken pairs. */
const MIN_BROKEN = 2;

/** Room kept for the kerning the learner adds, in em per gap. A wrong start can open a pair. */
const GAP_ROOM_EM = 0.06;

export function buildScene(seed: string, genre?: Genre): Scene {
  const rng = new SeededRng(seed);
  const g: Genre = genre ?? rng.pick(GENRE_IDS);
  const spec = GENRES[g];
  const headline = rng.pick(spec.headlines);
  const font = pickFont(rng, spec.fonts);
  const palette = rng.pick(PALETTES);
  const letters = Array.from(headline);
  const widthEm = textWidthEm(font, headline) + GAP_ROOM_EM * (letters.length - 1);
  const size = Math.round(Math.min(spec.maxSize, (spec.w * spec.fill) / widthEm));

  const gapHandle: Array<number | null> = [];
  const pairs: Array<[string, string]> = [];
  for (let i = 1; i < letters.length; i++) {
    if (letters[i] === ' ' || letters[i - 1] === ' ') gapHandle.push(null);
    else {
      gapHandle.push(pairs.length);
      pairs.push([letters[i - 1], letters[i]]);
    }
  }
  const targets = pairs.map(([l, r]) => kernTarget(fontKern(font, l, r)));
  const half = (t: Target) => (t.hi - t.lo) / 2;
  const inside = (v: number, t: Target) => v >= t.lo && v <= t.hi;
  const nudge = (t: Target) => {
    const c = (t.lo + t.hi) / 2;
    const d = half(t) * rng.range(NUDGE_MIN, NUDGE_MAX);
    return Math.round(rng.chance() ? c + d : c - d);
  };

  // Kerning off: every pair starts at the font's plain spacing. Then a few pairs are nudged by hand.
  const start = targets.map((t) => (rng.chance(NUDGE_SHARE) ? nudge(t) : 0));
  let broken = start.filter((v, i) => !inside(v, targets[i])).length;
  const need = Math.min(targets.length, Math.max(MIN_BROKEN, Math.ceil(targets.length * 0.4)));
  for (const i of rng.shuffle(targets.map((_, k) => k))) {
    if (broken >= need) break;
    if (inside(start[i], targets[i])) {
      start[i] = nudge(targets[i]);
      broken += 1;
    }
  }

  const lines = rng.pick(spec.lines);
  return {
    seed,
    genre: g,
    job: spec.job,
    brief: spec.brief,
    headline,
    font,
    palette,
    w: spec.w,
    h: spec.h,
    size,
    align: spec.align,
    copy: {
      kicker: rng.pick(spec.kickers),
      lines,
      small: rng.pick(spec.smalls),
      button: spec.buttons ? rng.pick(spec.buttons) : undefined,
    },
    shapes: Array.from({ length: 6 }, () => rng.float()),
    letters,
    gapHandle,
    pairs,
    targets,
    start,
    labels: pairs.map(([l, r]) => `Space between ${l} and ${r}`),
  };
}

/** The font for a scene, so the app can load it before it builds the scene. */
export function sceneFont(seed: string, genre?: Genre): FontSpec {
  const rng = new SeededRng(seed);
  const g: Genre = genre ?? rng.pick(GENRE_IDS);
  const spec = GENRES[g];
  rng.pick(spec.headlines);
  return pickFont(rng, spec.fonts);
}
