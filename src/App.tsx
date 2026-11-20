import React, { lazy, Suspense, useEffect, useState } from 'react';
import { DailyMixRunner } from './components/DailyMix/DailyMixRunner';
import { HomeIndex } from './components/HomeIndex/HomeIndex';
import { LearnView } from './components/LearnView/LearnView';
import { TopBar } from './components/StudioShell/TopBar';
import { getLessonById, LESSONS } from './data/lessons';
import { randomSeedCode } from './engine/prng';
import {
  applyThemeMetadata,
  loadStorage,
  recordDailyCompletion,
  recordLessonAttempt,
  saveStorage,
  SightlineStorageV1,
} from './engine/storage';
import { EyeLens } from './engine/types';
import { ExerciseViewport } from './exercises/ExerciseRegistry';
import { isModeId } from './playground/content/modes';
import type { Activity, ModeId } from './playground/types';

// The playground loads on demand so the Sightline start bundle stays small.
const PlaygroundApp = lazy(() =>
  import('./playground/PlaygroundApp').then((m) => ({ default: m.PlaygroundApp }))
);

type Route =
  | { view: 'home' }
  | { view: 'daily' }
  | { view: 'playground'; modeId: ModeId | null; activity?: Activity }
  | { view: 'lesson'; lessonId: string; mode: 'learn' | 'practice' };

function parseHashRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === '/daily') return { view: 'daily' };
  const pg = hash.match(/^\/playground(?:\/([^/]+)(?:\/(quiz))?)?\/?$/);
  if (pg) {
    const modeId = pg[1] && isModeId(pg[1]) ? pg[1] : null;
    return { view: 'playground', modeId, activity: modeId && pg[2] === 'quiz' ? 'quiz' : 'practice' };
  }
  const match = hash.match(/^\/lesson\/([^/]+)(?:\/(learn|practice))?$/);
  if (match) {
    const lesson = getLessonById(match[1]);
    return {
      view: 'lesson',
      lessonId: lesson.id,
      mode: match[2] === 'practice' ? 'practice' : 'learn',
    };
  }
  return { view: 'home' };
}

export const App: React.FC = () => {
  const [storage, setStorage] = useState<SightlineStorageV1>(() => loadStorage());
  const [route, setRoute] = useState<Route>(() => parseHashRoute());
  const [seed, setSeed] = useState<string>(() => randomSeedCode());
  const [activeLenses, setActiveLenses] = useState<Set<EyeLens>>(new Set());

  useEffect(() => {
    applyThemeMetadata(storage.preferences.theme);
  }, [storage.preferences.theme]);

  useEffect(() => {
    const onHash = () => {
      setActiveLenses(new Set());
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: Route) => {
    setActiveLenses(new Set());
    if (next.view === 'home') {
      window.location.hash = '#/';
    } else if (next.view === 'daily') {
      window.location.hash = '#/daily';
    } else if (next.view === 'playground') {
      window.location.hash = next.modeId
        ? `#/playground/${next.modeId}${next.activity === 'quiz' ? '/quiz' : ''}`
        : '#/playground';
    } else {
      window.location.hash = `#/lesson/${next.lessonId}/${next.mode}`;
    }
    setRoute(next);
  };

  const toggleTheme = () => {
    setStorage((prev) => {
      const nextTheme = prev.preferences.theme === 'dark' ? 'light' : 'dark';
      const updated: SightlineStorageV1 = {
        ...prev,
        preferences: { ...prev.preferences, theme: nextTheme },
      };
      saveStorage(updated);
      return updated;
    });
  };

  const toggleRailSide = () => {
    setStorage((prev) => {
      const nextRail = prev.preferences.railSide === 'right' ? 'left' : 'right';
      const updated: SightlineStorageV1 = {
        ...prev,
        preferences: { ...prev.preferences, railSide: nextRail },
      };
      saveStorage(updated);
      return updated;
    });
  };

  const handleToggleLens = (lens: EyeLens) => {
    setActiveLenses((prev) => {
      const next = new Set(prev);
      if (next.has(lens)) next.delete(lens);
      else next.add(lens);
      return next;
    });
  };

  if (route.view === 'home') {
    return (
      <HomeIndex
        storage={storage}
        onOpenLesson={(lessonId, mode) => {
          setSeed(randomSeedCode());
          navigate({ view: 'lesson', lessonId, mode });
        }}
        onOpenDailyMix={() => navigate({ view: 'daily' })}
        onOpenPlayground={(modeId) => navigate({ view: 'playground', modeId: modeId ?? null })}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route.view === 'playground') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100dvh' }} />}>
        <PlaygroundApp
          modeId={route.modeId}
          activity={route.activity}
          onNavigate={(modeId, activity) => navigate({ view: 'playground', modeId, activity })}
          onExit={() => navigate({ view: 'home' })}
        />
      </Suspense>
    );
  }

  if (route.view === 'daily') {
    return (
      <DailyMixRunner
        theme={storage.preferences.theme}
        railSide={storage.preferences.railSide}
        onToggleTheme={toggleTheme}
        onToggleRailSide={toggleRailSide}
        onExit={() => navigate({ view: 'home' })}
        onOpenPlayground={(modeId) => navigate({ view: 'playground', modeId })}
        onRecordDrillScore={(lessonId, score) => {
          setStorage((prev) => recordLessonAttempt(prev, lessonId, score));
        }}
        onFinishDaily={(dateStr, avg) => {
          setStorage((prev) => recordDailyCompletion(prev, dateStr, avg));
        }}
      />
    );
  }

  const lesson = getLessonById(route.lessonId);
  const currentIdx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS[(currentIdx + 1) % LESSONS.length];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        lesson={lesson}
        mode={route.mode}
        onChangeMode={(mode) => navigate({ view: 'lesson', lessonId: lesson.id, mode })}
        seed={route.mode === 'practice' ? seed : undefined}
        onChangeSeed={(nextSeed) => setSeed(nextSeed)}
        onRandomSeed={() => setSeed(randomSeedCode())}
        onBack={() => navigate({ view: 'home' })}
        theme={storage.preferences.theme}
        onToggleTheme={toggleTheme}
        railSide={storage.preferences.railSide}
        onToggleRailSide={toggleRailSide}
      />

      {route.mode === 'learn' ? (
        <LearnView
          lesson={lesson}
          onStartPractice={() => navigate({ view: 'lesson', lessonId: lesson.id, mode: 'practice' })}
        />
      ) : (
        <ExerciseViewport
          key={`${lesson.id}-${seed}`}
          lessonId={lesson.id}
          seed={seed}
          availableLenses={lesson.availableLenses}
          activeLenses={activeLenses}
          onToggleLens={handleToggleLens}
          railSide={storage.preferences.railSide}
          onComplete={(res) => {
            setStorage((prev) => recordLessonAttempt(prev, lesson.id, res.score));
          }}
          onNewSeed={() => setSeed(randomSeedCode())}
          onNextLesson={() => {
            setSeed(randomSeedCode());
            navigate({ view: 'lesson', lessonId: nextLesson.id, mode: 'learn' });
          }}
          nextLabel={`Next: ${nextLesson.number} ${nextLesson.shortTitle}`}
        />
      )}
    </div>
  );
};

export default App;
