import { SeededRng } from '../../engine/prng';

/**
 * Typefaces for the kerning work. Each one carries its own kerning table, made by its type designer.
 * That table is the answer key: the learner restores the spacing that the designer chose.
 */
export interface FontSpec {
  id: string;
  /** Name to show the learner. */
  name: string;
  /** CSS font-family value. */
  family: string;
  weight: number;
  /** Kind of face, for the notes and for scenes that want a style. */
  style: 'grotesk' | 'serif' | 'display';
}

export const FONTS: FontSpec[] = [
  { id: 'bricolage', name: 'Bricolage Grotesque', family: "'Bricolage Grotesque Variable', sans-serif", weight: 800, style: 'grotesk' },
  { id: 'inter', name: 'Inter', family: "'Inter Variable', sans-serif", weight: 800, style: 'grotesk' },
  { id: 'space', name: 'Space Grotesk', family: "'Space Grotesk Variable', sans-serif", weight: 700, style: 'grotesk' },
  { id: 'archivo', name: 'Archivo Black', family: "'Archivo Black', sans-serif", weight: 400, style: 'display' },
  { id: 'fraunces', name: 'Fraunces', family: "'Fraunces Variable', serif", weight: 800, style: 'serif' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display Variable', serif", weight: 800, style: 'serif' },
];

export const DEFAULT_FONT = FONTS[0];

export function getFont(id: string): FontSpec {
  return FONTS.find((f) => f.id === id) ?? DEFAULT_FONT;
}

/** A typeface for one seeded exercise. */
export function pickFont(rng: SeededRng, style?: FontSpec['style'][]): FontSpec {
  const pool = style ? FONTS.filter((f) => style.includes(f.style)) : FONTS;
  return rng.pick(pool.length ? pool : FONTS);
}

export const fontShorthand = (f: FontSpec, px: number) => `${f.weight} ${px}px ${f.family}`;

const hasFontApi = () => typeof document !== 'undefined' && typeof document.fonts !== 'undefined';

/** True when the typeface can be measured now. Without a font API (tests) the fallback model is used. */
export function fontReady(f: FontSpec): boolean {
  if (!hasFontApi()) return true;
  try {
    return document.fonts.check(fontShorthand(f, 100));
  } catch {
    return true;
  }
}

export async function loadFont(f: FontSpec): Promise<void> {
  if (!hasFontApi()) return;
  try {
    await document.fonts.load(fontShorthand(f, 100), 'AVTWYoay');
  } catch {
    // A font that does not load falls back to the model.
  }
}
