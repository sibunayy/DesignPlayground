import { EXERCISES } from '../content/exercises';
import { MODES } from '../content/modes';
import { PlaygroundStore } from '../types';

export interface PlaygroundTotals {
  done: number;
  exact: number;
  total: number;
  modes: number;
}

/** Progress across every mode, for the home card. */
export function playgroundTotals(store: PlaygroundStore): PlaygroundTotals {
  let done = 0;
  let exact = 0;
  for (const m of MODES) {
    const best = store.modes[m.id].best;
    done += Object.keys(best).length;
    exact += Object.values(best).filter((g) => g === 'exact').length;
  }
  return { done, exact, total: EXERCISES.length, modes: MODES.length };
}
