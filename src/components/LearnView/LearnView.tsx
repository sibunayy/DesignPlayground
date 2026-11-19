import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LessonDefinition } from '../../engine/types';
import { ExplainerPlayer } from '../ExplainerPlayer/ExplainerPlayer';

interface LearnViewProps {
  lesson: LessonDefinition;
  onStartPractice: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ lesson, onStartPractice }) => {
  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 840,
        margin: '0 auto',
        padding: '28px max(20px, var(--safe-right)) max(44px, var(--safe-bottom)) max(20px, var(--safe-left))',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Editorial Header */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          className="tabular"
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--ink-muted)',
          }}
        >
          Lesson {lesson.number} · {lesson.tier}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.6vw, 38px)',
            fontWeight: 500,
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
          }}
        >
          {lesson.title}
        </h1>
        <p style={{ fontSize: 15.5, color: 'var(--ink-secondary)' }}>{lesson.subtitle}</p>
      </header>

      {/* Under-10s Vector Motion Explainer */}
      <ExplainerPlayer lesson={lesson} />

      {/* Concise Editorial Explanation + Rule of Thumb */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule)',
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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            <BookOpen size={13} strokeWidth={2} />
            <span>Studio Rule</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{lesson.ruleOfThumb}</p>
        </aside>
      </section>

      {/* Primary Practice CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: 12,
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
            gap: 10,
            minHeight: 48,
            padding: '0 24px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontSize: 15,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(217, 69, 38, 0.22)',
          }}
        >
          <span>Practice Interactive Lab</span>
          <ArrowRight size={17} strokeWidth={2} />
        </button>
      </div>
    </main>
  );
};
