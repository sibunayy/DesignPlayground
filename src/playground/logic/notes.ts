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
