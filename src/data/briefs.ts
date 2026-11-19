export interface EditorialBrief {
  client: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  body: string;
  ctaLabel: string;
  secondaryLabel: string;
  metaTag: string;
}

export const EDITORIAL_BRIEFS: EditorialBrief[] = [
  {
    client: 'Kunsthalle Basel',
    eyebrow: 'AUTUMN MONOGRAPH · GALLERY IV',
    headline: 'Concrete, Light & Quiet Proportion',
    subhead: 'Architectural studies from the Zurich post-war archive, curated with rare full-scale timber joinery models.',
    body: 'Over forty archival drawings and plaster maquettes trace how Swiss builders balanced structural restraint with warm daylight. Walk-in studio talks run every Thursday evening in the north courtyard.',
    ctaLabel: 'Reserve Timed Entry',
    secondaryLabel: 'Read Exhibition Notes',
    metaTag: '14 Oct – 19 Dec · Basel',
  },
  {
    client: 'Kanso Roasters',
    eyebrow: 'SINGLE ORIGIN · KYOTO ROAST',
    headline: 'Washed Gesha, Roasted for Clarity',
    subhead: 'Small-lot highland cherries rested for forty-two days and profiled for clean bergamot and white peach notes.',
    body: 'Light roast curves preserve delicate floral aromatics without heavy roast bitterness. Brew at 93 °C using a 1:16 pour-over ratio to let the tea-like finish stay crisp as the cup cools.',
    ctaLabel: 'Order 250g Bag',
    secondaryLabel: 'View Brew Guide',
    metaTag: 'Harvest Lot #18 · 250g',
  },
  {
    client: 'Sorensen Ceramics',
    eyebrow: 'STUDIO EDITION · AUTUMN KILN',
    headline: 'Wheel-Thrown Stoneware Vessels',
    subhead: 'Raw iron-flecked clay dipped in matte limestone ash glaze and reduction-fired for thirty-six hours.',
    body: 'Each cylinder is trimmed by hand at leather-hard stage so the base carries a quiet unglazed foot ring. Subtle tonal shifts across every firing mean no two vessels share identical mineral speckling.',
    ctaLabel: 'Acquire Studio Set',
    secondaryLabel: 'Inspect Glaze Specs',
    metaTag: 'Limited Run of 40',
  },
  {
    client: 'Braun & Co. Audio',
    eyebrow: 'REFERENCE SERIES · MODEL T4',
    headline: 'Tactile Mechanics in Brushed Aluminum',
    subhead: 'Zero-latency analog volume attenuation housed in a bead-blasted unibody chassis.',
    body: 'Every detent knob is machined from solid brass to keep rotational inertia uniform across sixty-four stepped resistor levels. Recessed indicators avoid glare inside darkened listening rooms.',
    ctaLabel: 'Configure Model T4',
    secondaryLabel: 'Technical Datasheet',
    metaTag: 'Shipping Spring 2027',
  },
  {
    client: 'Nordic Timber Press',
    eyebrow: 'ISSUE 14 · PRINT & TYPE',
    headline: 'Why Margins Carry Half the Sentence',
    subhead: 'Conversations with bookbinders, punchcutters, and newspaper art directors across Scandinavia.',
    body: 'When column width stretches past seventy-five characters, the reader loses the return sweep before finishing the paragraph. Proper margins are never wasted paper; they give ink a calm frame to breathe.',
    ctaLabel: 'Subscribe to Print',
    secondaryLabel: 'Browse Back Issues',
    metaTag: '164 Pages · Smyth-Sewn',
  },
];

export const LONG_PROSE_SPECIMENS: Array<{
  title: string;
  kicker: string;
  paragraphs: string[];
}> = [
  {
    title: 'The Quiet Mechanics of Readable Type',
    kicker: 'TYPOGRAPHIC NOTE · 04',
    paragraphs: [
      'Self-taught designers frequently spend an hour perfecting a bold display headline and leave body copy at software defaults. Yet readers spend ninety-five percent of their time inside running paragraphs, where overly wide lines exhaust peripheral tracking and tight leading causes lines to collide.',
      'Lowering line height on backlit displays mirrors old print habits that break down on luminous glass. Once body copy reaches sixteen pixels with roughly sixty characters per line and generous breathing room between baselines, hierarchy locks into place effortlessly.',
    ],
  },
  {
    title: 'Notes from the Bookbinder’s Bench',
    kicker: 'ARCHIVE ESSAY · 11',
    paragraphs: [
      'Walk into any century-old print shop and notice how generously paper surrounds a column of lead type. Margins serve as physical handles for thumbs while keeping bright light from encroaching on letterforms along the outer edge of the spread.',
      'Digital layouts lose that tactile frame whenever cards press edge-to-edge on a tablet screen. Restoring deliberate margins transforms dense documentation into calm reading that feels edited rather than dumped onto a viewport.',
    ],
  },
  {
    title: 'Designing for Human Vision, Not Bounding Boxes',
    kicker: 'PERCEPTUAL CRAFT · 09',
    paragraphs: [
      'Layout applications compute geometric centers by splitting a bounding rectangle in half vertically and horizontally. Human retinas, however, judge weight by where ink mass concentrates rather than by invisible guide handles.',
      'A circular badge beside a sharp square, or a right-pointing play triangle inside a round button, always feels misaligned if left strictly centered. Learning to trust squinted perception over raw coordinates marks the jump from tidy software assembly to visual craft.',
    ],
  },
];

