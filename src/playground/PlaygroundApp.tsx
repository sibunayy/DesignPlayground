import '@fontsource-variable/bricolage-grotesque';
import './styles/tokens.css';
import './styles/playground.css';
import React, { useEffect, useState } from 'react';
import { Dock } from './components/Dock';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { LessonPanel } from './components/LessonPanel';
import { Stage } from './components/Stage';
import { exercisesFor } from './content/exercises';
import { lessonsFor } from './content/lessons';
import { getMode } from './content/modes';
import { checkValue, feedbackMessage, readout } from './logic/check';
import { loadPlaygroundStore, savePlaygroundStore } from './state/storage';
import { AssistId, CheckResult, ModeId, PlaygroundStore } from './types';

interface PlaygroundAppProps {
  /** Mode to open, or null for the hub. */
  modeId: ModeId | null;
  onNavigate: (modeId: ModeId | null) => void;
  onExit: () => void;
}

export const PlaygroundApp: React.FC<PlaygroundAppProps> = ({ modeId, onNavigate, onExit }) => {
  const [store, setStore] = useState<PlaygroundStore>(() => loadPlaygroundStore());
  const mode = modeId ? getMode(modeId) : undefined;
  const exercises = modeId ? exercisesFor(modeId) : [];
  const progress = modeId ? store.modes[modeId] : undefined;
  const exIndex = progress ? Math.min(progress.exerciseIndex, exercises.length - 1) : 0;
  const exercise = exercises[exIndex];

  const [value, setValue] = useState<number>(exercise?.start ?? 0);
  const [result, setResult] = useState<CheckResult>('');

  // A new mode or exercise resets the slider and the feedback.
  useEffect(() => {
    if (exercise) setValue(exercise.start);
    setResult('');
  }, [exercise]);

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

  const isLast = exIndex === exercises.length - 1;

  const onCheck = () => {
    if (!exercise || !progress) return;
    const r = checkValue(value, exercise.lo, exercise.hi);
    setResult(r);
    if (r === 'good' && !progress.completed.includes(exercise.id)) {
      setModeField({ completed: [...progress.completed, exercise.id] });
    }
  };

  const onNext = () => setModeField({ exerciseIndex: isLast ? 0 : exIndex + 1 });

  const onChange = (v: number) => {
    setValue(v);
    if (result) setResult('');
  };

  let body: React.ReactNode;
  if (!mode || !exercise || !progress) {
    body = <Hub store={store} onOpen={(id) => onNavigate(id)} />;
  } else {
    const steps = lessonsFor(mode.id);
    const stepIndex = Math.min(progress.lessonStep, steps.length - 1);
    const layout = store.panelOpen ? mode.layout : 'closed';
    body = (
      <div className={`dp-body dp-body--${layout}`}>
        <Stage
          mode={mode}
          exercise={exercise}
          value={value}
          assists={store.assists}
          onToggleAssist={toggleAssist}
          readoutText={readout(mode, value, exercise)}
          message={feedbackMessage(mode, result, isLast)}
        />
        <Dock
          mode={mode}
          exercise={exercise}
          exerciseNumber={exIndex + 1}
          exerciseCount={exercises.length}
          value={value}
          result={result}
          isLast={isLast}
          onChange={onChange}
          onCheck={onCheck}
          onNext={onNext}
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
      </div>
    );
  }

  return (
    <div className={`dp${mode ? ' dp--mode' : ''}`} data-theme={theme} data-mode={mode?.id}>
      <Header
        modeId={mode ? mode.id : null}
        theme={theme}
        panelOpen={store.panelOpen}
        onBack={() => (mode ? onNavigate(null) : onExit())}
        onSelectMode={(id) => onNavigate(id)}
        onToggleTheme={toggleTheme}
        onTogglePanel={togglePanel}
      />
      {body}
    </div>
  );
};
