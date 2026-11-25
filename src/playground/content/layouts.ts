import { SeededRng } from '../../engine/prng';
import type { Target } from '../logic/challenge';
import { Palette, PALETTES } from './scenes';

/**
 * Layout games: "Spot the drift".
 *
 * The seed builds a page on a modular grid (columns and rows with one gutter). Every block sits on
 * grid lines, so blocks share edges. Then someone nudges 2 to 4 blocks off the grid by a few pixels.
 * The learner finds the blocks that drifted and puts them back, using the edges they share with
 * other blocks. The grid stays hidden until the review.
 *
 * Each block has two handles: x offset and y offset from its place on the grid, in artboard px.
 * The answer for every handle is 0.
 */

export type LayoutJob = 'editorial' | 'dashboard' | 'landing' | 'poster';

export type BlockKind = 'image' | 'heading' | 'text' | 'chart' | 'card' | 'stat' | 'quote';

export interface GridSpec {
  cols: number;
  rows: number;
  /** Outer margin, artboard px. */
  margin: number;
  /** Space between columns and between rows, artboard px. */
  gutter: number;
  /** Left edge of each column, then right edge of each column. */
  colLeft: number[];
  colRight: number[];
  rowTop: number[];
  rowBottom: number[];
}

export interface Block {
  kind: BlockKind;
  label: string;
  col: number;
  span: number;
  row: number;
  rowSpan: number;
  /** Place on the grid, artboard px. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Seeded numbers for the block's inner drawing. */
  seed: number[];
}

export interface DriftLayout {
  seed: string;
  job: LayoutJob;
  jobName: string;
  brief: string;
  w: number;
  h: number;
  grid: GridSpec;
  palette: Palette;
  blocks: Block[];
  /** Two handles per block: 2b is the x offset, 2b + 1 is the y offset. */
  targets: Target[];
  start: number[];
  labels: string[];
  /** For each handle, a block that shares the grid line on that axis, or -1. Used in the notes. */
  anchors: number[];
  /** For each handle, the block it belongs to. Used to count one break per block. */
  groups: number[];
}

/** Starting value: half-width of the target, artboard px. See design/game-design/plan.md, section 8. */
export const DRIFT_HALF = 4;
/** Starting values: how far a drifted block moves, in half-widths. Same rule as kerning scenes. */
const DRIFT_MIN = 2.5;
const DRIFT_MAX = 5.5;
/** Offsets the learner can reach, artboard px. */
export const DRIFT_RANGE = { min: -150, max: 150 };

interface JobSpec {
  name: string;
  brief: string;
  w: number;
  h: number;
  cols: number[];
  rows: number[];
  margin: number;
  gutters: number[];
  /** Band heights in rows. */
  bands: number[];
  big: BlockKind[];
  small: BlockKind[];
  /** The first band holds a heading. */
  headFirst: boolean;
}

const JOBS: Record<LayoutJob, JobSpec> = {
  editorial: {
    name: 'Magazine page',
    brief: 'Magazine pages put pictures and text on one column grid, so their edges line up across the page.',
    w: 1200,
    h: 900,
    cols: [6, 12],
    rows: [6, 8],
    margin: 64,
    gutters: [24, 32],
    bands: [1, 2, 3],
    big: ['image', 'image', 'text', 'quote'],
    small: ['text', 'text', 'quote', 'image'],
    headFirst: true,
  },
  dashboard: {
    name: 'Dashboard',
    brief: 'Dashboards line cards up on a 12-column grid, so numbers scan in clean rows and columns.',
    w: 1280,
    h: 800,
    cols: [12],
    rows: [6, 8],
    margin: 32,
    gutters: [16, 24],
    bands: [1, 2, 2, 3],
    big: ['chart', 'chart', 'card'],
    small: ['stat', 'stat', 'card'],
    headFirst: false,
  },
  landing: {
    name: 'Landing page',
    brief: 'Landing pages build each section on a 12-column grid. Shared edges make a long page feel calm.',
    w: 1200,
    h: 1000,
    cols: [12],
    rows: [8],
    margin: 72,
    gutters: [24, 32],
    bands: [1, 2, 2, 3],
    big: ['image', 'card', 'image'],
    small: ['text', 'card', 'stat'],
    headFirst: true,
  },
  poster: {
    name: 'Swiss poster',
    brief: 'Swiss International Style posters put every element on a modular grid of columns and rows.',
    w: 900,
    h: 1260,
    cols: [4, 6],
    rows: [6, 8],
    margin: 56,
    gutters: [20, 28],
    bands: [1, 2, 3],
    big: ['image', 'text', 'image', 'quote'],
    small: ['text', 'quote', 'text', 'image'],
    headFirst: true,
  },
};

