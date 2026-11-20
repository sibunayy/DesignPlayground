import '@fontsource-variable/bricolage-grotesque';
import '../../playground/styles/tokens.css';
import '../../playground/styles/playground.css';
import './home.css';
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { LESSONS, TIERS } from '../../data/lessons';
import { lessonMasteryAverage, SightlineStorageV1 } from '../../engine/storage';
import { LessonDefinition } from '../../engine/types';
import { dailyPickMode, getMode } from '../../playground/content/modes';
import { playgroundTotals } from '../../playground/logic/totals';
import { loadPlaygroundStore } from '../../playground/state/storage';
import type { ModeId } from '../../playground/types';
import { LessonCraftIcon, SightlineEmblem } from '../Icons/CraftIcons';

interface HomeIndexProps {
  storage: SightlineStorageV1;
  onOpenLesson: (lessonId: string, mode: 'learn' | 'practice') => void;
  onOpenDailyMix: () => void;
  /** Opens the Design Playground hub, or one mode when a mode is given. Optional so older callers still work. */
  onOpenPlayground?: (modeId?: ModeId) => void;
  onToggleTheme: () => void;
}

export const HomeIndex: React.FC<HomeIndexProps> = ({
  storage,
  onOpenLesson,
  onOpenDailyMix,
  onOpenPlayground,
  onToggleTheme,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyScore = storage.dailyCompletedDates[todayStr];
  const theme = storage.preferences.theme === 'dark' ? 'dark' : 'light';

  const practiced = (l: LessonDefinition) => (storage.lessons[l.id]?.attempts ?? 0) > 0;
  const completedCount = LESSONS.filter(practiced).length;

  const nextLesson: LessonDefinition =
    LESSONS.find((l) => (lessonMasteryAverage(storage.lessons[l.id]) ?? 0) < 80) ?? LESSONS[0];

  const pgTotals = playgroundTotals(loadPlaygroundStore());
  const pgPick = getMode(dailyPickMode(todayStr));

  return (
    <main id="main-workspace" className="dp dp--home" data-theme={theme}>
      <a href="#main-workspace" className="skip-link">
        Skip to lessons
      </a>

      <header className="dp-home-bar">
        <h1 className="dp-home-brand">
          <SightlineEmblem size={28} />
          <span>Sightline</span>
        </h1>
        <button
          type="button"
          className="dp-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle studio light or darkroom mode"
          title={theme === 'dark' ? 'Studio paper' : 'Darkroom'}
        >
          <span className="dp-toggle-chip">
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </span>
        </button>
      </header>

      <div className="dp-home-top">
        <section className="dp-home-card dp-home-next" data-tier={nextLesson.tier} aria-label="Next up">
          <div className="dp-home-next-head">
            <span className="dp-home-bignum">{nextLesson.number}</span>
            <span className="dp-home-icon" aria-hidden="true">
              <LessonCraftIcon lessonId={nextLesson.id} size={32} />
            </span>
          </div>
          <h2 className="dp-home-next-title">{nextLesson.title}</h2>
          <div className="dp-home-actions">
            <button
              type="button"
              className="dp-btn-primary dp-home-cta"
              onClick={() => onOpenLesson(nextLesson.id, 'learn')}
            >
              Learn
            </button>
            <button
              type="button"
              className="dp-btn-secondary dp-home-cta"
              onClick={() => onOpenLesson(nextLesson.id, 'practice')}
            >
              Practice
            </button>
          </div>
          <div className="dp-home-progress">
            <div className="dp-bars" aria-hidden="true">
              {LESSONS.map((l) => (
                <span key={l.id} className={`dp-bar${practiced(l) ? ' dp-bar--on' : ''}`} />
              ))}
            </div>
            <p className="dp-caption">
              {completedCount} of {LESSONS.length} practiced
            </p>
          </div>
        </section>

        <section className="dp-home-card dp-home-daily" data-neutral aria-labelledby="home-daily">
          <h2 id="home-daily" className="dp-home-card-title">
            Daily mix
          </h2>
          <p className="dp-home-line">
            {dailyScore !== undefined ? `Done today: ${dailyScore}/100` : 'Five quick drills'}
          </p>
          <button type="button" className="dp-btn-primary dp-home-cta" onClick={onOpenDailyMix}>
            {dailyScore !== undefined ? 'Replay' : 'Start'}
          </button>
        </section>

        {onOpenPlayground && (
          <section className="dp-home-card dp-home-play" data-neutral aria-labelledby="home-play">
            <h2 id="home-play" className="dp-home-card-title">
              Design Playground
            </h2>
            <p className="dp-home-line">
              {pgTotals.done > 0
                ? `${pgTotals.done} of ${pgTotals.total} exercises done`
                : `${pgTotals.total} exercises in ${pgTotals.modes} modes`}
            </p>
            <div className="dp-home-actions">
              <button type="button" className="dp-btn-primary dp-home-cta" onClick={() => onOpenPlayground()}>
                Open playground
              </button>
              {pgPick && (
                <button
                  type="button"
                  className="dp-btn-secondary dp-home-cta"
                  onClick={() => onOpenPlayground(pgPick.id)}
                >
                  Today's pick: {pgPick.name}
                </button>
              )}
            </div>
          </section>
        )}
      </div>

      {TIERS.map((tier) => {
        const lessons = LESSONS.filter((l) => l.tier === tier.id);
        const done = lessons.filter(practiced).length;
        return (
          <section
            key={tier.id}
            className="dp-home-card dp-home-tier"
            data-tier={tier.id}
            aria-labelledby={`tier-${tier.id}`}
          >
            <header className="dp-home-tier-head">
              <h2 id={`tier-${tier.id}`} className="dp-home-card-title">
                {tier.numeral}. {tier.name}
              </h2>
              <span className="dp-home-count">
                {done} of {lessons.length}
              </span>
            </header>
            <ul className="dp-home-list">
              {lessons.map((lesson) => {
                const avg = lessonMasteryAverage(storage.lessons[lesson.id]);
                return (
                  <li key={lesson.id} className="dp-home-row">
                    <span className="dp-home-num">{lesson.number}</span>
                    <span className="dp-home-title">{lesson.title}</span>
                    <span className="dp-home-score">{avg !== null ? `${avg}%` : ''}</span>
                    <div className="dp-home-actions">
                      <button
                        type="button"
                        className="dp-home-btn"
                        aria-label={`Learn ${lesson.title}`}
                        onClick={() => onOpenLesson(lesson.id, 'learn')}
                      >
                        Learn
                      </button>
                      <button
                        type="button"
                        className="dp-home-btn dp-home-btn--fill"
                        aria-label={`Practice ${lesson.title}`}
                        onClick={() => onOpenLesson(lesson.id, 'practice')}
                      >
                        Practice
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
};
