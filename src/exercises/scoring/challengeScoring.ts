import { EDITORIAL_PHOTOS, EditorialPhotoMeta } from '../../data/photoCatalog';
import {
  apcaContrast,
  hexToRgb,
  hslToHex,
  oklchToHex,
  rgbToOklch,
  wcagContrastRatio,
} from '../../engine/colorMath';
import { SeededRng } from '../../engine/prng';
import { bandForScore, ExerciseResult } from '../../engine/types';

/* ─── L09: OPTICAL ALIGNMENT & CONCENTRIC BORDER RADII ──────────────────────────────────── */

export interface L09OpticalScenario {
  mode: 'optical-center';
  shape: 'play' | 'arrow-right' | 'star' | 'avatar-dot';
  label: string;
  targetX: number; // offset from geometric center in px
  targetY: number;
  initialX: number;
  initialY: number;
}

export interface L09RadiiScenario {
  mode: 'concentric-radii';
  outerRadius: number;
  padding: number;
  initialInnerRadius: number;
  targetInnerRadius: number;
}

export type L09Scenario = L09OpticalScenario | L09RadiiScenario;

export interface L09State {
  offsetX: number;
  offsetY: number;
  innerRadius: number;
}

export function generateL09(seed: string): L09Scenario {
  const rng = new SeededRng(`09${seed}`);
  if (rng.chance(0.55)) {
    const shapes: Array<{
      shape: L09OpticalScenario['shape'];
      label: string;
      tx: number;
      ty: number;
    }> = [
      { shape: 'play', label: 'Center the play triangle inside the circular button', tx: 6, ty: 0 },
      { shape: 'arrow-right', label: 'Center the directional arrow visually inside the pill', tx: -4, ty: 0 },
      { shape: 'star', label: 'Balance the 5-point star optically inside its circular badge', tx: 0, ty: -4 },
      { shape: 'avatar-dot', label: 'Track the status dot along the circular avatar perimeter', tx: -7, ty: -7 },
    ];
    const picked = rng.pick(shapes);
    return {
      mode: 'optical-center',
      shape: picked.shape,
      label: picked.label,
      targetX: picked.tx,
      targetY: picked.ty,
      initialX: 0,
      initialY: 0,
    };
  }

  const outerRadius = rng.pick([24, 28, 32]);
  const padding = rng.pick([12, 16, 20]);
  return {
    mode: 'concentric-radii',
    outerRadius,
    padding,
    initialInnerRadius: outerRadius, // classic mistake: reusing outer token!
    targetInnerRadius: Math.max(0, outerRadius - padding),
  };
}

export function scoreL09(state: L09State, scenario: L09Scenario): ExerciseResult {
  if (scenario.mode === 'optical-center') {
    const err = Math.hypot(state.offsetX - scenario.targetX, state.offsetY - scenario.targetY);
    const score = Math.round(Math.max(0, Math.min(100, 100 - err * 9.5)));
    const diagnosis =
      err <= 2.5
        ? 'Optical nudge offsets the asymmetrical ink weight so the icon looks genuinely centered.'
        : `Geometric centering leaves visual weight biased: nudge roughly (${scenario.targetX > 0 ? '+' : ''}${scenario.targetX} px, ${scenario.targetY > 0 ? '+' : ''}${scenario.targetY} px) toward the lighter side.`;

    return {
      score,
      band: bandForScore(score),
      diagnosis,
      metrics: [
        {
          label: 'Optical Nudge (X, Y)',
          yours: `${state.offsetX.toFixed(1)}, ${state.offsetY.toFixed(1)} px`,
          target: `${scenario.targetX}, ${scenario.targetY} px`,
          status: err <= 2.5 ? 'pass' : err <= 5 ? 'close' : 'miss',
        },
      ],
    };
  }

  const err = Math.abs(state.innerRadius - scenario.targetInnerRadius);
  const score = Math.round(Math.max(0, Math.min(100, 100 - err * 5.2)));
  const diagnosis =
    err <= 2
      ? `Inner radius (${Math.round(state.innerRadius)} px) shares the exact arc center of the outer ${scenario.outerRadius} px frame.`
      : `Equal or mismatched radii pinch the diagonal corners: subtract ${scenario.padding} px padding from ${scenario.outerRadius} px outer radius to get ${scenario.targetInnerRadius} px.`;

  return {
    score,
    band: bandForScore(score),
    diagnosis,
    metrics: [
      {
        label: 'Inner Corner Radius',
        yours: `${Math.round(state.innerRadius)} px`,
        target: `${scenario.targetInnerRadius} px`,
        status: err <= 2 ? 'pass' : err <= 5 ? 'close' : 'miss',
      },
      {
        label: 'Formula Check',
        yours: `${scenario.outerRadius} − ${scenario.padding}`,
        target: `${scenario.targetInnerRadius} px`,
        status: err <= 2 ? 'pass' : 'miss',
      },
    ],
  };
}