export const LAYOUT_JOBS = Object.keys(JOBS) as LayoutJob[];

/** Column splits in twelfths. A split is used only when every part is a whole number of columns. */
const SPLITS = [[12], [6, 6], [4, 4, 4], [8, 4], [4, 8], [3, 3, 3, 3], [9, 3], [3, 9], [6, 3, 3], [3, 3, 6]];

const KIND_NAME: Record<BlockKind, string> = {
  image: 'Photo',
  heading: 'Heading',
  text: 'Text',
  chart: 'Chart',
  card: 'Card',
  stat: 'Number',
  quote: 'Quote',
};

function makeGrid(w: number, h: number, cols: number, rows: number, margin: number, gutter: number): GridSpec {
  const colW = (w - 2 * margin - (cols - 1) * gutter) / cols;
  const rowH = (h - 2 * margin - (rows - 1) * gutter) / rows;
  const colLeft = Array.from({ length: cols }, (_, i) => Math.round(margin + i * (colW + gutter)));
  const colRight = Array.from({ length: cols }, (_, i) => Math.round(margin + (i + 1) * colW + i * gutter));
  const rowTop = Array.from({ length: rows }, (_, i) => Math.round(margin + i * (rowH + gutter)));
  const rowBottom = Array.from({ length: rows }, (_, i) => Math.round(margin + (i + 1) * rowH + i * gutter));
  return { cols, rows, margin, gutter, colLeft, colRight, rowTop, rowBottom };
}

/** Splits the rows into bands, then each band into blocks across the columns. */
function placeBlocks(rng: SeededRng, spec: JobSpec, grid: GridSpec): Block[] {
  const splits = SPLITS.filter((s) => s.every((p) => (p * grid.cols) % 12 === 0));
  const blocks: Block[] = [];
  const counts: Partial<Record<BlockKind, number>> = {};
  let row = 0;
  let band = 0;
  while (row < grid.rows) {
    const left = grid.rows - row;
    const fits = spec.bands.filter((b) => b <= left);
    const rowSpan = band === 0 && spec.headFirst ? 1 : fits.length ? rng.pick(fits) : left;
    // A heading band is one wide block, so the first band always gives the page a strong left edge.
    const headSplits = [[12], [8, 4], [9, 3]].filter((s) => splits.some((v) => v.join() === s.join()));
    const split = band === 0 && spec.headFirst ? rng.pick(headSplits) : rng.pick(splits);
    let col = 0;
    split.forEach((p, i) => {
      const span = (p * grid.cols) / 12;
      const kind: BlockKind =
        band === 0 && spec.headFirst && i === 0
          ? 'heading'
          : rowSpan >= 2 && span / grid.cols >= 1 / 3
            ? rng.pick(spec.big)
            : rng.pick(spec.small);
      counts[kind] = (counts[kind] ?? 0) + 1;
      blocks.push({
        kind,
        label: '',
        col,
        span,
        row,
        rowSpan,
        x: grid.colLeft[col],
        y: grid.rowTop[row],
        w: grid.colRight[col + span - 1] - grid.colLeft[col],
        h: grid.rowBottom[row + rowSpan - 1] - grid.rowTop[row],
        seed: [rng.float(), rng.float(), rng.float(), rng.float()],
      });
      col += span;
    });
    row += rowSpan;
    band += 1;
  }
  // Number blocks of the same kind, so the notes can name them.
  const seen: Partial<Record<BlockKind, number>> = {};
  for (const b of blocks) {
    seen[b.kind] = (seen[b.kind] ?? 0) + 1;
    b.label = (counts[b.kind] ?? 0) > 1 ? `${KIND_NAME[b.kind]} ${seen[b.kind]}` : KIND_NAME[b.kind];
  }
  return blocks;
}

