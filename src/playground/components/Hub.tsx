import React from 'react';
import { exercisesFor } from '../content/exercises';
import { MODES } from '../content/modes';
import { ModeId, PlaygroundStore } from '../types';

interface HubProps {
  store: PlaygroundStore;
  onOpen: (id: ModeId) => void;
}

/** List of modes with progress. Each row opens one mode. */
export const Hub: React.FC<HubProps> = ({ store, onOpen }) => (
  <main className="dp-hub">
    <div className="dp-hub-intro">
      <h1 className="dp-hub-title">Train your eye for space.</h1>
      <p className="dp-hub-lede">
        Move a slider until the space looks right. Then check your answer. Each mode has a short lesson.
      </p>
    </div>
    <ul className="dp-hub-list">
      {MODES.map((m) => {
        const total = exercisesFor(m.id).length;
        const done = store.modes[m.id].completed.length;
        const started = done > 0 || store.modes[m.id].exerciseIndex > 0;
        return (
          <li key={m.id} className="dp-hub-item">
            <span className="dp-hub-swatch" style={{ background: `var(--${m.accentToken})` }} aria-hidden="true" />
            <div>
              <h2 className="dp-hub-name">{m.name}</h2>
              <p className="dp-hub-meta">
                {m.teaches}. {done} of {total} exercises done.
              </p>
            </div>
            <button
              type="button"
              className="dp-btn-primary"
              aria-label={`${started ? 'Continue' : 'Start'} ${m.name}`}
              onClick={() => onOpen(m.id)}
            >
              {started ? 'Continue' : 'Start'}
            </button>
          </li>
        );
      })}
    </ul>
  </main>
);