/* ─── L10: PERCEPTUAL COLOR (OKLCH, APCA & DARK MODE) ───────────────────────────────────── */

export interface L10Scenario {
  mode: 'oklch-match' | 'apca-contrast' | 'dark-mode';
  referenceHex: string;
  targetHue: number;
  targetLightness: number; // 0..1
  targetChroma: number;
  bgHex: string;
  targetLcMin: number;
  initialL: number;
  initialC: number;
  initialBgL: number; // for dark mode ground calibration
}

export interface L10State {
  l: number;
  c: number;
  bgL: number;
}

export function generateL10(seed: string): L10Scenario {
  const rng = new SeededRng(`10${seed}`);
  const roll = rng.int(0, 2);

  if (roll === 0) {
    // OKLCH perceived lightness match across diverging hues (warm gold/green vs cobalt blue)
    const refHue = rng.pick([92, 68, 138]);
    const targetHue = rng.pick([260, 275]);
    const refL = 0.72;
    const referenceHex = oklchToHex({ l: refL, c: 0.14, h: refHue });
    // Naive HSL 50% blue sits around OKLCH L ~ 0.45, far darker than perceived 0.72
    const hslNaive = rgbToOklch(hexToRgb(hslToHex(targetHue, 85, 50)));
    return {
      mode: 'oklch-match',
      referenceHex,
      targetHue,
      targetLightness: refL,
      targetChroma: 0.13,
      bgHex: '#FFFFFF',
      targetLcMin: 0,
      initialL: Number(Math.min(0.48, hslNaive.l).toFixed(2)),
      initialC: 0.19,
      initialBgL: 1,
    };
  }

  if (roll === 1) {
    // APCA Lc Contrast + Chromatic Vibration fix
    const bgHex = '#FFFFFF';
    const targetHue = rng.pick([28, 255, 165]);
    return {
      mode: 'apca-contrast',
      referenceHex: '#FFFFFF',
      targetHue,
      targetLightness: 0.44,
      targetChroma: 0.13,
      bgHex,
      targetLcMin: 75,
      initialL: 0.72, // bright orange/blue failing APCA Lc 75!
      initialC: 0.24,
      initialBgL: 1,
    };
  }

  // Dark Mode calibration: fix #000000 pure black halation & neon accent
  return {
    mode: 'dark-mode',
    referenceHex: '#18181B',
    targetHue: 18,
    targetLightness: 0.72,
    targetChroma: 0.13,
    bgHex: '#18181B',
    targetLcMin: 60,
    initialL: 0.62,
    initialC: 0.25, // radioactive neon saturation on pure black
    initialBgL: 0.0, // pure #000000 halation trap!
  };
}

