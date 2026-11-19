import React from 'react';
import { BookOpen, Compass, Palette } from 'lucide-react';
import { LessonDefinition } from '../../engine/types';
import { ExplainerPlayer } from '../ExplainerPlayer/ExplainerPlayer';
import { LessonCraftIcon } from '../Icons/CraftIcons';

interface LearnViewProps {
  lesson: LessonDefinition;
  onStartPractice: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ lesson, onStartPractice }) => {
  return (
    <main
      id="main-workspace"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 860,
        margin: '0 auto',
        padding:
          '28px max(20px, var(--safe-right)) max(44px, var(--safe-bottom)) max(20px, var(--safe-left))',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Editorial Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="tabular" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-muted)' }}>
              Lesson {lesson.number}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              <Palette size={13} aria-hidden="true" />
              <span>{lesson.styleWorld}</span>
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
            }}
          >
            {lesson.title}
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--ink-secondary)' }}>{lesson.subtitle}</p>
        </div>

        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <LessonCraftIcon lessonId={lesson.id} size={28} />
        </div>
      </header>

      {/* Under-10s Vector Motion Explainer */}
      <ExplainerPlayer lesson={lesson} />

      {/* Concise Editorial Explanation + Rule of Thumb */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <div className="editorial-prose" style={{ fontSize: 16, lineHeight: 1.62, color: 'var(--ink-primary)' }}>
          {lesson.summary}
        </div>

        <aside
          style={{
            padding: 18,
            borderRadius: 10,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule-strong)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            <BookOpen size={14} strokeWidth={2} aria-hidden="true" />
            <span>Studio Rule</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{lesson.ruleOfThumb}</p>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{lesson.styleRef}</p>
        </aside>
      </section>

      {/* Primary Practice CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: 14,
          borderTop: '1px solid var(--rule)',
        }}
      >
        <button
          type="button"
          onClick={onStartPractice}
          className="touch-target"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            minHeight: 48,
            padding: '0 22px',
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontSize: 15,
            fontWeight: 600,
            boxShadow: '0 3px 0 rgba(17, 19, 23, 0.22)',
          }}
        >
          <Compass size={17} strokeWidth={2} aria-hidden="true" />
          <span>Practice Interactive Lab</span>
        </button>
      </div>
    </main>
  );
};
