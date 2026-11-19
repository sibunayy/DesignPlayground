import { describe, expect, it } from 'vitest';
import {
  generateL01,
  generateL02,
  generateL03,
  generateL04,
  gridColBounds,
  scoreL01,
  scoreL02,
  scoreL03,
  scoreL04,
} from '../scoring/foundationScoring';
import {
  generateL05,
  generateL06,
  generateL07,
  generateL08,
  HEADLINE_CANDIDATES,
  scoreL05,
  scoreL06,
  scoreL07,
  scoreL08,
} from '../scoring/buildingScoring';
import {
  generateL09,
  generateL10,
  generateL11,
  generateL12,
  generateL13,
  scoreL09,
  scoreL10,
  scoreL11,
  scoreL12,
  scoreL13,
} from '../scoring/challengeScoring';
import { ExerciseResult } from '../../engine/types';

function assertConciseDiagnosis(res: ExerciseResult) {
  expect(res.diagnosis.trim().length).toBeGreaterThan(12);
  const sentences = res.diagnosis.split(/[.!?]\s+/).filter(Boolean);
  expect(sentences.length).toBeLessThanOrEqual(2);
}

describe('All 13 Scoring & Diagnosis Engines', () => {
  it('L01 White Space: grades ideal >= 95 and classic trapped flaw < 55', () => {
    const s = generateL01('4F9A');
    const ideal = scoreL01({ margin: 32, blockX: 0, blockY: 0, hasBox: false }, s);
    const flawed = scoreL01(
      { margin: s.initialMargin, blockX: s.initialBlockX, blockY: s.initialBlockY, hasBox: true },
      s
    );
    expect(ideal.score).toBeGreaterThanOrEqual(95);
    expect(flawed.score).toBeLessThan(55);
    assertConciseDiagnosis(ideal);
    assertConciseDiagnosis(flawed);
  });

  it('L02 Hierarchy: grades 2.4x ratio + single CTA >= 94 and equal spacing + dual accent < 55', () => {
    const s = generateL02('4F9A');
    const ideal = scoreL02({ headGap: 8, sectionGap: 28, badgeAccent: false }, s);
    const flawed = scoreL02(
      { headGap: s.initialHeadGap, sectionGap: s.initialSectionGap, badgeAccent: true },
      s
    );
    expect(ideal.score).toBeGreaterThanOrEqual(94);
    expect(flawed.score).toBeLessThan(55);
    assertConciseDiagnosis(flawed);
  });

  it('L03 Grids: grades column-snapped + 24px padding == 100 and gutter bleed < 70', () => {
    const s = generateL03('4F9A');
    const t1 = gridColBounds(0, 4, s.colWidth, s.gutter);
    const t2 = gridColBounds(4, 4, s.colWidth, s.gutter);
    const ideal = scoreL03(
      { card1X: t1.x, card1W: t1.w, card2X: t2.x, card2W: t2.w, cardPad: 24 },
      s
    );
    const flawed = scoreL03(
      {
        card1X: s.initialCard1.x,
        card1W: s.initialCard1.w,
        card2X: s.initialCard2.x,
        card2W: s.initialCard2.w,
        cardPad: s.initialPad,
      },
      s
    );
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBeLessThan(70);
    assertConciseDiagnosis(flawed);
  });

  it('L04 Macro-Type: grades 17px / 1.55 / 500px == 100 and seeded flaws < 75', () => {
    const s = generateL04('4F9A');
    const ideal = scoreL04({
      fontSize: s.targetFontSize,
      leading: s.targetLeading,
      measurePx: s.targetMeasurePx,
    });
    const seededFlaw = scoreL04({
      fontSize: s.initialFontSize,
      leading: s.initialLeading,
      measurePx: s.initialMeasurePx,
    });
    const severeFlaw = scoreL04({ fontSize: 13, leading: 1.15, measurePx: 650 });
    expect(ideal.score).toBe(100);
    expect(seededFlaw.score).toBeLessThan(82);
    expect(severeFlaw.score).toBeLessThan(65);
    assertConciseDiagnosis(severeFlaw);
  });

  it('L05 Font Pairing: grades contrasting serif + 1.25 scale == 100 and near-miss sans < 50', () => {
    const s = generateL05('4F9A');
    const serif = HEADLINE_CANDIDATES.find((c) => !c.isNearMiss)!;
    const nearMiss = HEADLINE_CANDIDATES.find((c) => c.isNearMiss)!;
    const ideal = scoreL05({ selectedId: serif.id, scaleRatio: 1.25 }, s);
    const flawed = scoreL05({ selectedId: nearMiss.id, scaleRatio: 1.08 }, s);
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBeLessThan(50);
    assertConciseDiagnosis(flawed);
  });

  it('L06 Paragraph Flow: grades ragged-right + bound pair == 100 and justified narrow < 40', () => {
    const s = generateL06('4F9A');
    const ideal = scoreL06({ align: 'left', widthPx: 336, hyphenate: false, boundLastPair: true }, s);
    const flawed = scoreL06(
      { align: 'justify', widthPx: s.initialWidthPx, hyphenate: false, boundLastPair: false },
      s
    );
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBeLessThan(40);
    assertConciseDiagnosis(flawed);
  });

  it('L07 Micro-Type: grades exact offsets/tracking/hang == 100 across seeds', () => {
    for (const seed of ['0001', '0004', 'A1B2', 'FFFF']) {
      const s = generateL07(seed);
      const ideal =
        s.mode === 'kern'
          ? scoreL07({ offsets: s.targetOffsets, capsTracking: 0, bodyTracking: 0, hangPct: 0 }, s)
          : scoreL07({ offsets: [0], capsTracking: 8, bodyTracking: 0, hangPct: 100 }, s);
      const flawed =
        s.mode === 'kern'
          ? scoreL07({ offsets: s.initialOffsets, capsTracking: 0, bodyTracking: 0, hangPct: 0 }, s)
          : scoreL07({ offsets: [0], capsTracking: 0, bodyTracking: 8, hangPct: 0 }, s);
      expect(ideal.score).toBe(100);
      expect(flawed.score).toBeLessThan(65);
      assertConciseDiagnosis(flawed);
    }
  });

  it('L08 Character Hygiene: grades all clean chars + tabular/oldstyle == 100 and raw typos == 0', () => {
    const s = generateL08('4F9A');
    const goodSel: Record<string, string> = {};
    for (const seg of s.excerpt.proseSegments) goodSel[seg.id] = seg.good;
    const ideal = scoreL08({ selections: goodSel, tableTabular: true, proseOldstyle: true }, s);
    const flawed = scoreL08(
      { selections: s.initialSelections, tableTabular: false, proseOldstyle: false },
      s
    );
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBe(0);
    assertConciseDiagnosis(flawed);
  });

  it('L09 Optical Geometry: covers both optical centering and concentric radii', () => {
    for (const seed of ['0001', '0007', '4F9A', 'C0DE']) {
      const s = generateL09(seed);
      const ideal =
        s.mode === 'optical-center'
          ? scoreL09({ offsetX: s.targetX, offsetY: s.targetY, innerRadius: 0 }, s)
          : scoreL09({ offsetX: 0, offsetY: 0, innerRadius: s.targetInnerRadius }, s);
      const flawed =
        s.mode === 'optical-center'
          ? scoreL09({ offsetX: 0, offsetY: 0, innerRadius: 0 }, s)
          : scoreL09({ offsetX: 0, offsetY: 0, innerRadius: s.initialInnerRadius }, s);
      expect(ideal.score).toBe(100);
      expect(flawed.score).toBeLessThan(65);
      assertConciseDiagnosis(flawed);
    }
  });

  it('L10 Perceptual Color: validates OKLCH, APCA Lc, and Dark Mode calibration', () => {
    for (const seed of ['0001', '0002', '0003', '0009', 'ABCD']) {
      const s = generateL10(seed);
      const ideal = scoreL10(
        {
          l: s.targetLightness,
          c: s.targetChroma,
          bgL: s.mode === 'dark-mode' ? 0.21 : 1,
        },
        s
      );
      const flawed = scoreL10({ l: s.initialL, c: s.initialC, bgL: s.initialBgL }, s);
      expect(ideal.score).toBeGreaterThanOrEqual(94);
      expect(flawed.score).toBeLessThan(65);
      assertConciseDiagnosis(flawed);
    }
  });

  it('L11 Iconography: grades integer live-area snap == 100 and fractional off-safe < 65', () => {
    const s = generateL11('4F9A');
    const ideal = scoreL11({ points: s.targetPoints, stroke: s.targetStroke }, s);
    const flawed = scoreL11({ points: s.initialPoints, stroke: s.initialStroke }, s);
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBeLessThan(65);
    assertConciseDiagnosis(flawed);
  });

  it('L12 Image Framing: grades ideal crop >= 92 and initial joint/tangent flaw < 75 across photos', () => {
    for (const seed of ['0001', '0002', '0004', '0008', '4F9A']) {
      const s = generateL12(seed);
      const ideal = scoreL12({ crop: s.idealCrop, rotationDeg: -s.initialTiltDeg }, s);
      const flawed = scoreL12({ crop: s.initialCrop, rotationDeg: 0 }, s);
      expect(ideal.score).toBeGreaterThanOrEqual(92);
      expect(flawed.score).toBeLessThan(ideal.score);
      assertConciseDiagnosis(flawed);
    }
  });

  it('L13 Print Prepress: grades 3mm bleed + 4mm safe + 100% K + vector == 100 and initial == 6.5', () => {
    const s = generateL13('4F9A');
    const ideal = scoreL13(
      { bleedMm: 3, safeMm: 4, richBlackSmallText: false, lowResLogo: false },
      s
    );
    const flawed = scoreL13(
      { bleedMm: 0, safeMm: 1, richBlackSmallText: true, lowResLogo: true },
      s
    );
    expect(ideal.score).toBe(100);
    expect(flawed.score).toBeLessThan(20);
    assertConciseDiagnosis(flawed);
  });
});
