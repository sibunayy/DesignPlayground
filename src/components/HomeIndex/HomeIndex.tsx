import React from 'react';
import { ArrowRight, CheckCircle2, Moon, Play, Sparkles, Sun } from 'lucide-react';
import { LESSONS, TIERS } from '../../data/lessons';
import { dailySeedCode } from '../../engine/prng';
import { lessonMasteryAverage, SightlineStorageV1 } from '../../engine/storage';
import { LessonDefinition } from '../../engine/types';

interface HomeIndexProps {
  storage: SightlineStorageV1;
  onOpenLesson: (lessonId: string, mode: 'learn' | 'practice') => void;
  onOpenDailyMix: () => void;
  onToggleTheme: () => void;
}

export const HomeIndex: React.FC<HomeIndexProps> = ({
  storage,
  onOpenLesson,
  onOpenDailyMix,
  onToggleTheme,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailySeed = dailySeedCode(todayStr);
  const dailyScore = storage.dailyCompletedDates[todayStr];

  const completedCount = LESSONS.filter(
    (l) => (storage.lessons[l.id]?.attempts ?? 0) > 0
  ).length;

  const nextLesson: LessonDefinition =
    LESSONS.find((l) => (lessonMasteryAverage(storage.lessons[l.id]) ?? 0) < 80) ?? LESSONS[0];

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 960,
        margin: '0 auto',
        padding: 'calc(24px + var(--safe-top)) max(22px, var(--safe-right)) max(56px, var(--safe-bottom)) max(22px, var(--safe-left))',
        display: 'flex',
        flexDirection: 'column',
        gap: 36,
      }}
    >
      {/* Swiss Editorial Masthead */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          paddingBottom: 24,
          borderBottom: '1px solid var(--rule-strong)',
        }}
      >
        <div>
          <div
            className="tabular"
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-muted)',
              marginBottom: 8,
            }}
          >
            Sightline · Visual Craft Studio · {completedCount}/13 Labs Practiced
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 5vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
            }}
          >
            Train your eye past software defaults.
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 15.5,
              color: 'var(--ink-secondary)',
              maxWidth: '58ch',
              lineHeight: 1.5,
            }}
          >
            Short visual explainers followed by direct touch and Apple Pencil exercises across typography, optical geometry, perceptual color, framing, and prepress.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle studio light or darkroom mode"
          className="touch-target"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid var(--rule)',
            background: 'var(--bg-surface)',
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {storage.preferences.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{storage.preferences.theme === 'dark' ? 'Paper' : 'Darkroom'}</span>
        </button>
      </header>

      {/* Top Action Strip: Next Up + Daily 5-Min Mix */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Next Up Hero Card */}
        <div
          style={{
            padding: 22,
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              className="tabular"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              Next Up · Lesson {nextLesson.number}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 500,
                marginTop: 6,
                lineHeight: 1.18,
              }}
            >
              {nextLesson.title}
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 6 }}>
              {nextLesson.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => onOpenLesson(nextLesson.id, 'learn')}
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 18px',
                borderRadius: 999,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <Play size={14} strokeWidth={2.2} />
              <span>Watch Explainer</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLesson(nextLesson.id, 'practice')}
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 16px',
                borderRadius: 999,
                border: '1px solid var(--rule-strong)',
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              <span>Practice</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Daily 5-Min Mix Card */}
        <div
          style={{
            padding: 22,
            borderRadius: 16,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--rule)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-secondary)',
                }}
              >
                <Sparkles size={13} />
                <span>Daily 5-Min Mix</span>
              </span>
              <span className="tabular" style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                #{dailySeed}
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 500,
                marginTop: 6,
                lineHeight: 1.18,
              }}
            >
              Five Fresh Seeded Drills
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 6 }}>
              {dailyScore !== undefined
                ? `Completed today with an average score of ${dailyScore}/100. Run again anytime.`
                : 'A calm cross-discipline calibration set drawn across Foundation, Building, and Challenge.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDailyMix}
            className="touch-target"
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 18px',
              borderRadius: 999,
              background: 'var(--ink-primary)',
              color: 'var(--bg-surface)',
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {dailyScore !== undefined ? <CheckCircle2 size={15} /> : <ArrowRight size={15} />}
            <span>{dailyScore !== undefined ? 'Replay Daily Mix' : 'Start Daily Mix'}</span>
          </button>
        </div>
      </section>

      {/* Curriculum Tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {TIERS.map((tier) => {
          const tierLessons = LESSONS.filter((l) => l.tier === tier.id);
          return (
            <section key={tier.id} aria-labelledby={`tier-${tier.id}`}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--rule-strong)',
                }}
              >
                <h2
                  id={`tier-${tier.id}`}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 23,
                    fontWeight: 500,
                  }}
                >
                  {tier.numeral}. {tier.name}
                </h2>
                <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>{tier.caption}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {tierLessons.map((lesson) => {
                  const prog = storage.lessons[lesson.id];
                  const avg = lessonMasteryAverage(prog);
                  return (
                    <div
                      key={lesson.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        padding: '15px 4px',
                        borderBottom: '1px solid var(--rule)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenLesson(lesson.id, 'learn')}
                        style={{
                          flex: '1 1 280px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 14,
                        }}
                      >
                        <span
                          className="tabular"
                          style={{
                            fontSize: 13,
                            color: 'var(--ink-muted)',
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        >
                          {lesson.number}
                        </span>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink-primary)' }}>
                            {lesson.title}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--ink-secondary)', marginTop: 2 }}>
                            {lesson.subtitle}
                          </div>
                        </div>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {avg !== null ? (
                          <span
                            className="tabular"
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: avg >= 85 ? 'var(--ok-tint)' : 'var(--bg-subtle)',
                              color: avg >= 85 ? 'var(--ok)' : 'var(--ink-secondary)',
                            }}
                          >
                            {avg}% avg
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>New</span>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenLesson(lesson.id, 'learn')}
                          style={{
                            minHeight: 36,
                            padding: '0 12px',
                            borderRadius: 999,
                            border: '1px solid var(--rule)',
                            fontSize: 12.5,
                            fontWeight: 500,
                          }}
                        >
                          Learn
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLesson(lesson.id, 'practice')}
                          style={{
                            minHeight: 36,
                            padding: '0 14px',
                            borderRadius: 999,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--rule-strong)',
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          Lab →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