export function scoreL10(state: L10State, scenario: L10Scenario): ExerciseResult {
  if (scenario.mode === 'oklch-match') {
    const userHex = oklchToHex({ l: state.l, c: state.c, h: scenario.targetHue });
    const actualL = rgbToOklch(hexToRgb(userHex)).l;
    const errL = Math.abs(actualL - scenario.targetLightness);
    const score = Math.round(Math.max(0, Math.min(100, 100 - errL * 380)));

    const diagnosis =
      errL <= 0.035
        ? 'Both hues share matching OKLCH lightness and appear equally balanced in grayscale.'
        : `Perceived lightness differs by ${(errL * 100).toFixed(0)} points: adjust OKLCH L toward ${scenario.targetLightness.toFixed(2)} so grayscale luminance matches.`;

    return {
      score,
      band: bandForScore(score),
      diagnosis,
      metrics: [
        {
          label: 'Perceived Lightness (L)',
          yours: actualL.toFixed(2),
          target: scenario.targetLightness.toFixed(2),
          status: errL <= 0.035 ? 'pass' : errL <= 0.08 ? 'close' : 'miss',
        },
      ],
    };
  }

  if (scenario.mode === 'apca-contrast') {
    const fgHex = oklchToHex({ l: state.l, c: state.c, h: scenario.targetHue });
    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(scenario.bgHex);
    const lc = Math.abs(apcaContrast(fgRgb, bgRgb));
    const wcag = wcagContrastRatio(fgRgb, bgRgb);
    const lcErr = Math.max(0, scenario.targetLcMin - lc);
    const overDark = lc > 95 ? (lc - 95) * 0.4 : 0;
    const score = Math.round(Math.max(0, Math.min(100, 100 - lcErr * 2.5 - overDark)));

    const diagnosis =
      lc >= scenario.targetLcMin
        ? `Perceptual contrast reaches APCA Lc ${lc.toFixed(0)} (${wcag.toFixed(1)}:1 WCAG), crisp for sustained body reading.`
        : `Contrast sits at APCA Lc ${lc.toFixed(0)} (below Lc ${scenario.targetLcMin}): lower lightness L or dial back vibrating chroma.`;

    return {
      score,
      band: bandForScore(score),
      diagnosis,
      metrics: [
        {
          label: 'APCA Contrast',
          yours: `Lc ${lc.toFixed(0)}`,
          target: `≥ Lc ${scenario.targetLcMin}`,
          status: lc >= scenario.targetLcMin ? 'pass' : lc >= 60 ? 'close' : 'miss',
        },
        {
          label: 'WCAG 2 Ratio',
          yours: `${wcag.toFixed(1)}:1`,
          target: '≥ 4.5:1',
          status: wcag >= 4.5 ? 'pass' : 'close',
        },
      ],
    };
  }

  // Dark Mode calibration
  const bgHex = oklchToHex({ l: state.bgL, c: 0.005, h: 260 });
  const accentHex = oklchToHex({ l: state.l, c: state.c, h: scenario.targetHue });
  const textRgb = hexToRgb('#E4E2DC');
  const bgRgb = hexToRgb(bgHex);
  const lc = Math.abs(apcaContrast(textRgb, bgRgb));
  const bgOk = state.bgL >= 0.17 && state.bgL <= 0.25;
  const chromaOk = state.c <= 0.16;

  const bgPenalty = bgOk ? 0 : Math.abs(state.bgL - 0.21) * 260;
  const chromaPenalty = chromaOk ? 0 : (state.c - 0.16) * 260;
  const accentLc = Math.abs(apcaContrast(hexToRgb(accentHex), bgRgb));
  const accentPenalty = accentLc < 55 ? (55 - accentLc) * 1.4 : 0;
  const score = Math.round(Math.max(0, Math.min(100, 100 - bgPenalty - chromaPenalty - accentPenalty)));

  const problems: string[] = [];
  if (state.bgL < 0.14) problems.push('pure near-black ground triggers halation glare around bright letters');
  else if (state.bgL > 0.27) problems.push('surface gray is too pale for true dark-room contrast');
  if (state.c > 0.16) problems.push('oversaturated accent chroma vibrates against the dark ground');

  const diagnosis =
    problems.length === 0
      ? `Calibrated dark neutral surface (${bgHex}) and softened accent chroma eliminate halation while holding Lc ${lc.toFixed(0)}.`
      : `${problems[0].charAt(0).toUpperCase() + problems[0].slice(1)}${problems[1] ? `, and ${problems[1]}` : ''}.`;

  return {
    score,
    band: bandForScore(score),
    diagnosis,
    metrics: [
      {
        label: 'Surface Ground',
        yours: `${bgHex} (L ${state.bgL.toFixed(2)})`,
        target: 'L 0.18–0.24',
        status: bgOk ? 'pass' : 'miss',
      },
      {
        label: 'Accent Chroma',
        yours: state.c.toFixed(2),
        target: '≤ 0.16',
        status: chromaOk ? 'pass' : 'miss',
      },
      {
        label: 'Accent APCA',
        yours: `Lc ${accentLc.toFixed(0)}`,
        target: '≥ Lc 55',
        status: accentLc >= 55 ? 'pass' : 'close',
      },
    ],
  };
}