/** A block, other than `self` and not in `skip`, that shares a grid line with `self` on this axis. */
function anchorFor(blocks: Block[], self: number, axis: 'x' | 'y', skip: Set<number>): number {
  const b = blocks[self];
  return blocks.findIndex((c, i) => {
    if (i === self || skip.has(i)) return false;
    return axis === 'x'
      ? c.col === b.col || c.col + c.span === b.col + b.span
      : c.row === b.row || c.row + c.rowSpan === b.row + b.rowSpan;
  });
}

export function buildDrift(seed: string, job?: LayoutJob): DriftLayout {
  const rng = new SeededRng(seed);
  const j: LayoutJob = job ?? rng.pick(LAYOUT_JOBS);
  const spec = JOBS[j];
  const grid = makeGrid(spec.w, spec.h, rng.pick(spec.cols), rng.pick(spec.rows), spec.margin, rng.pick(spec.gutters));
  const palette = rng.pick(PALETTES);
  const blocks = placeBlocks(rng, spec, grid);

  const start = blocks.flatMap(() => [0, 0]);
  const targets = start.map(() => ({ lo: -DRIFT_HALF, hi: DRIFT_HALF }));
  const want = Math.min(rng.int(2, 4), Math.max(2, Math.floor(blocks.length / 2)));
  // Blocks that drift on x or y. A block drifts only on an axis where another, still-placed block
  // shares its grid line, so the learner always has an edge to line it up with.
  const driftedX = new Set<number>();
  const driftedY = new Set<number>();
  for (const b of rng.shuffle(blocks.map((_, i) => i))) {
    if (new Set([...driftedX, ...driftedY]).size >= want) break;
    const roll = rng.float();
    const axes: Array<'x' | 'y'> = roll < 0.4 ? ['x'] : roll < 0.75 ? ['y'] : ['x', 'y'];
    for (const axis of axes) {
      const set = axis === 'x' ? driftedX : driftedY;
      if (anchorFor(blocks, b, axis, set) < 0) continue;
      const size = blocks[b];
      const room = axis === 'x' ? [size.x, spec.w - size.x - size.w] : [size.y, spec.h - size.y - size.h];
      const dist = Math.round(rng.range(DRIFT_MIN, DRIFT_MAX) * DRIFT_HALF);
      let sign = rng.chance(0.5) ? 1 : -1;
      if ((sign < 0 && room[0] < dist) || (sign > 0 && room[1] < dist)) sign = -sign;
      start[b * 2 + (axis === 'x' ? 0 : 1)] = sign * dist;
      set.add(b);
    }
  }

  const anchors = start.map((_, h) => {
    const b = Math.floor(h / 2);
    const axis = h % 2 === 0 ? 'x' : 'y';
    return anchorFor(blocks, b, axis, axis === 'x' ? driftedX : driftedY);
  });
  const labels = blocks.flatMap((b) => [`${b.label} across`, `${b.label} up and down`]);
  return {
    seed,
    job: j,
    jobName: spec.name,
    brief: spec.brief,
    w: spec.w,
    h: spec.h,
    grid,
    palette,
    blocks,
    targets,
    start,
    labels,
    anchors,
    groups: start.map((_, h) => Math.floor(h / 2)),
  };
}
