import React, { useMemo, useState } from 'react';
import { Award, Check, ChevronRight, Lightbulb } from 'lucide-react';
import { LESSONS } from '../../data/lessons';
import { dailySeedCode, SeededRng } from '../../engine/prng';
import { ExerciseResult, EyeLens } from '../../engine/types';
import { ExerciseViewport } from '../../exercises/ExerciseRegistry';
import { TopBar } from '../StudioShell/TopBar';

interface DailyMixRunnerProps {
  theme: 'light' | 'dark';
  railSide: 'right' | 'left';
  onToggleTheme: () => void;
  onToggleRailSide: () => void;
  onExit: () => void;
  onRecordDrillScore?: (lessonId: string, score: number) => void;
  onFinishDaily: (dateStr: string, avgScore: number, perLesson: Array<{ lessonId: string; score: number }>) => void;
}

export const DailyMixRunner: React.FC<DailyMixRunnerProps> = ({
  theme,
  railSide,
  onToggleTheme,
  onToggleRailSide,
  onExit,
  onRecordDrillScore,
  onFinishDaily,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailySeed = dailySeedCode(todayStr);

  const drills = useMemo(() => {
    const rng = new SeededRng(dailySeed);
    const f = rng.shuffle(LESSONS.filter((l) => l.tier === 'foundation')).slice(0, 2);
    const b = rng.shuffle(LESSONS.filter((l) => l.tier === 'building')).slice(0, 2);
    const c = rng.shuffle(LESSONS.filter((l) => l.tier === 'challenge')).slice(0, 1);
    const selected = [...f, ...b, ...c];
    return selected.map((lesson, idx) => ({
      lesson,
      seed: `${dailySeed.slice(0, 3)}${idx.toString(16).toUpperCase()}`,
    }));
  }, [dailySeed]);

  const [stepIdx, setStepIdx] = useState(0);
  const [scores, setScores] = useState<Array<{ lessonId: string; title: string; result: ExerciseResult }>>([]);
  const [activeLenses, setActiveLenses] = useState<Set<EyeLens>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const finished = stepIdx >= drills.length;
  const current = drills[Math.min(stepIdx, drills.length - 1)];

  const handleToggleLens = (lens: EyeLens) => {
    setActiveLenses((prev) => {
      const next = new Set(prev);
      if (next.has(lens)) next.delete(lens);
      else next.add(lens);
      return next;
    });
  };

  const handleCompleteDrill = (res: ExerciseResult) => {
    onRecordDrillScore?.(current.lesson.id, res.score);
    const nextEntry = { lessonId: current.lesson.id, title: current.lesson.shortTitle, result: res };
    const updated = [...scores.filter((s) => s.lessonId !== current.lesson.id), nextEntry];
    setScores(updated);
    if (updated.length === drills.length) {
      const avg = Math.round(updated.reduce((sum, x) => sum + x.result.score, 0) / updated.length);
      onFinishDaily(
        todayStr,
        avg,
        updated.map((u) => ({ lessonId: u.lessonId, score: u.result.score }))
      );
    }
  };

  const advance = () => {
    setActiveLenses(new Set());
    setShowHint(false);
    setStepIdx((i) => i + 1);
  };

  if (finished) {
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((s, item) => s + item.result.score, 0) / scores.length)
        : 0;

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <TopBar
          dailyBadge={`Daily Mix · #${dailySeed}`}
          onBack={onExit}
          theme={theme}
          onToggleTheme={onToggleTheme}
          railSide={railSide}
          onToggleRailSide={onToggleRailSide}
        />

        <main
          style={{
            flex: 1,
            maxWidth: 640,
            width: '100%',
            margin: '0 auto',
            padding: '36px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Award size={28} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)' }}>
                Daily Calibration Complete
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500 }}>
                Average Score: <span className="tabular">{avg}/100</span>
              </h1>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--rule)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {scores.map((entry, idx) => (
              <div
                key={entry.lessonId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--rule)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{entry.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)', marginTop: 2 }}>
                    {entry.result.diagnosis}
                  </div>
                </div>
                <span className="tabular" style={{ fontSize: 16, fontWeight: 600, marginLeft: 12 }}>
                  {entry.result.score}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onExit}
            className="touch-target"
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 22px',
              borderRadius: 999,
              background: 'var(--ink-primary)',
              color: 'var(--bg-surface)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Check size={16} />
            <span>Return to Studio Index</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        lesson={current.lesson}
        dailyBadge={`Mix ${stepIdx + 1}/${drills.length}`}
        seed={current.seed}
        onBack={onExit}
        theme={theme}
        onToggleTheme={onToggleTheme}
        railSide={railSide}
        onToggleRailSide={onToggleRailSide}
      />

      {/* Quick Rule Hint Strip */}
      <div
        style={{
          padding: '8px max(20px, var(--safe-right)) 8px max(20px, var(--safe-left))',
          borderBottom: '1px solid var(--rule)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: 'var(--ink-secondary)',
            fontWeight: 500,
          }}
        >
          <Lightbulb size={14} color="var(--accent)" />
          <span>{showHint ? current.lesson.ruleOfThumb : 'Tap for quick studio rule hint'}</span>
        </button>

        {scores.some((s) => s.lessonId === current.lesson.id) && (
          <button
            type="button"
            onClick={advance}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            <span>{stepIdx === drills.length - 1 ? 'Finish Mix' : 'Next Drill'}</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <ExerciseViewport
        key={`${current.lesson.id}-${current.seed}`}
        lessonId={current.lesson.id}
        seed={current.seed}
        availableLenses={current.lesson.availableLenses}
        activeLenses={activeLenses}
        onToggleLens={handleToggleLens}
        railSide={railSide}
        onComplete={handleCompleteDrill}
        onNewSeed={advance}
        onNextLesson={advance}
        nextLabel={stepIdx === drills.length - 1 ? 'Finish Daily Mix' : `Next Drill (${stepIdx + 2}/${drills.length})`}
      />
    </div>
  );
};
