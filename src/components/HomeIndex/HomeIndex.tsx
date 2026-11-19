import React from 'react';
import { BookOpen, CheckCircle2, Compass, Moon, Play, Sun } from 'lucide-react';
import { LESSONS, TIERS } from '../../data/lessons';
import { STILL_LIFE_PHOTOS } from '../../data/photoCatalog';
import { dailySeedCode } from '../../engine/prng';
import { lessonMasteryAverage, SightlineStorageV1 } from '../../engine/storage';
import { LessonDefinition } from '../../engine/types';
import {
  DailyMixCalibratorIcon,
  LessonCraftIcon,
  SightlineEmblem,
} from '../Icons/CraftIcons';

interface HomeIndexProps {
  storage: SightlineStorageV1;
  onOpenLesson: (lessonId: string, mode: 'learn' | 'practice') => void;
  onOpenDailyMix: () => void;
  onToggleTheme: () => void;
}

const BUILDING_SPECIMEN: Record<string, string> = {
  '05-font-pairing': 'Aa',
  '06-paragraph-flow': '¶',
  '07-micro-type': 'AV',
  '08-character-hygiene': '“′”',
  '09-optical-geometry': '◎',
};

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

  const foundationLessons = LESSONS.filter((l) => l.tier === 'foundation');
  const buildingLessons = LESSONS.filter((l) => l.tier === 'building');
  const challengeLessons = LESSONS.filter((l) => l.tier === 'challenge');

  const ringRadius = 15;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - completedCount / LESSONS.length);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 1020,
        margin: '0 auto',
        padding:
          'calc(22px + var(--safe-top)) max(22px, var(--safe-right)) max(64px, var(--safe-bottom)) max(22px, var(--safe-left))',
        display: 'flex',
        flexDirection: 'column',
        gap: 42,
      }}
    >
      {/* Top Studio Bar & Asymmetric Masthead */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          paddingBottom: 28,
          borderBottom: '1.5px solid var(--ink-primary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SightlineEmblem size={28} />
            <span
              style={{
                fontFamily: 'var(--font-grotesk)',
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              Sightline
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px 5px 8px',
                borderRadius: 8,
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r={ringRadius} fill="none" stroke="var(--rule)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>
                  {completedCount} of 13
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Labs practiced</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle studio light or darkroom mode"
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 14px',
                borderRadius: 8,
                border: '1px solid var(--rule-strong)',
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-tactile)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {storage.preferences.theme === 'dark' ? (
                <Sun size={15} aria-hidden="true" />
              ) : (
                <Moon size={15} aria-hidden="true" />
              )}
              <span>{storage.preferences.theme === 'dark' ? 'Studio Paper' : 'Darkroom'}</span>
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 680 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 4.8vw, 50px)',
              fontWeight: 500,
              lineHeight: 1.07,
              letterSpacing: '-0.02em',
            }}
          >
            Train your eye past software defaults.
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 16,
              color: 'var(--ink-secondary)',
              maxWidth: '58ch',
              lineHeight: 1.55,
            }}
          >
            Watch concise under-10-second visual demos, then practice directly with touch and Apple Pencil across thirteen authentic design worlds.
          </p>
        </div>
      </header>

      {/* Featured Asymmetric Split: Next Up Atelier Focus + Daily 5-Min Calibration */}
      <section
        aria-label="Featured practice"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 18,
          alignItems: 'stretch',
        }}
      >
        {/* Next Up Atelier Desk */}
        <div
          style={{
            padding: 24,
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule-strong)',
            boxShadow: 'var(--shadow-artboard)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                Recommended next, Lesson {nextLesson.number}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 25,
                  fontWeight: 500,
                  marginTop: 6,
                  lineHeight: 1.16,
                }}
              >
                {nextLesson.title}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-secondary)', marginTop: 6 }}>
                {nextLesson.subtitle}
              </p>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
                Setting: {nextLesson.styleWorld}
              </div>
            </div>

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <LessonCraftIcon lessonId={nextLesson.id} size={28} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onOpenLesson(nextLesson.id, 'learn')}
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 18px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                boxShadow: '0 2px 0 rgba(17, 19, 23, 0.22)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Play size={14} strokeWidth={2.2} aria-hidden="true" />
              <span>Watch Explainer</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLesson(nextLesson.id, 'practice')}
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 16px',
                borderRadius: 8,
                border: '1px solid var(--rule-strong)',
                background: 'var(--bg-paper)',
                boxShadow: 'var(--shadow-tactile)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Compass size={15} aria-hidden="true" />
              <span>Open Lab</span>
            </button>
          </div>
        </div>

        {/* Daily 5-Min Calibration Hardware Ticket */}
        <div
          style={{
            padding: 24,
            borderRadius: 14,
            background: 'var(--ink-primary)',
            color: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <DailyMixCalibratorIcon size={20} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Daily 5-Min Calibration</span>
              </div>
              <span className="tabular" style={{ fontSize: 12, opacity: 0.7 }}>
                #{dailySeed}
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 23,
                fontWeight: 500,
                marginTop: 10,
                lineHeight: 1.18,
              }}
            >
              Five Fresh Seeded Drills
            </h2>
            <p style={{ fontSize: 13.5, opacity: 0.78, marginTop: 6, lineHeight: 1.45 }}>
              {dailyScore !== undefined
                ? `Completed today with an average score of ${dailyScore}/100.`
                : 'Cross-tier rapid drills sampled fresh every day across layout, type, color, and framing.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5 }} aria-hidden="true">
              {[0, 1, 2, 3, 4].map((pip) => (
                <span
                  key={pip}
                  style={{
                    width: 14,
                    height: 5,
                    borderRadius: 2,
                    background:
                      dailyScore !== undefined ? 'var(--ok)' : 'rgba(255, 255, 255, 0.25)',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenDailyMix}
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 16px',
                borderRadius: 8,
                background: 'var(--bg-surface)',
                color: 'var(--ink-primary)',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              {dailyScore !== undefined ? (
                <CheckCircle2 size={15} aria-hidden="true" />
              ) : (
                <Play size={14} aria-hidden="true" />
              )}
              <span>{dailyScore !== undefined ? 'Replay Mix' : 'Start Daily Mix'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* TIER I: FOUNDATION — Architectural Specimen Cards */}
      <section aria-labelledby="tier-foundation">
        <div style={{ marginBottom: 16 }}>
          <h2 id="tier-foundation" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>
            {TIERS[0].numeral}. {TIERS[0].name}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 3 }}>
            {TIERS[0].caption}
          </p>
        </div>

        <div className="tier-foundation-grid">
          {foundationLessons.map((lesson) => {
            const avg = lessonMasteryAverage(storage.lessons[lesson.id]);
            return (
              <div
                key={lesson.id}
                className="interactive-card"
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--rule)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'transform 140ms ease, border-color 140ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'var(--bg-paper)',
                        border: '1px solid var(--rule)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LessonCraftIcon lessonId={lesson.id} size={22} />
                    </div>
                    <div>
                      <span className="tabular" style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                        Lesson {lesson.number}
                      </span>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                        {lesson.styleWorld}
                      </div>
                    </div>
                  </div>

                  {avg !== null && (
                    <span
                      className="tabular"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 5,
                        background: avg >= 85 ? 'var(--ok-tint)' : 'var(--bg-subtle)',
                        color: avg >= 85 ? 'var(--ok)' : 'var(--ink-secondary)',
                      }}
                    >
                      {avg}%
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>{lesson.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 4 }}>
                    {lesson.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'learn')}
                    style={{
                      flex: 1,
                      minHeight: 38,
                      borderRadius: 7,
                      border: '1px solid var(--rule)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    <BookOpen size={14} aria-hidden="true" />
                    <span>Explain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'practice')}
                    style={{
                      flex: 1,
                      minHeight: 38,
                      borderRadius: 7,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--rule-strong)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <Compass size={14} aria-hidden="true" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TIER II: BUILDING — Editorial Typographic Specimen Ledger (non-card layout!) */}
      <section aria-labelledby="tier-building">
        <div style={{ marginBottom: 14 }}>
          <h2 id="tier-building" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>
            {TIERS[1].numeral}. {TIERS[1].name}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 3 }}>
            {TIERS[1].caption}
          </p>
        </div>

        <div className="tier-building-ledger">
          {buildingLessons.map((lesson) => {
            const avg = lessonMasteryAverage(storage.lessons[lesson.id]);
            const specimen = BUILDING_SPECIMEN[lesson.id] ?? 'Aa';
            return (
              <div
                key={lesson.id}
                className="interactive-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '16px 10px',
                  borderBottom: '1px solid var(--rule)',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpenLesson(lesson.id, 'learn')}
                  style={{
                    flex: '1 1 320px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 54,
                      height: 44,
                      borderRadius: 6,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--rule)',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--font-editorial)',
                      fontSize: 20,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {specimen}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="tabular" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                        {lesson.number}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{lesson.title}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-secondary)', marginTop: 2 }}>
                      {lesson.subtitle} <span style={{ color: 'var(--ink-muted)' }}>({lesson.styleWorld})</span>
                    </div>
                  </div>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {avg !== null && (
                    <span
                      className="tabular"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 5,
                        background: avg >= 85 ? 'var(--ok-tint)' : 'var(--bg-subtle)',
                        color: avg >= 85 ? 'var(--ok)' : 'var(--ink-secondary)',
                      }}
                    >
                      {avg}%
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'learn')}
                    style={{
                      minHeight: 38,
                      padding: '0 12px',
                      borderRadius: 6,
                      border: '1px solid var(--rule)',
                      background: 'var(--bg-surface)',
                      fontSize: 12.5,
                      fontWeight: 500,
                    }}
                  >
                    Explain
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'practice')}
                    style={{
                      minHeight: 38,
                      padding: '0 14px',
                      borderRadius: 6,
                      background: 'var(--ink-primary)',
                      color: 'var(--bg-surface)',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Open Lab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TIER III: CHALLENGE — Precision Hairline Matrix */}
      <section aria-labelledby="tier-challenge">
        <div style={{ marginBottom: 16 }}>
          <h2 id="tier-challenge" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>
            {TIERS[2].numeral}. {TIERS[2].name}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 3 }}>
            {TIERS[2].caption}
          </p>
        </div>

        <div className="tier-challenge-grid">
          {challengeLessons.map((lesson) => {
            const avg = lessonMasteryAverage(storage.lessons[lesson.id]);
            return (
              <div
                key={lesson.id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LessonCraftIcon lessonId={lesson.id} size={24} />
                    <div>
                      <div className="tabular" style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                        Lab {lesson.number}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                        {lesson.styleWorld}
                      </div>
                    </div>
                  </div>
                  {avg !== null && (
                    <span
                      className="tabular"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 7px',
                        borderRadius: 5,
                        background: avg >= 85 ? 'var(--ok-tint)' : 'var(--bg-subtle)',
                        color: avg >= 85 ? 'var(--ok)' : 'var(--ink-secondary)',
                      }}
                    >
                      {avg}%
                    </span>
                  )}
                </div>

                {/* Small authentic craft preview strip per challenge discipline */}
                {lesson.id === '10-perceptual-color' && (
                  <div
                    aria-hidden="true"
                    style={{
                      height: 16,
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #b8941e, #157347, #1d4ed8, #7c3aed)',
                    }}
                  />
                )}
                {lesson.id === '12-image-framing' && (
                  <div
                    style={{
                      height: 44,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid var(--rule)',
                    }}
                  >
                    <img
                      src={STILL_LIFE_PHOTOS.gallery}
                      alt=""
                      width={260}
                      height={44}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.25 }}>{lesson.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-secondary)', marginTop: 4 }}>
                    {lesson.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'learn')}
                    style={{
                      flex: 1,
                      minHeight: 38,
                      borderRadius: 6,
                      border: '1px solid var(--rule)',
                      fontSize: 12.5,
                      fontWeight: 500,
                    }}
                  >
                    Explain
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id, 'practice')}
                    style={{
                      flex: 1,
                      minHeight: 38,
                      borderRadius: 6,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--rule-strong)',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Open Lab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
