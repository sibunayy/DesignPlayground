/**
 * Deterministic 32-bit PRNG (Mulberry32) seeded by 4-character hex codes (e.g. '4F9A').
 */
export function normalizeSeedCode(seed: string): string {
  const cleaned = seed.replace(/[^a-fA-F0-9]/g, '').toUpperCase().slice(0, 4);
  if (cleaned.length === 0) return '4F9A';
  return cleaned.padStart(4, '0');
}

export function hashSeed(seed: string): number {
  const norm = normalizeSeedCode(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < norm.length; i += 1) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRng {
  private state: number;
  public readonly seedCode: string;

  constructor(seed: string) {
    this.seedCode = normalizeSeedCode(seed);
    this.state = hashSeed(this.seedCode) || 0x9e3779b9;
  }

  /** Uniform float in [0, 1) */
  float(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform float in [min, max) */
  range(min: number, max: number): number {
    return min + this.float() * (max - min);
  }

  /** Integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Boolean with probability p */
  chance(p = 0.5): boolean {
    return this.float() < p;
  }

  /** Deterministic array element selection */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('SeededRng.pick called with empty array');
    }
    return items[this.int(0, items.length - 1)];
  }

  /** Deterministic Fisher-Yates copy shuffle */
  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export function randomSeedCode(): string {
  const n = Math.floor(Math.random() * 0xffff);
  return n.toString(16).toUpperCase().padStart(4, '0');
}

export function dailySeedCode(isoDate?: string): string {
  const dateStr = isoDate ?? new Date().toISOString().slice(0, 10);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}
