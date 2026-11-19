export interface RgbColor {
  r: number; // 0..255
  g: number; // 0..255
  b: number; // 0..255
}

export interface OklchColor {
  l: number; // 0..1 perceived lightness
  c: number; // 0..~0.37 chroma
  h: number; // 0..360 hue degrees
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function srgbChannelToLinear(c255: number): number {
  const c = clamp01(c255 / 255);
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgbChannel(lin: number): number {
  const c = clamp01(lin);
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(clamp01(v) * 255);
}

export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function inLinearGamut(r: number, g: number, b: number): boolean {
  const eps = 1e-4;
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;
}

export function rgbToOklch(rgb: RgbColor): OklchColor {
  const [L, a, b] = linearSrgbToOklab(
    srgbChannelToLinear(rgb.r),
    srgbChannelToLinear(rgb.g),
    srgbChannelToLinear(rgb.b)
  );
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: clamp01(L), c, h: c < 1e-5 ? 0 : h };
}

/**
 * Converts OKLCH to sRGB with binary-search chroma clipping so lightness & hue stay faithful in sRGB.
 */
export function oklchToRgb({ l, c, h }: OklchColor): RgbColor {
  const L = clamp01(l);
  const rad = (h * Math.PI) / 180;
  const cosH = Math.cos(rad);
  const sinH = Math.sin(rad);

  const test = (chroma: number) => oklabToLinearSrgb(L, chroma * cosH, chroma * sinH);
  let [r, g, b] = test(Math.max(0, c));

  if (!inLinearGamut(r, g, b)) {
    let lo = 0;
    let hi = Math.max(0, c);
    for (let i = 0; i < 16; i += 1) {
      const mid = (lo + hi) * 0.5;
      const [tr, tg, tb] = test(mid);
      if (inLinearGamut(tr, tg, tb)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    [r, g, b] = test(lo);
  }

  return {
    r: linearToSrgbChannel(r),
    g: linearToSrgbChannel(g),
    b: linearToSrgbChannel(b),
  };
}

export function oklchToHex(oklch: OklchColor): string {
  return rgbToHex(oklchToRgb(oklch));
}

export function hslToRgb(hDeg: number, sPct: number, lPct: number): RgbColor {
  const h = ((hDeg % 360) + 360) % 360;
  const s = clamp01(sPct / 100);
  const l = clamp01(lPct / 100);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function hslToHex(hDeg: number, sPct: number, lPct: number): string {
  return rgbToHex(hslToRgb(hDeg, sPct, lPct));
}

/** WCAG 2.1 relative luminance */
export function wcagLuminance(rgb: RgbColor): number {
  const r = srgbChannelToLinear(rgb.r);
  const g = srgbChannelToLinear(rgb.g);
  const b = srgbChannelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function wcagContrastRatio(fg: RgbColor, bg: RgbColor): number {
  const l1 = wcagLuminance(fg);
  const l2 = wcagLuminance(bg);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

/**
 * APCA W3 (0.0.98G-4g) polarity-aware perceptual contrast (Lc).
 * Positive Lc = dark text on light background (BoW).
 * Negative Lc = light text on dark background (WoB).
 */
export function apcaContrast(fg: RgbColor, bg: RgbColor): number {
  const sRco = 0.2126729;
  const sGco = 0.7151522;
  const sBco = 0.072175;

  const mainTRC = 2.4;
  const blkThrs = 0.022;
  const blkClmp = 1.414;
  const deltaYmin = 0.0005;
  const scaleBoW = 1.14;
  const scaleWoB = 1.14;
  const loBoWoffset = 0.027;
  const loWoBoffset = 0.027;
  const loClip = 0.1;

  const toY = (rgb: RgbColor) =>
    sRco * Math.pow(clamp01(rgb.r / 255), mainTRC) +
    sGco * Math.pow(clamp01(rgb.g / 255), mainTRC) +
    sBco * Math.pow(clamp01(rgb.b / 255), mainTRC);

  let txtY = toY(fg);
  let bgY = toY(bg);

  if (txtY < blkThrs) txtY += Math.pow(blkThrs - txtY, blkClmp);
  if (bgY < blkThrs) bgY += Math.pow(blkThrs - bgY, blkClmp);

  if (Math.abs(bgY - txtY) < deltaYmin) return 0;

  let outputContrast = 0;
  if (bgY > txtY) {
    // Dark text on light background
    const sapc = (Math.pow(bgY, 0.56) - Math.pow(txtY, 0.57)) * scaleBoW;
    outputContrast = sapc < loClip ? 0 : sapc - loBoWoffset;
  } else {
    // Light text on dark background
    const sapc = (Math.pow(bgY, 0.65) - Math.pow(txtY, 0.62)) * scaleWoB;
    outputContrast = sapc > -loClip ? 0 : sapc + loWoBoffset;
  }

  return Math.round(outputContrast * 1000) / 10; // Lc scale roughly -108 .. +106
}