/* ─── L11: ICONOGRAPHY GRIDS & VISUAL WEIGHT ──────────────────────────────────────────────── */

export interface IconPoint {
  x: number;
  y: number;
}

export interface L11Scenario {
  iconName: string;
  initialPoints: IconPoint[];
  targetPoints: IconPoint[];
  initialStroke: number;
  targetStroke: number;
}

export interface L11State {
  points: IconPoint[];
  stroke: number;
}

export function generateL11(seed: string): L11Scenario {
  const rng = new SeededRng(`11${seed}`);
  const presets: Array<{ name: string; target: IconPoint[]; stroke: number }> = [
    {
      name: 'Bookmark Flag',
      target: [
        { x: 6, y: 4 },
        { x: 18, y: 4 },
        { x: 18, y: 20 },
        { x: 12, y: 15 },
        { x: 6, y: 20 },
      ],
      stroke: 2,
    },
    {
      name: 'Home Pavilion',
      target: [
        { x: 4, y: 10 },
        { x: 12, y: 4 },
        { x: 20, y: 10 },
        { x: 19, y: 20 },
        { x: 5, y: 20 },
      ],
      stroke: 2,
    },
    {
      name: 'Compass Needle',
      target: [
        { x: 12, y: 3 },
        { x: 19, y: 12 },
        { x: 12, y: 21 },
        { x: 5, y: 12 },
      ],
      stroke: 1.75,
    },
  ];
  const preset = rng.pick(presets);
  // Perturb two vertices onto fractional/off-safe-area coordinates
  const initialPoints = preset.target.map((p, idx) => {
    if (idx === 0) return { x: Math.max(1.5, p.x - 1.4), y: Math.max(1.2, p.y - 1.4) };
    if (idx === 1) return { x: p.x + 0.6, y: p.y + 0.4 };
    if (idx === 2) return { x: p.x + 0.5, y: Math.min(22.6, p.y + 1.3) };
    return { ...p };
  });

  return {
    iconName: preset.name,
    initialPoints,
    targetPoints: preset.target,
    initialStroke: 2.75,
    targetStroke: preset.stroke,
  };
}

export function scoreL11(state: L11State, scenario: L11Scenario): ExerciseResult {
  let snapPenalties = 0;
  let safeViolations = 0;
  let shapeDrift = 0;

  state.points.forEach((pt, idx) => {
    const fracX = Math.abs(pt.x - Math.round(pt.x));
    const fracY = Math.abs(pt.y - Math.round(pt.y));
    if (fracX > 0.1 || fracY > 0.1) snapPenalties += 1;
    if (pt.x < 2 || pt.x > 22 || pt.y < 2 || pt.y > 22) safeViolations += 1;
    const t = scenario.targetPoints[idx];
    shapeDrift += Math.hypot(pt.x - t.x, pt.y - t.y);
  });

  const strokeErr = Math.abs(state.stroke - scenario.targetStroke);
  const score = Math.round(
    Math.max(
      0,
      Math.min(100, 100 - shapeDrift * 11 - snapPenalties * 8 - safeViolations * 12 - strokeErr * 22)
    )
  );

  const issues: string[] = [];
  if (safeViolations > 0) issues.push('vertices enter the outer 2 px safe padding zone');
  if (snapPenalties > 0) issues.push('fractional anchor coordinates blur crisp 1× edges');
  if (strokeErr > 0.4) issues.push(`${state.stroke} px stroke appears heavier than the ${scenario.targetStroke} px reference keylines`);

  const diagnosis =
    issues.length === 0
      ? 'Integer-snapped vertices inside the 20×20 live area and balanced stroke weight match neighboring keylines.'
      : `${issues[0].charAt(0).toUpperCase() + issues[0].slice(1)}${issues[1] ? `, and ${issues[1]}` : ''}.`;

  return {
    score,
    band: bandForScore(score),
    diagnosis,
    metrics: [
      {
        label: 'Off-Grid Vertices',
        yours: `${snapPenalties}`,
        target: '0',
        status: snapPenalties === 0 ? 'pass' : 'miss',
      },
      {
        label: 'Safe Padding (≥2 px)',
        yours: safeViolations === 0 ? 'Clear' : `${safeViolations} clipped`,
        target: 'Clear',
        status: safeViolations === 0 ? 'pass' : 'miss',
      },
      {
        label: 'Stroke Weight',
        yours: `${state.stroke.toFixed(2)} px`,
        target: `${scenario.targetStroke.toFixed(2)} px`,
        status: strokeErr <= 0.25 ? 'pass' : 'close',
      },
    ],
  };
}

