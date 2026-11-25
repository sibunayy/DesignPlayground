export type ModeId = 'kerning' | 'tracking' | 'leading' | 'wordspace' | 'measure' | 'paragraph' | 'margins';

/** What the learner does in a mode: the drag challenge or the A/B quiz. */
export type Activity = 'practice' | 'quiz' | 'scene';

export type ThemeId = 'dark' | 'light';

/** How an answer scored. Exact is the centre third of every target, zone is inside every target, miss is anything else. */
export type Grade = 'exact' | 'zone' | 'miss';

export type AssistId = 'guides' | 'blur' | 'grid' | 'compare';

/** Where the lesson panel sits on a landscape iPad. Portrait and phone always stack. */
export type ModeLayout = 'panel-right' | 'panel-left' | 'panel-below';

export interface SliderSpec {
  min: number;
  max: number;
  step: number;
}

export interface ModeFeedback {
  tight: string;
  loose: string;
  good: string;
  goodLast: string;
}

export interface Mode {
  id: ModeId;
  name: string;
  /** One line: what the mode teaches. */
  teaches: string;
  accentToken: `mode-${ModeId}`;
  defaultTheme: ThemeId;
  layout: ModeLayout;
  slider: SliderSpec;
  /** Assists this mode offers, in toolbar order. */
  assists: AssistId[];
  /** Question at the top of the A/B quiz. */
  quizQuestion: string;
  feedback: ModeFeedback;
  lessonName: string;
}

export interface Exercise {
  id: string;
  modeId: ModeId;
  /** Stage text. Kerning uses "T|ype": the bar marks the adjustable gap. */
  text: string;
  /** Font size in px at full stage width. */
  size: number;
  /** Lowest passing value. */
  lo: number;
  /** Highest passing value. */
  hi: number;
  /** Slider value when the exercise opens. */
  start: number;
  /** Short name of the exercise type, such as "Large headline". */
  kind: string;
  prompt: string;
  /** Accessible name for the stage text. */
  label: string;
  /** Stage text width in px (leading only). */
  width?: number;
  /** Upper-case transform and tracking for capital labels (word spacing). */
  caps?: boolean;
  /** First-line indent on every paragraph after the first (paragraph spacing). */
  indent?: boolean;
  /** Margins only: the box shape. Buttons and tags use half the space top and bottom. */
  box?: 'card' | 'button' | 'poster';
}

export type LessonVisual =
  | {
      kind: 'kernPairs';
      size: number;
      items: Array<{ left: string; right: string; gapEm: number; label?: string }>;
      caption?: string;
    }
  | {
      kind: 'textRows';
      size: number;
      rows: Array<{ text: string; tracking?: number; wordSpacing?: number; label: string }>;
      blur?: boolean;
    }
  | {
      kind: 'lineCols';
      size: number;
      cols: Array<{ lineHeight: number; label: string; size?: number }>;
      blur?: boolean;
    }
  | {
      kind: 'measureLines';
      size: number;
      rows: Array<{ ch: number; label: string }>;
    }
  | {
      kind: 'paraCols';
      /** Each column draws three short paragraphs. Gaps are in lines, one per break. */
      cols: Array<{ gaps: [number, number]; indent?: boolean; label: string }>;
    }
  | {
      kind: 'padBoxes';
      /** Each box shows two short text lines. Padding is in em of the text size. */
      cols: Array<{ pad: number; padY?: number; label: string; /** Two stacked boxes with this gap, in em. */ gap?: number }>;
    }
  | { kind: 'blurWord'; text: string; size: number }
  | { kind: 'pairList'; size: number; items: string[] };

export interface LessonStep {
  id: string;
  modeId: ModeId;
  order: number;
  title: string;
  body: string;
  tip: string;
  visual: LessonVisual;
}

export interface Assists {
  guides: boolean;
  blur: boolean;
  grid: boolean;
  compare: boolean;
}

export interface ModeProgress {
  modeId: ModeId;
  /** Exercise ids the learner has locked in at least once. */
  completed: string[];
  /** Best grade for each locked-in exercise id. */
  best: Record<string, Grade>;
  lessonStep: number;
  /** Best quiz score: correct answers out of the quiz length. */
  quizBest: number;
  /** Best run score, 0 to 100: the mean exercise score of one full run. */
  runBest?: number;
  /** Kerning only: best single score on the real-world work area. */
  sceneBest?: number;
}

export interface PlaygroundStore {
  version: 1;
  theme: ThemeId | null;
  panelOpen: boolean;
  assists: Assists;
  modes: Record<ModeId, ModeProgress>;
}
