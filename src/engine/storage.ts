export interface LessonProgress {
  bestScore: number;
  recentScores: number[];
  attempts: number;
  lastPlayedIso: string;
}

export interface StudioPreferences {
  theme: 'light' | 'dark';
  railSide: 'right' | 'left';
  ragtimeTimed: boolean;
}

export interface SightlineStorageV1 {
  version: 1;
  lessons: Record<string, LessonProgress>;
  dailyCompletedDates: Record<string, number>; // dateStr -> avg score
  preferences: StudioPreferences;
}

const STORAGE_KEY = 'sightline_v1';

const DEFAULT_DATA: SightlineStorageV1 = {
  version: 1,
  lessons: {},
  dailyCompletedDates: {},
  preferences: {
    theme: 'light',
    railSide: 'right',
    ragtimeTimed: false,
  },
};

export function loadStorage(): SightlineStorageV1 {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw) as Partial<SightlineStorageV1>;
    if (parsed.version !== 1) return structuredClone(DEFAULT_DATA);
    return {
      version: 1,
      lessons: parsed.lessons ?? {},
      dailyCompletedDates: parsed.dailyCompletedDates ?? {},
      preferences: {
        theme: parsed.preferences?.theme === 'dark' ? 'dark' : 'light',
        railSide: parsed.preferences?.railSide === 'left' ? 'left' : 'right',
        ragtimeTimed: Boolean(parsed.preferences?.ragtimeTimed),
      },
    };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export function saveStorage(data: SightlineStorageV1): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore private mode quota failures
  }
}

export function recordLessonAttempt(
  current: SightlineStorageV1,
  lessonId: string,
  score: number
): SightlineStorageV1 {
  const prev = current.lessons[lessonId];
  const recentScores = [...(prev?.recentScores ?? []), score].slice(-5);
  const next: SightlineStorageV1 = {
    ...current,
    lessons: {
      ...current.lessons,
      [lessonId]: {
        bestScore: Math.max(prev?.bestScore ?? 0, score),
        recentScores,
        attempts: (prev?.attempts ?? 0) + 1,
        lastPlayedIso: new Date().toISOString(),
      },
    },
  };
  saveStorage(next);
  return next;
}

export function recordDailyCompletion(
  current: SightlineStorageV1,
  dateStr: string,
  averageScore: number
): SightlineStorageV1 {
  const next: SightlineStorageV1 = {
    ...current,
    dailyCompletedDates: {
      ...current.dailyCompletedDates,
      [dateStr]: averageScore,
    },
  };
  saveStorage(next);
  return next;
}

export function lessonMasteryAverage(progress?: LessonProgress): number | null {
  if (!progress || progress.recentScores.length === 0) return null;
  const sum = progress.recentScores.reduce((acc, s) => acc + s, 0);
  return Math.round(sum / progress.recentScores.length);
}

export function applyThemeMetadata(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  const themeColor = theme === 'dark' ? '#14161A' : '#F4F5F7';
  const statusBar = theme === 'dark' ? 'black-translucent' : 'default';

  const metaColor = document.querySelector('meta[name="theme-color"]');
  if (metaColor) metaColor.setAttribute('content', themeColor);

  const metaApple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (metaApple) metaApple.setAttribute('content', statusBar);
}
