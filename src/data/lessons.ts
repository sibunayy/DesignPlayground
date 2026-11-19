import { LessonDefinition, TierId } from '../engine/types';

export const TIERS: Array<{ id: TierId; numeral: string; name: string; caption: string }> = [
  {
    id: 'foundation',
    numeral: 'I',
    name: 'Foundation',
    caption: 'Negative space, spatial hierarchy, structural grids, and readable body prose.',
  },
  {
    id: 'building',
    numeral: 'II',
    name: 'Building',
    caption: 'Type architecture, paragraph flow, micro-kerning, character hygiene, and optical geometry.',
  },
  {
    id: 'challenge',
    numeral: 'III',
    name: 'Challenge',
    caption: 'Perceptual color science, pixel-locked iconography, anatomical framing, and physical prepress.',
  },
];

export const LESSONS: LessonDefinition[] = [
  {
    id: '01-whitespace',
    number: '01',
    tier: 'foundation',
    title: 'White Space & Trapped Space',
    shortTitle: 'White Space',
    subtitle: 'Active breathing room vs. enclosed hollow voids',
    ruleOfThumb: 'Channel empty space outward to the perimeter—strip needless boxes that trap awkward voids inside.',
    summary:
      'Beginners try to fill every corner or draw decorative boxes around groups, creating trapped white pockets that draw the eye like holes. Strip redundant borders and let passive margins protect legibility while active space frames your focal element.',
    availableLenses: ['blur', 'flip'],
  },
  {
    id: '02-hierarchy',
    number: '02',
    tier: 'foundation',
    title: 'Visual Hierarchy & Proximity',
    shortTitle: 'Hierarchy & Proximity',
    subtitle: 'Inside vs. outside spacing and one unmistakable first read',
    ruleOfThumb: 'Use roughly 2× more space between groups than inside them, and pull headings closer to what they introduce.',
    summary:
      'Equal top and bottom margins leave headings floating in no-man’s-land, while repeating your brand accent color everywhere dilutes focus. Establish one clear entry point, tighten heading-to-body spacing, and reserve bright accent color strictly for the primary action.',
    availableLenses: ['blur', 'grayscale', 'flip'],
  },
  {
    id: '03-grids',
    number: '03',
    tier: 'foundation',
    title: 'Grids, Margins & Gutters',
    shortTitle: 'Grids & Gutters',
    subtitle: 'Column spans, empty gutters, and 8 px spatial tokens',
    ruleOfThumb: 'Span columns intentionally, keep gutters completely empty, and quantize padding to 8 px steps.',
    summary:
      'A grid breaks the moment content bleeds into column gutters or mixes arbitrary 13 px and 21 px spacing with tokenized gaps. Snap cards crisply from column edge to column edge so gutters stay open negative-space channels.',
    availableLenses: ['blur'],
  },
  {
    id: '04-macro-type',
    number: '04',
    tier: 'foundation',
    title: 'Macro-Typography & Rhythm',
    shortTitle: 'Macro-Typography',
    subtitle: 'Screen body size, 45–75 char measure, and web leading',
    ruleOfThumb: 'Set screen body text at 16 px+, 45–75 characters wide, and 140–165% line height (tighter 1.1–1.25× on large headlines).',
    summary:
      'Self-taught designers style headlines first and leave body copy too small, too wide, or choked by print-tight 120% leading. Tune measure, size, and leading together so the eye glides smoothly from the end of one line back to the start of the next.',
    availableLenses: ['blur'],
  },
  {
    id: '05-font-pairing',
    number: '05',
    tier: 'building',
    title: 'Font Pairing & Type Scales',
    shortTitle: 'Font Pairing',
    subtitle: 'Contrasting classes, matched x-heights, and modular scales',
    ruleOfThumb: 'Pair clearly contrasting styles (serif + sans) with x-height ratios near 0.9–1.1, stepped along a 1.25 scale.',
    summary:
      'Combining two overly similar geometric sans-serifs looks like a broken fallback font rather than an intentional system. Pick your readable body face first, verify x-height harmony via “handgloves”, and lock H1–H3 to a deliberate scale.',
    availableLenses: ['blur'],
  },
  {
    id: '06-paragraph-flow',
    number: '06',
    tier: 'building',
    title: 'Paragraph Flow & Rag Craft',
    shortTitle: 'Paragraph Flow',
    subtitle: 'Eliminating runts, rivers, and staircase rags',
    ruleOfThumb: 'Bind orphan final words with non-breaking spaces and switch narrow justified columns to ragged-right or hyphenated flow.',
    summary:
      'Stranded single-word runts mimic awkward blank lines, while narrow justified columns carve distracting white rivers down through prose. Sculpt gentle in-and-out rags and bind trailing short words so paragraphs finish with quiet poise.',
    availableLenses: ['blur'],
  },
  {
    id: '07-micro-type',
    number: '07',
    tier: 'building',
    title: 'Kerning, Tracking & Hanging Margins',
    shortTitle: 'Micro-Typography',
    subtitle: 'Pairwise negative space, ALL CAPS tracking, and optical overhang',
    ruleOfThumb: 'Never letterspace lowercase; track ALL CAPS +5–12%, tighten large titles −3–5%, and hang opening quotes outside the margin.',
    summary:
      'Overhanging diagonals like AV, To, and WA punch holes in display words unless balanced visually by equalizing area between glyphs. Keep Metrics active for prose, track uppercase headers slightly open, and push opening punctuation cleanly into the left margin.',
    availableLenses: ['blur', 'flip'],
  },
  {
    id: '08-character-hygiene',
    number: '08',
    tier: 'building',
    title: 'Character Hygiene & OpenType Numerals',
    shortTitle: 'Character Hygiene',
    subtitle: 'Smart quotes, true primes, en/em dashes, and figure styles',
    ruleOfThumb: 'Use curly quotes in prose, straight primes (′ ″) for measurements, en dashes for ranges, and tabular lining figures in tables.',
    summary:
      'Typewriter straight quotes, double spaces, hyphenated date ranges, and backward ’90s apostrophes silently undermine polished typography. Pair typographically accurate punctuation with proportional oldstyle figures in prose and tabular lining figures in data tables.',
    availableLenses: [],
  },
  {
    id: '09-optical-geometry',
    number: '09',
    tier: 'building',
    title: 'Optical Alignment & Concentric Radii',
    shortTitle: 'Optical Geometry',
    subtitle: 'Visual mass centroids and nested corner mathematics',
    ruleOfThumb: 'Nudge asymmetrical icons opposite their heavy side, and set inner corner radius = max(0 px, outer − padding).',
    summary:
      'Bounding boxes lie: a centered play triangle looks pushed left, and sharing a 16 px radius on a card and its padded image produces pinched outer corners. Trust your squinted eye over geometric centerlines and derive nested corner radii mathematically.',
    availableLenses: ['blur', 'flip'],
  },
  {
    id: '10-perceptual-color',
    number: '10',
    tier: 'challenge',
    title: 'Perceptual Color: OKLCH, APCA & Dark Mode',
    shortTitle: 'Perceptual Color',
    subtitle: 'Perceived lightness ramps, APCA Lc contrast, and halation',
    ruleOfThumb: 'Build ramps in OKLCH, target APCA Lc 75+ for body text, separate vibrating hues, and elevate Dark Mode off #121212–#1E1F22.',
    summary:
      'HSL pretends bright yellow and deep blue share 50% lightness, while WCAG 2 passes strained neon pairings and pure #000000 dark mode triggers astigmatic halation. Work in OKLCH, verify perceptual APCA Lc contrast, and desaturate dark-ground accents.',
    availableLenses: ['grayscale', 'blur'],
  },
  {
    id: '11-iconography',
    number: '11',
    tier: 'challenge',
    title: 'Iconography Grids & Visual Weight',
    shortTitle: 'Iconography',
    subtitle: '24×24 pixel snapping, keylines, and stroke density parity',
    ruleOfThumb: 'Keep strokes centered on integer 24×24 pixels inside a 2 px safe border, and balance dense icons against a circle and square.',
    summary:
      'Fractional coordinates blur crisp edges at 1× scale, and packing intricate detail at 2 px stroke weight makes one icon look twice as heavy as its neighbors. Snap vertices to whole grid intersections inside keyline bounds and verify equal blob density under blur.',
    availableLenses: ['blur'],
  },
  {
    id: '12-image-framing',
    number: '12',
    tier: 'challenge',
    title: 'Image Framing, Anatomy & Tangents',
    shortTitle: 'Image Framing',
    subtitle: 'Mid-limb crops, upper-third eye alignment, and zero edge tangents',
    ruleOfThumb: 'Level the horizon first, align portrait eyes near the upper third, and crop mid-limb—never through joints or grazing a contour.',
    summary:
      'Arbitrary frame crops amputate elbows, knees, and wrists or pinch heads right against the upper border. Level tilted horizons, keep clean breathing headroom and gaze lead, and avoid edge-kissing tangents where shapes lightly touch the crop boundary.',
    availableLenses: ['flip', 'grayscale'],
  },
  {
    id: '13-print-prepress',
    number: '13',
    tier: 'challenge',
    title: 'Print Production & Prepress Hygiene',
    shortTitle: 'Print Prepress',
    subtitle: '3 mm bleed/safe zones, 100% K small type, and vector logos',
    ruleOfThumb: 'Extend edge art 3 mm past trim, keep copy 3–5 mm inside trim, use 100% K (not rich black) for small text, and avoid 72 DPI logos.',
    summary:
      'Industrial guillotines drift ±0.5 mm on every stack, leaving stark white slivers on un-bled edges and slicing borders placed too close to trim. Extend full-bleed imagery outward, guard safe text margins, restrict small black type to single-plate K, and place vector marks.',
    availableLenses: ['blur', 'grayscale'],
  },
];

export function getLessonById(id: string): LessonDefinition {
  return LESSONS.find((l) => l.id === id) ?? LESSONS[0];
}
