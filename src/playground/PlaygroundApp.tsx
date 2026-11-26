import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/playfair-display';
import '@fontsource/archivo-black';
import './styles/tokens.css';
import './styles/playground.css';
import React, { useEffect, useMemo, useState } from 'react';
import { randomSeedCode } from '../engine/prng';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { LessonPanel } from './components/LessonPanel';
import { Quiz } from './components/Quiz';
import { ReviewPanel, ReviewView } from './components/ReviewPanel';
import { DriftWork } from './components/Drift';
import { SceneWork } from './components/Scene';
import { Stage } from './components/Stage';
import { Summary } from './components/Summary';
import { exercisesFor } from './content/exercises';
import { tipFor } from './content/tips';
import { lessonsFor } from './content/lessons';
import { getMode } from './content/modes';
import { betterGrade, buildChallenge, ExerciseResult, kernFontFor } from './logic/challenge';
import { kernNotes, modeNotes, MODE_UNIT } from './logic/notes';
import { centreOf, reviewAnswer } from './logic/scoring';
import { useFontReady } from './state/useFontReady';
import { buildQuiz } from './logic/quiz';
import { loadPlaygroundStore, savePlaygroundStore } from './state/storage';
import { Activity, AssistId, GameId, ModeId, PlaygroundStore } from './types';

interface PlaygroundAppProps {
  /** Mode to open, or null for the hub. */
  modeId: ModeId | null;
  /** The drag challenge or the A/B quiz. The challenge when not given. */
  activity?: Activity;
  onNavigate: (modeId: ModeId | null, activity?: Activity) => void;
  /** A game outside the type modes. Shown in place of the hub. */
  game?: GameId | null;
  onOpenGame?: (game: GameId) => void;
}