/* ─── L12: IMAGE FRAMING, ANATOMY & TANGENTS ────────────────────────────────────────────── */

export interface CropRect {
  x: number; // normalized [0..1]
  y: number;
  w: number;
  h: number;
}

export interface L12Scenario {
  photo: EditorialPhotoMeta;
  aspectRatio: number; // w / h in normalized photo units adjusted for natural dims
  aspectLabel: string;
  initialCrop: CropRect;
  initialTiltDeg: number; // seeded photo tilt that needs leveling back to 0°
  idealCrop: CropRect;
}

export interface L12State {
  crop: CropRect;
  rotationDeg: number; // counter-rotation applied to image (ideal = -initialTiltDeg)
}

export function generateL12(seed: string): L12Scenario {
  const rng = new SeededRng(`12${seed}`);
  const photo = rng.pick(EDITORIAL_PHOTOS);

  if (photo.id === 'portrait-architect') {
    return {
      photo,
      aspectRatio: 4 / 5,
      aspectLabel: '4:5 Editorial Portrait',
      // Starts cropping straight through the wrists/hairline with a door-frame tangent!
      initialCrop: { x: 0.22, y: 0.26, w: 0.53, h: 0.49 },
      initialTiltDeg: rng.pick([0, 2.5]),
      idealCrop: { x: 0.16, y: 0.12, w: 0.64, h: 0.6 },
    };
  }

  if (photo.id === 'figure-ceramicist') {
    return {
      photo,
      aspectRatio: 3 / 4,
      aspectLabel: '3:4 Full Figure',
      // Initial bad crop slices right through knees (y=0.74) & crowds head
      initialCrop: { x: 0.24, y: 0.14, w: 0.6, h: 0.6 },
      initialTiltDeg: rng.pick([0, -2]),
      idealCrop: { x: 0.1, y: 0.07, w: 0.86, h: 0.86 },
    };
  }

  if (photo.id === 'figure-dancer') {
    return {
      photo,
      aspectRatio: 4 / 5,
      aspectLabel: '4:5 Studio Study',
      // Initial crop kisses extended fingertips tangent at x=0.23 and cuts ankles at y=0.85
      initialCrop: { x: 0.23, y: 0.24, w: 0.65, h: 0.61 },
      initialTiltDeg: rng.pick([0, 2]),
      idealCrop: { x: 0.1, y: 0.14, w: 0.84, h: 0.78 },
    };
  }

  // editorial-gallery (3:2 landscape)
  const tilt = rng.pick([-3.5, 3.5]);
  return {
    photo,
    aspectRatio: 3 / 2,
    aspectLabel: '3:2 Architectural Spread',
    initialCrop: { x: 0.14, y: 0.26, w: 0.52, h: 0.52 },
    initialTiltDeg: tilt,
    idealCrop: { x: 0.16, y: 0.22, w: 0.76, h: 0.75 },
  };
}

