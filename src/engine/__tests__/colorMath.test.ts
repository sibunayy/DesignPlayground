import { describe, expect, it } from 'vitest';
import { apcaContrast, hexToRgb, oklchToRgb, rgbToOklch, wcagContrastRatio } from '../colorMath';

describe('Perceptual Color Math (OKLCH, WCAG 2.1, APCA)', () => {
  it('round-trips OKLCH <-> sRGB accurately within sRGB gamut', () => {
    const samples = ['#D94526', '#216E4E', '#3A66B8', '#E5C64B', '#141413', '#F7F6F2'];
    for (const hex of samples) {
      const rgb = hexToRgb(hex);
      const lch = rgbToOklch(rgb);
      const back = oklchToRgb(lch);
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
    }
  });

  it('computes WCAG 2.1 contrast ratio accurately for black/white', () => {
    const black = hexToRgb('#000000');
    const white = hexToRgb('#FFFFFF');
    expect(wcagContrastRatio(black, white)).toBeCloseTo(21, 2);
    expect(wcagContrastRatio(white, white)).toBeCloseTo(1, 2);
  });

  it('computes polarity-aware APCA W3 Lc contrast against reference benchmarks', () => {
    const black = hexToRgb('#000000');
    const white = hexToRgb('#FFFFFF');
    // BoW (#000 on #FFF) ~ +106 Lc
    const bow = apcaContrast(black, white);
    expect(bow).toBeGreaterThan(104);
    expect(bow).toBeLessThan(108);

    // WoB (#FFF on #000) ~ -108 Lc
    const wob = apcaContrast(white, black);
    expect(wob).toBeLessThan(-105);
    expect(wob).toBeGreaterThan(-110);
  });
});
