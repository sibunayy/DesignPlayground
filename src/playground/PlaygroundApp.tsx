import '@fontsource-variable/bricolage-grotesque';
import './styles/tokens.css';
import './styles/playground.css';
import React, { useEffect, useMemo, useState } from 'react';
import { randomSeedCode } from '../engine/prng';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { LessonPanel } from './components/LessonPanel';
import { Quiz } from './components/Quiz';
import { Stage } from './components/Stage';
import { Summary } from './components/Summary';
import { exercisesFor } from './content/exercises';
import { lessonsFor } from './content/lessons';
import { getMode } from './content/modes';
import { betterGrade, buildChallenge, ExerciseResult, gradeAnswer } from './logic/challenge';
import { buildQuiz } from './logic/quiz';
import { loadPlaygroundStore, savePlaygroundStore } from './state/storage';
import { Activity, AssistId, ModeId, PlaygroundStore } from './types';

interface PlaygroundAppProps {
  /** Mode to open, or null for the hub. */
  modeId: ModeId | null;
  /** The drag challenge or the A/B quiz. The challenge when not given. */
  activity?: Activity;
  onNavigate: (modeId: ModeId | null, activity?: Activity) => void;
}

export const PlaygroundApp: React.FC<PlaygroundAppProps> = ({ modeId, activity = 'practice', onNavigate }) => {
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

  const challenge = useMemo(
    () => (mode && exercise ? buildChallenge(exercise, mode, seed, exIndex) : null),
    [mode, exercise, seed, exIndex]
  );
  const key = `${modeId}:${seed}:${exIndex}`;
  const [edit, setEdit] = useState<{ key: string; vals: number[] }>({ key: '', vals: [] });
  const values = challenge ? (edit.key === key ? edit.vals : challenge.start) : [];

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
  }, [modeId, activity]);

  // A new exercise starts with the first handle selected.
  useEffect(() => setSelected(0), [exIndex, seed]);

  useEffect(() => savePlaygroundStore(store), [store]);

  const update = (fn: (s: PlaygroundStore) => PlaygroundStore) => setStore((s) => fn(s));

  const theme = store.theme ?? mode?.defaultTheme ?? 'dark';

  const toggleTheme = () => update((s) => ({ ...s, theme: theme === 'dark' ? 'light' : 'dark' }));
  const togglePanel = () => update((s) => ({ ...s, panelOpen: !s.panelOpen }));
  const toggleAssist = (id: AssistId) => update((s) => ({ ...s, assists: { ...s.assists, [id]: !s.assists[id] } }));

  const setModeField = (patch: Partial<PlaygroundStore['modes'][ModeId]>) => {
    if (!modeId) return;
    update((s) => ({ ...s, modes: { ...s.modes, [modeId]: { ...s.modes[modeId], ...patch } } }));
  };

  const isLast = exIndex >= exercises.length - 1;

  // Lock in records the grade and moves on. The learner sees no result until the summary.
  const onLockIn = () => {
    if (!challenge || !progress || !exercise) return;
    const result = gradeAnswer(values, challenge.targets);
    setRun((r) => ({ ...r, [exercise.id]: result }));
    setModeField({
      completed: progress.completed.includes(exercise.id) ? progress.completed : [...progress.completed, exercise.id],
      best: { ...progress.best, [exercise.id]: betterGrade(progress.best[exercise.id], result.grade) },
    });
    if (isLast) setShowSummary(true);
    else setExIndex(exIndex + 1);
  };

  const practiceAgain = () => {
    setSeed(randomSeedCode());
    setExIndex(0);
    setRun({});
    setShowSummary(false);
    if (activity !== 'practice') onNavigate(modeId, 'practice');
  };

  const working = Boolean(mode && exercise && progress && challenge) && activity !== 'quiz' && !showSummary;

  let body: React.ReactNode;
  if (!mode || !exercise || !progress || !challenge) {
    body = <Hub store={store} onOpen={(id, act) => onNavigate(id, act)} />;
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
        onPracticeAgain={practiceAgain}
        onQuiz={() => onNavigate(mode.id, 'quiz')}
        onHub={() => onNavigate(null)}
      />
    );
  } else {
    const steps = lessonsFor(mode.id);
    const stepIndex = Math.min(progress.lessonStep, steps.length - 1);
    const layout = store.panelOpen ? mode.layout : 'closed';
    body = (
      <main className={`dp-body dp-body--${layout}`}>
        <h1 className="dp-sr">{mode.name}</h1>
        <Stage
          mode={mode}
          challenge={challenge}
          values={values}
          assists={store.assists}
          selected={selected}
          fineOpen={fineOpen}
          counter={`${exIndex + 1} of ${exercises.length}`}
          onSelect={setSelected}
          onChange={setValue}
          onToggleAssist={toggleAssist}
          onToggleFine={() => setFineOpen((o) => !o)}
          onLockIn={onLockIn}
        />
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