export function scoreL12(state: L12State, scenario: L12Scenario): ExerciseResult {
  const { crop, rotationDeg } = state;
  const { photo } = scenario;
  const cropBottom = crop.y + crop.h;
  const cropRight = crop.x + crop.w;

  // 1. Horizon leveling
  const netTilt = Math.abs(scenario.initialTiltDeg + rotationDeg);
  const tiltPenalty = Math.max(0, netTilt - 0.5) * 8;

  // 2. Joint amputation check: top or bottom edge landing within ±0.032 of any joint
  const cutJoints = photo.joints.filter(
    (j) =>
      Math.abs(cropBottom - j.y) < 0.032 ||
      (crop.y > j.y - 0.025 && crop.y < j.y + 0.025)
  );
  const jointPenalty = cutJoints.length * 24;

  // 3. Hairline / Headroom check
  let headPenalty = 0;
  let headLabel = 'Clean';
  if (photo.topOfHeadY !== undefined && photo.hairlineY !== undefined) {
    if (crop.y > photo.topOfHeadY - 0.015 && crop.y < photo.hairlineY + 0.04) {
      headPenalty = 24;
      headLabel = 'Hairline grazed';
    } else if (crop.y > photo.hairlineY + 0.04) {
      headPenalty = 28;
      headLabel = 'Crown clipped';
    }
  }

  // 4. Eye alignment near upper third of portrait crop box (or natural headroom for full-body)
  let eyePenalty = 0;
  let eyeThirdPos = 0.33;
  if (photo.eyeLineY !== undefined) {
    eyeThirdPos = (photo.eyeLineY - crop.y) / Math.max(0.1, crop.h);
    if (photo.kind === 'portrait') {
      const eyeErr = Math.abs(eyeThirdPos - 0.33);
      eyePenalty = Math.max(0, eyeErr - 0.08) * 80;
    } else if (photo.topOfHeadY !== undefined) {
      const headroomFrac = (photo.topOfHeadY - crop.y) / Math.max(0.1, crop.h);
      if (headroomFrac < 0.04) eyePenalty = 16;
      else if (headroomFrac > 0.36) eyePenalty = 12;
    }
  }

  // 5. Edge tangents check
  const hitTangents = photo.tangentLines.filter(
    (t) =>
      t.axis === 'x' &&
      (Math.abs(crop.x - t.pos) < 0.022 || Math.abs(cropRight - t.pos) < 0.022)
  );
  const tangentPenalty = hitTangents.length * 16;

  // 6. Gaze lead room
  let gazePenalty = 0;
  if (photo.eyeCenterX !== undefined && photo.gazeDir) {
    const relX = (photo.eyeCenterX - crop.x) / Math.max(0.1, crop.w);
    if (photo.gazeDir === 1 && relX > 0.64) gazePenalty = 14;
    if (photo.gazeDir === -1 && relX < 0.36) gazePenalty = 14;
  }

  const score = Math.round(
    Math.max(0, Math.min(100, 100 - tiltPenalty - jointPenalty - headPenalty - eyePenalty - tangentPenalty - gazePenalty))
  );

  const issues: string[] = [];
  if (cutJoints.length > 0) issues.push(`crop slices near the ${cutJoints[0].label.toLowerCase()}; shift mid-limb instead`);
  if (headPenalty > 0) issues.push('top edge grazes the hairline without breathing headroom');
  if (netTilt > 1.2) issues.push(`horizon leans ${netTilt.toFixed(1)}° off level`);
  if (hitTangents.length > 0) issues.push(`border kisses the ${hitTangents[0].label.toLowerCase()} creating a tangent`);
  if (gazePenalty > 0) issues.push('leave more space ahead of the subject’s gaze');
  if (issues.length === 0 && eyePenalty > 8) issues.push('align eyes closer to the upper-third line');

  const diagnosis =
    issues.length === 0
      ? 'Clean headroom, mid-limb clearance, upper-third eye placement, and zero edge tangents.'
      : `${issues[0].charAt(0).toUpperCase() + issues[0].slice(1)}${issues[1] ? `; ${issues[1]}` : ''}.`;

  return {
    score,
    band: bandForScore(score),
    diagnosis,
    metrics: [
      {
        label: 'Anatomical Clearance',
        yours: cutJoints.length === 0 ? headLabel : `Cuts ${cutJoints[0].label}`,
        target: 'Mid-limb + headroom',
        status: cutJoints.length === 0 && headPenalty === 0 ? 'pass' : 'miss',
      },
      {
        label: 'Eye Thirds Position',
        yours: `${Math.round(eyeThirdPos * 100)}% from top`,
        target: '~33% upper third',
        status: Math.abs(eyeThirdPos - 0.33) <= 0.08 ? 'pass' : 'close',
      },
      {
        label: 'Horizon & Tangents',
        yours: `${netTilt.toFixed(1)}° · ${hitTangents.length} tangent`,
        target: '0.0° · 0 tangents',
        status: netTilt <= 0.8 && hitTangents.length === 0 ? 'pass' : 'miss',
      },
    ],
  };
}

