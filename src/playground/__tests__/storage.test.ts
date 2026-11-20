import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  defaultStore,
  loadPlaygroundStore,
  PLAYGROUND_STORAGE_KEY,
  sanitizeStore,
  savePlaygroundStore,
} from '../state/storage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('sanitizeStore', () => {
  it('returns defaults for bad input', () => {
    expect(sanitizeStore(null)).toEqual(defaultStore());
    expect(sanitizeStore({ version: 2 })).toEqual(defaultStore());
  });
  it('keeps valid fields and drops bad ones', () => {
    const s = sanitizeStore({
      version: 1,
      theme: 'light',
      panelOpen: 'yes',
      assists: { blur: true, grid: 'no' },
      modes: {
        kerning: { lessonStep: -1, completed: ['type', 4], best: { type: 'exact', home: 'wrong', wave: 'miss' } },
      },
    });
    expect(s.theme).toBe('light');
    expect(s.panelOpen).toBe(false);
    expect(s.assists.blur).toBe(true);
    expect(s.assists.grid).toBe(true);
    expect(s.modes.kerning).toMatchObject({ lessonStep: 0, completed: ['type'] });
    expect(s.modes.kerning.best).toEqual({ type: 'exact', wave: 'miss' });
  });
  it('reads older saves without grades', () => {
    const s = sanitizeStore({ version: 1, modes: { leading: { completed: ['x'] } } });
    expect(s.modes.leading.best).toEqual({});
    expect(s.modes.paragraph.completed).toEqual([]);
  });
});

describe('quiz scores', () => {
  it('keeps a valid quiz best and drops a bad one', () => {
    const store = sanitizeStore({
      version: 1,
      modes: { kerning: { quizBest: 4 }, tracking: { quizBest: -1 }, leading: { quizBest: 'x' } },
    });
    expect(store.modes.kerning.quizBest).toBe(4);
    expect(store.modes.tracking.quizBest).toBe(0);
    expect(store.modes.leading.quizBest).toBe(0);
  });
});

describe('load and save', () => {
  it('round-trips through localStorage', () => {
    const s = defaultStore();
    s.theme = 'dark';
    savePlaygroundStore(s);
    expect(window.localStorage.getItem(PLAYGROUND_STORAGE_KEY)).toBeTruthy();
    expect(loadPlaygroundStore()).toEqual(s);
  });
  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadPlaygroundStore()).toEqual(defaultStore());
    expect(() => savePlaygroundStore(defaultStore())).not.toThrow();
  });
});
