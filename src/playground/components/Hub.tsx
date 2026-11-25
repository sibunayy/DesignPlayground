import React from 'react';
import { exercisesFor } from '../content/exercises';
import { dailyPickMode, MODES } from '../content/modes';
import { Activity, GameId, ModeId, PlaygroundStore } from '../types';

interface HubProps {
  store: PlaygroundStore;
  onOpen: (id: ModeId, activity?: Activity) => void;
  onOpenGame?: (id: GameId) => void;
  /** Date for the daily pick, as YYYY-MM-DD. Today when not given. */
  today?: string;
}

/** List of modes with progress. Each row opens practice or the quiz of one mode. */
export const Hub: React.FC<HubProps> = ({ store, onOpen, onOpenGame, today = new Date().toISOString().slice(0, 10) }) => {
  const pick = dailyPickMode(today);
  return (
    <main className="dp-hub">
      <div className="dp-hub-intro">
        <h1 className="dp-hub-title">Train your eye for space.</h1>
        <p className="dp-hub-lede">
          Drag the type until the space looks right, then lock in. Scores come at the end. Each mode has a short lesson and a quiz.
        </p>
      </div>
      <ul className="dp-hub-list">
        {MODES.map((m) => {
          const progress = store.modes[m.id];
          const total = exercisesFor(m.id).length;
          const done = progress.completed.length;
          const exact = Object.values(progress.best).filter((g) => g === 'exact').length;
          const started = done > 0;
          return (
            <li key={m.id} className="dp-hub-item">
              <span className="dp-hub-swatch" style={{ background: `var(--${m.accentToken})` }} aria-hidden="true" />
              <div>
                <h2 className="dp-hub-name">
                  {m.name}
                  {m.id === pick && <span className="dp-hub-pick">Today's pick</span>}
                </h2>
                <p className="dp-hub-meta">
                  {m.teaches}. {done} of {total} done{exact > 0 ? `, ${exact} exact` : ''}
                  {progress.runBest ? `. Best run: ${progress.runBest}/100` : ''}
                  {progress.quizBest > 0 ? `. Quiz best: ${progress.quizBest} of ${total}` : ''}
                  {progress.sceneBest ? `. Best page: ${progress.sceneBest}/100` : ''}.
                </p>
              </div>
              <div className="dp-hub-actions">
                {m.id === 'kerning' && (
                  <button
                    type="button"
                    className="dp-btn-secondary"
                    aria-label="Kerning on a real page"
                    onClick={() => onOpen(m.id, 'scene')}
                  >
                    On the page
                  </button>
                )}
                <button
                  type="button"
                  className="dp-btn-secondary"
                  aria-label={`${m.name} quiz`}
                  onClick={() => onOpen(m.id, 'quiz')}
                >
                  Quiz
                </button>
                <button
                  type="button"
                  className="dp-btn-primary"
                  aria-label={`${started ? 'Play again' : 'Start'} ${m.name}`}
                  onClick={() => onOpen(m.id, 'practice')}
                >
                  {started ? 'Play again' : 'Start'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {onOpenGame && (
        <>
          <h2 className="dp-hub-section">Layout and grid</h2>
          <ul className="dp-hub-list">
            <li className="dp-hub-item">
              <span className="dp-hub-swatch dp-hub-swatch--grid" aria-hidden="true" />
              <div>
                <h3 className="dp-hub-name">Spot the drift</h3>
                <p className="dp-hub-meta">
                  Find the blocks that moved off the grid and put them back
                  {store.games.drift.played > 0 ? `. ${store.games.drift.played} played. Best page: ${store.games.drift.best}/100` : ''}.
                </p>
              </div>
              <div className="dp-hub-actions">
                <button type="button" className="dp-btn-primary" aria-label={`${store.games.drift.played ? 'Play again' : 'Start'} Spot the drift`} onClick={() => onOpenGame('drift')}>
                  {store.games.drift.played ? 'Play again' : 'Start'}
                </button>
              </div>
            </li>
          </ul>
        </>
      )}
    </main>
  );
};