/* ─── L13: PRINT PRODUCTION & PREPRESS HYGIENE ──────────────────────────────────────────── */

export interface L13Scenario {
  client: string;
  headline: string;
  initialBleedMm: number; // starts 0 mm (flush to trim!)
  initialSafeMm: number; // starts 1 mm (too close to trim!)
  initialRichBlackSmallText: boolean; // true = C40 M20 Y20 K100 (bad!)
  initialLowResLogo: boolean; // true = 72 DPI raster JPEG (bad!)
  targetBleedMm: number; // >= 3 mm
  targetSafeMm: number; // >= 4 mm
}

export interface L13State {
  bleedMm: number;
  safeMm: number;
  richBlackSmallText: boolean;
  lowResLogo: boolean;
}

export function generateL13(seed: string): L13Scenario {
  const rng = new SeededRng(`13${seed}`);
  const clients = [
    { client: 'Kunsthalle Zürich', headline: 'Winter Architecture Symposium' },
    { client: 'Atelier Nord', headline: 'Letterpress Specimen Postcard' },
    { client: 'Kanso Roasters', headline: 'Harvest Tasting Invitation' },
  ];
  const picked = rng.pick(clients);
  return {
    ...picked,
    initialBleedMm: 0,
    initialSafeMm: 1,
    initialRichBlackSmallText: true,
    initialLowResLogo: true,
    targetBleedMm: 3,
    targetSafeMm: 4,
  };
}

export function scoreL13(state: L13State, scenario: L13Scenario): ExerciseResult {
  const bleedOk = state.bleedMm >= 3;
  const safeOk = state.safeMm >= 3.5;

  const bleedScore = bleedOk ? 30 : Math.max(0, state.bleedMm * 10);
  const safeScore = safeOk ? 25 : Math.max(0, state.safeMm * 6.5);
  const inkScore = state.richBlackSmallText ? 0 : 25;
  const logoScore = state.lowResLogo ? 0 : 20;

  const total = Math.round(Math.max(0, Math.min(100, bleedScore + safeScore + inkScore + logoScore)));

  const problems: string[] = [];
  if (!bleedOk) problems.push(`extend artwork to ${scenario.targetBleedMm} mm bleed so ±0.5 mm cut drift never leaves white slivers`);
  if (!safeOk) problems.push(`pull copy ${scenario.targetSafeMm} mm inside trim`);
  if (state.richBlackSmallText) problems.push('switch small black body text from 4-color rich black to 100% K');
  if (state.lowResLogo) problems.push('swap the 72 DPI raster mark for vector');

  const diagnosis =
    problems.length === 0
      ? 'Press-ready: 3 mm bleed, safe margins, 100% K small body ink, and crisp vector mark pass pre-flight.'
      : `${problems[0].charAt(0).toUpperCase() + problems[0].slice(1)}${problems[1] ? `, and ${problems[1]}` : ''}.`;

  return {
    score: total,
    band: bandForScore(total),
    diagnosis,
    metrics: [
      {
        label: 'Edge Bleed',
        yours: `${state.bleedMm.toFixed(1)} mm`,
        target: '≥ 3.0 mm',
        status: bleedOk ? 'pass' : state.bleedMm >= 2 ? 'close' : 'miss',
      },
      {
        label: 'Text Safe Inset',
        yours: `${state.safeMm.toFixed(1)} mm`,
        target: '≥ 4.0 mm',
        status: safeOk ? 'pass' : state.safeMm >= 2.5 ? 'close' : 'miss',
      },
      {
        label: 'Small Black Text',
        yours: state.richBlackSmallText ? '4-Color Rich' : '100% K Only',
        target: '100% K Only',
        status: !state.richBlackSmallText ? 'pass' : 'miss',
      },
      {
        label: 'Logo Asset',
        yours: state.lowResLogo ? '72 DPI Raster' : 'Vector SVG/PDF',
        target: 'Vector',
        status: !state.lowResLogo ? 'pass' : 'miss',
      },
    ],
  };
}
