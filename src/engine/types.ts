export type TierId = 'foundation' | 'building' | 'challenge';

export type EyeLens = 'blur' | 'grayscale' | 'flip';

export type OverlayMode = 'overlay' | 'yours' | 'target' | 'guides';

export type MasteryBand =
  | 'Studio Grade'
  | 'Sharp Eye'
  | 'Getting Close'
  | 'Needs Calibration';

export interface ExerciseMetric {
  label: string;
  yours: string;
  target: string;
  status: 'pass' | 'close' | 'miss';
}

export interface ExerciseResult {
  score: number; // 0-100
  band: MasteryBand;
  diagnosis: string; // Strictly 1-2 crisp sentences
  metrics: ExerciseMetric[];
}

export interface LessonDefinition {
  id: string;
  number: string; // '01' .. '13'
  tier: TierId;
  title: string;
  shortTitle: string;
  subtitle: string;
  styleWorld: string;
  styleRef: string;
  ruleOfThumb: string;
  summary: string; // 2-3 concise editorial sentences
  availableLenses: EyeLens[];
  videoSrc?: string; // Optional MP4 override slot
}

export interface ExerciseProps {
  seed: string;
  submitted: boolean;
  overlayMode: OverlayMode;
  activeLenses: Set<EyeLens>;
  onResultReady?: (result: ExerciseResult) => void;
  onSubmitTrigger?: (result: ExerciseResult) => void;
  /** Render-prop callback allowing each exercise to register its pop-out controls & action triggers */
  registerSubmit?: (submitFn: () => ExerciseResult) => void;
  registerReset?: (resetFn: () => void) => void;
  onControlsChange?: (node: React.ReactNode) => void;
  onPenDetected?: (isPen: boolean) => void;
}

export function bandForScore(score: number): MasteryBand {
  if (score >= 92) return 'Studio Grade';
  if (score >= 78) return 'Sharp Eye';
  if (score >= 60) return 'Getting Close';
  return 'Needs Calibration';
}
