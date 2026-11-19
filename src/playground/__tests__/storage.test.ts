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
      modes: { kerning: { exerciseIndex: 2, lessonStep: -1, completed: ['type', 4] } },
    });
    expect(s.theme).toBe('light');
    expect(s.panelOpen).toBe(true);
    expect(s.assists.blur).toBe(true);
    expect(s.assists.grid).toBe(true);
    expect(s.modes.kerning).toMatchObject({ exerciseIndex: 2, lessonStep: 0, completed: ['type'] });
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