export const KERNING_WORDS: Array<{ word: string; pairNote: string; targets: number[] }> = [
  { word: 'WAVE', pairNote: 'Diagonal W-A and A-V pockets', targets: [0, -14, -26, -28] },
  { word: 'TYPE', pairNote: 'Open crossbar beneath T and Y', targets: [0, -15, -14, -12] },
  { word: 'LOFT', pairNote: 'Open bowl after L and overhang before T', targets: [0, -6, -6, -18] },
  { word: 'AVOID', pairNote: 'Opposing A-V diagonals', targets: [0, -16, -20, -16, -16] },
  { word: 'TALE', pairNote: 'Deep pocket under T-a', targets: [0, -16, -14, -12] },
];

export const HYGIENE_EXCERPTS: Array<{
  title: string;
  headline: string;
  proseSegments: Array<{
    id: string;
    bad: string;
    good: string;
    defectLabel: string;
    choices: string[];
  }>;
  tableTitle: string;
  rows: Array<{ label: string; value: string }>;
}> = [
  {
    title: 'Nordic Pavilion Retrospective',
    headline: 'OPENING WEEKEND SCHEDULE',
    proseSegments: [
      {
        id: 'q1',
        bad: '"Light is structural,"',
        good: '“Light is structural,”',
        defectLabel: 'Straight quotes in prose',
        choices: ['“Light is structural,”', '"Light is structural,"', '‘Light is structural,’'],
      },
      {
        id: 'dec1',
        bad: "noted the ‘90s timber",
        good: "noted the ’90s timber",
        defectLabel: 'Backwards decade apostrophe',
        choices: ["noted the ’90s timber", "noted the ‘90s timber", "noted the '90s timber"],
      },
      {
        id: 'rng1',
        bad: 'restoration (1992-1998)',
        good: 'restoration (1992–1998)',
        defectLabel: 'Hyphen instead of en dash in date range',
        choices: ['restoration (1992–1998)', 'restoration (1992-1998)', 'restoration (1992—1998)'],
      },
      {
        id: 'prm1',
        bad: 'across the 6’2” cedar doorway.',
        good: 'across the 6′2″ cedar doorway.',
        defectLabel: 'Curly quotes instead of feet/inches primes',
        choices: ['across the 6′2″ cedar doorway.', 'across the 6’2” cedar doorway.', "across the 6'2\" cedar doorway."],
      },
      {
        id: 'dbl1',
        bad: 'Entry opens  daily at 10:00.',
        good: 'Entry opens daily at 10:00.',
        defectLabel: 'Double space after period',
        choices: ['Entry opens daily at 10:00.', 'Entry opens  daily at 10:00.'],
      },
    ],
    tableTitle: 'Live Gallery Admission & Ticker',
    rows: [
      { label: 'Adult Day Pass', value: '$24.00' },
      { label: 'Archive Monograph', value: '$48.50' },
      { label: 'Visitor Counter', value: '1,418' },
    ],
  },
  {
    title: 'Swiss Railway Clock Monograph',
    headline: 'CHRONOMETRY ARCHIVE',
    proseSegments: [
      {
        id: 'q1',
        bad: '"Precision demands pause,"',
        good: '“Precision demands pause,”',
        defectLabel: 'Straight quotes in prose',
        choices: ['“Precision demands pause,”', '"Precision demands pause,"'],
      },
      {
        id: 'dec1',
        bad: "from the ‘40s station",
        good: "from the ’40s station",
        defectLabel: 'Backwards decade apostrophe',
        choices: ["from the ’40s station", "from the ‘40s station", "from the '40s station"],
      },
      {
        id: 'rng1',
        bad: 'runs (1944-1976)',
        good: 'runs (1944–1976)',
        defectLabel: 'Hyphen instead of en dash',
        choices: ['runs (1944–1976)', 'runs (1944-1976)', 'runs (1944—1976)'],
      },
      {
        id: 'prm1',
        bad: 'built in 3’4” enameled cases.',
        good: 'built in 3′4″ enameled cases.',
        defectLabel: 'Curly quotes instead of true primes',
        choices: ['built in 3′4″ enameled cases.', 'built in 3’4” enameled cases.'],
      },
      {
        id: 'dbl1',
        bad: 'Each dial  pauses 1.5s at noon.',
        good: 'Each dial pauses 1.5s at noon.',
        defectLabel: 'Double typewriter space',
        choices: ['Each dial pauses 1.5s at noon.', 'Each dial  pauses 1.5s at noon.'],
      },
    ],
    tableTitle: 'Swiss Departure Telemetry',
    rows: [
      { label: 'Platform 04 Express', value: '14:02' },
      { label: 'Platform 11 Local', value: '14:18' },
      { label: 'Drift Tolerance (ms)', value: '0,012' },
    ],
  },
];
