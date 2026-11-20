import { MODE_IDS } from '../content/modes';
import { Assists, ModeId, ModeProgress, PlaygroundStore } from '../types';

export const PLAYGROUND_STORAGE_KEY = 'design-playground:v1';

export const DEFAULT_ASSISTS: Assists = {
  answer: false,
  guides: false,
  blur: false,
  grid: true,
  compare: false,
};

function emptyProgress(modeId: ModeId): ModeProgress {
  return { modeId, exerciseIndex: 0, completed: [], best: {}, lessonStep: 0 };
}

export function defaultStore(): PlaygroundStore {
  const modes = {} as Record<ModeId, ModeProgress>;
  for (const id of MODE_IDS) modes[id] = emptyProgress(id);
  return { version: 1, theme: null, panelOpen: true, assists: { ...DEFAULT_ASSISTS }, modes };
}

const isNonNegInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0;

/** Merges stored data over the defaults and drops fields with the wrong shape. */
export function sanitizeStore(raw: unknown): PlaygroundStore {
  const base = defaultStore();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<PlaygroundStore>;
  if (r.version !== 1) return base;
  if (r.theme === 'dark' || r.theme === 'light') base.theme = r.theme;
  if (typeof r.panelOpen === 'boolean') base.panelOpen = r.panelOpen;
  if (r.assists && typeof r.assists === 'object') {
    for (const key of Object.keys(DEFAULT_ASSISTS) as Array<keyof Assists>) {
      const v = (r.assists as Partial<Assists>)[key];
      if (typeof v === 'boolean') base.assists[key] = v;
    }
  }
  if (r.modes && typeof r.modes === 'object') {
    for (const id of MODE_IDS) {
      const m = (r.modes as Partial<Record<ModeId, Partial<ModeProgress>>>)[id];
      if (!m) continue;
      if (isNonNegInt(m.exerciseIndex)) base.modes[id].exerciseIndex = m.exerciseIndex;
      if (isNonNegInt(m.lessonStep)) base.modes[id].lessonStep = m.lessonStep;
      if (Array.isArray(m.completed)) {
        base.modes[id].completed = m.completed.filter((c): c is string => typeof c === 'string');
      }
      if (m.best && typeof m.best === 'object' && !Array.isArray(m.best)) {
        for (const [key, grade] of Object.entries(m.best)) {
          if (grade === 'exact' || grade === 'zone') base.modes[id].best[key] = grade;
        }
      }
    }
  }
  return base;
}

/** Safari private browsing can throw on storage access, so every call is guarded. */
export function loadPlaygroundStore(): PlaygroundStore {
  try {
    const text = window.localStorage.getItem(PLAYGROUND_STORAGE_KEY);
    return text ? sanitizeStore(JSON.parse(text)) : defaultStore();
  } catch {
    return defaultStore();
  }
}

export function savePlaygroundStore(store: PlaygroundStore): void {
  try {
    window.localStorage.setItem(PLAYGROUND_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage is not available. Progress stays in memory for this visit.
  }
}