export const PlaygroundApp: React.FC<PlaygroundAppProps> = ({ modeId, activity = 'practice', onNavigate, game = null, onOpenGame }) => {
  const [store, setStore] = useState<PlaygroundStore>(() => loadPlaygroundStore());
  const mode = modeId ? getMode(modeId) : undefined;
  const exercises = modeId ? exercisesFor(modeId) : [];
  const progress = modeId ? store.modes[modeId] : undefined;

  // A run is one pass through a mode with one seed. Results stay hidden until the run ends.
  const [seed, setSeed] = useState(() => randomSeedCode());
  const [exIndex, setExIndex] = useState(0);
  const [run, setRun] = useState<Record<string, ExerciseResult>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [selected, setSelected] = useState(0);
  const [fineOpen, setFineOpen] = useState(false);
  const exercise = exercises[Math.min(exIndex, exercises.length - 1)];
  // Kerning reads its answer key from the loaded font, so the challenge waits for the font.
  const fontReady = useFontReady(modeId === 'kerning' ? kernFontFor(seed, exIndex) : undefined);

  const challenge = useMemo(
    () => (mode && exercise ? buildChallenge(exercise, mode, seed, exIndex) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, exercise, seed, exIndex, fontReady]
  );
  // After lock in, the answer stays on the stage with its review. Retry does not score.
  const [locked, setLocked] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [view, setView] = useState<ReviewView>('overlay');
  const key = `${modeId}:${seed}:${exIndex}`;
  const [edit, setEdit] = useState<{ key: string; vals: number[] }>({ key: '', vals: [] });
  const values = challenge ? (edit.key === key ? edit.vals : challenge.start) : [];

  const setAll = (vals: number[]) => {
    if (challenge) setEdit({ key, vals });
  };

  const setValue = (index: number, v: number) => {
    if (!challenge) return;
    setEdit((prev) => ({
      key,
      vals: (prev.key === key ? prev.vals : challenge.start).map((x, i) => (i === index ? v : x)),
    }));
  };

  // A new mode or activity starts a fresh run.
  useEffect(() => {
    setSeed(randomSeedCode());
    setExIndex(0);
    setRun({});
    setShowSummary(false);
    setSelected(0);
    setLocked(false);
    setRetrying(false);
  }, [modeId, activity]);

  // A new exercise starts with the first handle selected.
  useEffect(() => setSelected(0), [exIndex, seed]);

  useEffect(() => savePlaygroundStore(store), [store]);

  const update = (fn: (s: PlaygroundStore) => PlaygroundStore) => setStore((s) => fn(s));

  const theme = store.theme ?? mode?.defaultTheme ?? 'dark';

  const toggleTheme = () => update((s) => ({ ...s, theme: theme === 'dark' ? 'light' : 'dark' }));
  const togglePanel = () => update((s) => ({ ...s, panelOpen: !s.panelOpen }));
  const toggleTips = () => update((s) => ({ ...s, tipsOpen: !s.tipsOpen }));
  const toggleAssist = (id: AssistId) => update((s) => ({ ...s, assists: { ...s.assists, [id]: !s.assists[id] } }));

  const setModeField = (patch: Partial<PlaygroundStore['modes'][ModeId]>) => {
    if (!modeId) return;
    update((s) => ({ ...s, modes: { ...s.modes, [modeId]: { ...s.modes[modeId], ...patch } } }));
  };

  const isLast = exIndex >= exercises.length - 1;

  // Lock in scores the answer and shows the review on the stage. Nothing showed how close it was before.
  // A retry is practice: it shows a review but keeps the first score.
  const onLockIn = () => {
    if (!challenge || !progress || !exercise) return;
    setLocked(true);
    setView(mode?.id === 'kerning' ? 'overlay' : 'yours');
    setFineOpen(false);
    if (retrying) return;
    const r = reviewAnswer(values, challenge.start, challenge.targets, undefined, { tracking: mode?.id === 'kerning' && !challenge.pinned });
    const result: ExerciseResult = { grade: r.grade, right: r.right, total: r.total, score: r.score };
    const nextRun = { ...run, [exercise.id]: result };
    setRun(nextRun);
    const patch: Partial<PlaygroundStore['modes'][ModeId]> = {
      completed: progress.completed.includes(exercise.id) ? progress.completed : [...progress.completed, exercise.id],
      best: { ...progress.best, [exercise.id]: betterGrade(progress.best[exercise.id], result.grade) },
    };
    if (isLast) {
      const scores = exercises.map((e) => nextRun[e.id]?.score ?? 0);
      const runScore = Math.round(scores.reduce((a, b) => a + b, 0) / exercises.length);
      patch.runBest = Math.max(progress.runBest ?? 0, runScore);
    }
    setModeField(patch);
  };

  const onNext = () => {
    setLocked(false);
    setRetrying(false);
    if (isLast) setShowSummary(true);
    else setExIndex(exIndex + 1);
  };

  const onRetry = () => {
    setEdit({ key, vals: challenge ? challenge.start : [] });
    setLocked(false);
    setRetrying(true);
  };

  const review = useMemo(
    () => (locked && challenge ? reviewAnswer(values, challenge.start, challenge.targets, undefined, { tracking: mode?.id === 'kerning' && !challenge.pinned }) : null),
    [locked, challenge, values, mode]
  );

  const practiceAgain = () => {
    setSeed(randomSeedCode());
    setExIndex(0);
    setRun({});
    setShowSummary(false);
    setLocked(false);
    setRetrying(false);
    if (activity !== 'practice') onNavigate(modeId, 'practice');
  };

  const working = Boolean(mode && exercise && progress && challenge) && activity === 'practice' && !showSummary;

  let body: React.ReactNode;
  if (!mode && game === 'drift') {
    const g = store.games.drift;
    body = (
      <DriftWork
        best={g.best}
        tipsOpen={store.tipsOpen}
        onToggleTips={toggleTips}
        onScored={(score) =>
          update((s) => ({ ...s, games: { ...s.games, drift: { best: Math.max(s.games.drift.best, score), played: s.games.drift.played + 1 } } }))
        }
      />
    );
  } else if (!mode || !exercise || !progress || !challenge) {
    body = <Hub store={store} onOpen={(id, act) => onNavigate(id, act)} onOpenGame={onOpenGame} />;
  } else if (activity === 'scene') {
    body = (
      <SceneWork
        best={progress.sceneBest ?? 0}
        tipsOpen={store.tipsOpen}
        onToggleTips={toggleTips}
        onScored={(score) => setModeField({ sceneBest: Math.max(progress.sceneBest ?? 0, score) })}
      />
    );
  } else if (activity === 'quiz') {
    body = (
      <Quiz
        key={mode.id}
        mode={mode}
        questions={buildQuiz(mode.id)}
        best={progress.quizBest}
        onFinish={(score) => setModeField({ quizBest: Math.max(progress.quizBest, score) })}
        onPractice={() => onNavigate(mode.id, 'practice')}
        onHub={() => onNavigate(null)}
      />
    );
  } else if (showSummary) {
    body = (
      <Summary
        mode={mode}
        exercises={exercises}
        results={run}
        seed={seed}
        runBest={progress.runBest ?? 0}
        onPracticeAgain={practiceAgain}
        onScene={mode.id === 'kerning' ? () => onNavigate(mode.id, 'scene') : undefined}
        onQuiz={() => onNavigate(mode.id, 'quiz')}
        onHub={() => onNavigate(null)}
      />
    );
  } else {
    const steps = lessonsFor(mode.id);
    const stepIndex = Math.min(progress.lessonStep, steps.length - 1);
    const layout = store.panelOpen ? mode.layout : 'closed';
    // The ideal outline moves with the learner's own tracking, so it shows only the pair errors.
    const ideal = (review ? review.handles.map((h) => centreOf(h.target)) : challenge.targets.map(centreOf));
    const isKern = mode.id === 'kerning';
    const notes = review
      ? isKern
        ? kernNotes(review, challenge.parts.slice(1).map((ch, i) => [challenge.parts[i], ch] as [string, string]))
        : modeNotes(review, mode, challenge.labels, MODE_UNIT[mode.id])
      : [];
    const shown = review && view === 'ideal' && !isKern ? ideal : values;
    body = (
      <main className={`dp-body dp-body--${layout}`}>
        <h1 className="dp-sr">{mode.name}</h1>
        <Stage
          mode={mode}
          challenge={challenge}
          values={shown}
          assists={store.assists}
          selected={selected}
          fineOpen={fineOpen}
          counter={`${exIndex + 1} of ${exercises.length}`}
          onSelect={setSelected}
          onChange={setValue}
          onChangeAll={setAll}
          onToggleAssist={toggleAssist}
          onToggleFine={() => setFineOpen((o) => !o)}
          onLockIn={onLockIn}
          tip={tipFor(mode.id, exIndex)}
          tipsOpen={store.tipsOpen}
          onToggleTips={toggleTips}
          locked={Boolean(review)}
          ghost={review && isKern && view !== 'yours' ? ideal : undefined}
          ghostOnly={Boolean(review && isKern && view === 'ideal')}
          marks={review && isKern && view === 'overlay' ? review.handles : undefined}
        >
          {review && (
            <ReviewPanel
              review={review}
              notes={notes}
              view={view}
              views={isKern ? ['yours', 'overlay', 'ideal'] : ['yours', 'ideal']}
              onView={setView}
              onNext={onNext}
              onRetry={onRetry}
              labels={isKern ? challenge.parts.slice(1).map((ch, i) => `${challenge.parts[i]}${ch}`) : challenge.labels}
              nextLabel={isLast ? 'See results' : 'Next'}
              practice={retrying}
            />
          )}
        </Stage>
        {store.panelOpen && (
          <LessonPanel
            mode={mode}
            steps={steps}
            index={stepIndex}
            onPrev={() => setModeField({ lessonStep: Math.max(0, stepIndex - 1) })}
            onNext={() => setModeField({ lessonStep: stepIndex >= steps.length - 1 ? 0 : stepIndex + 1 })}
          />
        )}
      </main>
    );
  }

  return (
    <div
      className={`dp${mode ? ' dp--mode dp--flat' : ''}${working ? ' dp--work' : ''}${working && store.panelOpen ? ' dp--lesson' : ''}`}
      data-theme={theme} data-mode={mode?.id}
    >
      <Header
        modeId={mode ? mode.id : null}
        inGame={!mode && Boolean(game)}
        theme={theme}
        panelOpen={store.panelOpen}
        onBack={() => onNavigate(null)}
        onSelectMode={(id) => onNavigate(id, activity)}
        onToggleTheme={toggleTheme}
        onTogglePanel={togglePanel}
      />
      {body}
    </div>
  );
};
