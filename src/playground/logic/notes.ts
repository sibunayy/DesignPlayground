import type { DriftLayout } from '../content/layouts';
import { Mode } from '../types';
import { KIND_REASON, pairKind } from './kern';
import { centreOf, halfOf, HandleReview, Review } from './scoring';

export interface ReviewNote {
  /** Handle number, 1-based, as shown on the marks. */
  n: number;
  title: string;
  body: string;
  grade: HandleReview['grade'];
}

const fmt = (v: number) => (v > 0 ? `+${Math.round(v)}` : `${Math.round(v)}`);

/** Notes for a kerning answer: one per pair that needs one, worst first, then one line on what went well. */
export function kernNotes(review: Review, pairs: Array<[string, string]>): ReviewNote[] {
  const notes: ReviewNote[] = [];
  const sorted = [...review.handles].sort((a, b) => Math.abs(b.error) - Math.abs(a.error));
  for (const h of sorted) {
    const [l, r] = pairs[h.index];
    const name = `${l}${r}`;
    const font = centreOf(h.target);
    const numbers = `Yours ${fmt(h.value)}, type designer ${fmt(font)}.`;
    if (h.broken) {
      notes.push({
        n: h.index + 1,
        grade: h.grade,
        title: `${name}: this pair was already right`,
        body: `You moved it out of place. ${numbers} Check each pair before you change it.`,
      });
      continue;
    }
    if (h.startedGood && h.grade !== 'miss') continue;
    if (h.grade === 'exact') continue;
    const dir = h.error > 0 ? 'too open' : 'too tight';
    const fix = h.error > 0 ? 'Close it up' : 'Open it up';
    const zero = Math.abs(font) <= 4;
    const reason = zero
      ? 'This font needs no kerning here. Its plain spacing is already right, so leave the pair at 0.'
      : KIND_REASON[pairKind(l, r)];
    if (h.untouched) {
      notes.push({ n: h.index + 1, grade: h.grade, title: `${name}: not moved`, body: `You left this pair where it started. ${numbers} ${reason}` });
      continue;
    }
    notes.push({
      n: h.index + 1,
      grade: h.grade,
      title: h.grade === 'zone' ? `${name}: close, a little ${dir}` : `${name}: ${dir} by ${Math.abs(Math.round(h.error))}`,
      body: `${fix}. ${numbers} ${reason}`,
    });
  }
  const exact = review.handles.filter((h) => h.grade === 'exact' && h.scored).length;
  if (exact > 0) {
    notes.push({ n: 0, grade: 'exact', title: `${exact} ${exact === 1 ? 'pair' : 'pairs'} exact`, body: 'These match the type designer’s own kerning.' });
  }
  return notes;
}

/** Notes for the other modes: one per handle that is off, using the mode's own feedback lines. */
export function modeNotes(review: Review, mode: Mode, labels: string[], unit: string): ReviewNote[] {
  return review.handles.map((h) => {
    const off = Math.round(Math.abs(h.error));
    const line = h.grade === 'miss' ? (h.error > 0 ? mode.feedback.loose : mode.feedback.tight) : mode.feedback.good;
    const range = `Target ${Math.round(h.target.lo)} to ${Math.round(h.target.hi)}${unit}, yours ${Math.round(h.value)}${unit}.`;
    const title =
      h.grade === 'exact'
        ? `${labels[h.index]}: exact`
        : h.grade === 'zone'
          ? `${labels[h.index]}: in the zone, ${off}${unit} from the centre`
          : `${labels[h.index]}: off by ${Math.max(0, off - Math.round(halfOf(h.target)))}${unit}`;
    return { n: h.index + 1, grade: h.grade, title, body: `${h.untouched ? 'You did not move this. ' : ''}${line} ${range}` };
  });
}

/** How a layout block sits against its grid lines: "12 px too far right and 9 px too low". */
function driftWords(x: HandleReview, y: HandleReview, all = false): string {
  const parts: string[] = [];
  const add = (h: HandleReview, plus: string, minus: string) => {
    const off = Math.round(Math.abs(h.error));
    if (off === 0 || (!all && h.grade === 'exact')) return;
    parts.push(`${off} px ${h.error > 0 ? plus : minus}`);
  };
  add(x, 'too far right', 'too far left');
  add(y, 'too low', 'too high');
  return parts.join(' and ');
}

/** Notes for "Spot the drift": one per block that drifted or that the learner broke, worst first. */
export function driftNotes(review: Review, layout: DriftLayout): ReviewNote[] {
  const rank = { miss: 2, zone: 1, exact: 0 } as const;
  const items = layout.blocks.map((b, i) => {
    const x = review.handles[i * 2];
    const y = review.handles[i * 2 + 1];
    const scored = [x, y].filter((h) => h.scored);
    const grade = [x, y]
      .filter((h) => h.scored || h.broken)
      .reduce<HandleReview['grade']>((g, h) => (rank[h.grade] > rank[g] ? h.grade : g), 'exact');
    return { b, i, x, y, scored, grade, err: Math.abs(x.error) + Math.abs(y.error), broken: x.broken || y.broken };
  });
  const notes: ReviewNote[] = [];
  for (const it of [...items].sort((a, b) => b.err - a.err)) {
    const { b, i, x, y, scored, grade, broken } = it;
    if (broken) {
      notes.push({
        n: i + 1,
        grade: 'miss',
        title: `${b.label}: this block was already on the grid`,
        body: `You moved it ${driftWords(x, y, true)}. Check that a block is off before you move it.`,
      });
      continue;
    }
    if (!scored.length || grade === 'exact') continue;
    // Name the block that shares the line on the worst axis, so the learner knows what to line up with.
    const worst = scored.reduce((a, h) => (Math.abs(h.error) > Math.abs(a.error) ? h : a));
    const a = layout.anchors[worst.index];
    const isX = worst.index % 2 === 0;
    let hint = '';
    if (a >= 0) {
      const o = layout.blocks[a];
      const edge = isX ? (o.col === b.col ? 'left edge' : 'right edge') : o.row === b.row ? 'top' : 'bottom';
      hint = `Line its ${edge} up with ${o.label}.`;
    }
    const where = driftWords(x, y);
    if (scored.every((h) => h.untouched)) {
      notes.push({ n: i + 1, grade, title: `${b.label}: not moved`, body: `It sat ${where}. ${hint}` });
      continue;
    }
    notes.push({
      n: i + 1,
      grade,
      title: grade === 'zone' ? `${b.label}: close, ${where}` : `${b.label}: ${where}`,
      body: hint || 'Move it back onto its grid lines.',
    });
  }
  const exact = items.filter((it) => it.scored.length && !it.broken && it.grade === 'exact').length;
  if (exact > 0) {
    notes.push({ n: 0, grade: 'exact', title: `${exact} ${exact === 1 ? 'block' : 'blocks'} back on the grid`, body: 'These sit exactly on their grid lines.' });
  }
  return notes;
}

/** The unit the learner sees for each mode, after a value. */
export const MODE_UNIT: Record<Mode['id'], string> = {
  kerning: '',
  tracking: '',
  leading: '%',
  wordspace: '',
  measure: ' ch',
  paragraph: '%',
  margins: '%',
};
