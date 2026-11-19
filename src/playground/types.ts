export type ModeId = 'kerning' | 'tracking' | 'leading' | 'wordspace' | 'measure';

export type ThemeId = 'dark' | 'light';

export type CheckResult = '' | 'tight' | 'loose' | 'good';

export type AssistId = 'answer' | 'guides' | 'blur' | 'grid' | 'compare';

/** Where the lesson panel sits on a landscape iPad. Portrait and phone always stack. */
export type ModeLayout = 'panel-right' | 'panel-left' | 'panel-below';

export interface SliderSpec {
  min: number;
  max: number;
  step: number;
}

export interface ModeFeedback {
  idle: string;
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
  /** Unit label for the readout, such as "units" or "%". */
  unit: string;
  slider: SliderSpec;
  /** Assists this mode offers, in toolbar order. */
  assists: AssistId[];
  checkLabel: string;
  nextLabel: string;
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
  answer: boolean;
  guides: boolean;
  blur: boolean;
  grid: boolean;
  compare: boolean;
}

export interface ModeProgress {
  modeId: ModeId;
  exerciseIndex: number;
  /** Exercise ids the learner has passed at least once. */
  completed: string[];
  lessonStep: number;
}

export interface PlaygroundStore {
  version: 1;
  theme: ThemeId | null;
  panelOpen: boolean;
  assists: Assists;
  modes: Record<ModeId, ModeProgress>;
}
