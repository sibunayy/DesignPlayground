import { describe, expect, it } from 'vitest';
import { dailySeedCode, normalizeSeedCode, SeededRng } from '../prng';

describe('SeededRng & seed codes', () => {
  it('normalizes seed codes cleanly to 4 uppercase hex chars', () => {
    expect(normalizeSeedCode('4f9a')).toBe('4F9A');
    expect(normalizeSeedCode('#a1')).toBe('00A1');
    expect(normalizeSeedCode('zzz')).toBe('4F9A');
  });

  it('produces identical deterministic sequences for identical seeds', () => {
    const a = new SeededRng('9C2E');
    const b = new SeededRng('9c2e');
    const seqA = Array.from({ length: 10 }, () => a.float());
    const seqB = Array.from({ length: 10 }, () => b.float());
    expect(seqA).toEqual(seqB);
  });

  it('produces distinct sequences for distinct seeds', () => {
    const a = new SeededRng('1111');
    const b = new SeededRng('2222');
    expect(a.float()).not.toBe(b.float());
  });

  it('generates stable daily seed codes for a given ISO date', () => {
    expect(dailySeedCode('2026-11-20')).toBe(dailySeedCode('2026-11-20'));
    expect(dailySeedCode('2026-11-20')).not.toBe(dailySeedCode('2026-11-21'));
  });
});
