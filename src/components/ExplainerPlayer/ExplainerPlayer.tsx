import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { LessonDefinition } from '../../engine/types';
import { FoundationScene } from './scenes/FoundationScenes';
import { BuildingScene } from './scenes/BuildingScenes';
import { ChallengeScene } from './scenes/ChallengeScenes';

interface ExplainerPlayerProps {
  lesson: LessonDefinition;
}

const DURATION_MS = 7200;

export const ExplainerPlayer: React.FC<ExplainerPlayerProps> = ({ lesson }) => {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setProgress(0);
    setPlaying(true);
    lastTimeRef.current = null;
  }, [lesson.id]);

  useEffect(() => {
    if (!playing || lesson.videoSrc) {
      lastTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setProgress((prev) => {
        const next = prev + dt / DURATION_MS;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, lesson.videoSrc]);

  const handleTogglePlay = () => {
    if (progress >= 1) {
      setProgress(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handleReplay = () => {
    setProgress(0);
    setPlaying(true);
  };

  const phaseLabel =
    progress < 0.34 ? '01 Flaw' : progress < 0.66 ? '02 Diagnosis' : '03 Fix';
  const seconds = (progress * (DURATION_MS / 1000)).toFixed(1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--rule)',
        boxShadow: 'var(--shadow-artboard)',
      }}
    >
      {/* Visual Viewport */}
      <div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%', background: '#FAF9F5' }}>
        {lesson.videoSrc ? (
          <video
            src={lesson.videoSrc}
            controls
            playsInline
            autoPlay
            muted
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : lesson.tier === 'foundation' ? (
          <FoundationScene lessonId={lesson.id} t={progress} />
        ) : lesson.tier === 'building' ? (
          <BuildingScene lessonId={lesson.id} t={progress} />
        ) : (
          <ChallengeScene lessonId={lesson.id} t={progress} />
        )}

        {/* Phase Pill */}
        {!lesson.videoSrc && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 11px',
              borderRadius: 999,
              background: 'rgba(20, 20, 19, 0.84)',
              color: '#F7F6F2',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <span>{phaseLabel}</span>
            <span className="tabular" style={{ opacity: 0.72 }}>
              {seconds}s / 7.2s
            </span>
          </div>
        )}
      </div>

      {/* Scrub, Playback & Quick Phase Step Controls */}
      {!lesson.videoSrc && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--rule)',
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
            }}
          >
            <button
              type="button"
              aria-label={playing ? 'Pause explainer' : 'Play explainer'}
              onClick={handleTogglePlay}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: '1px solid var(--rule-strong)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>

            <input
              type="range"
              aria-label="Scrub explainer timeline"
              className="studio-slider"
              min={0}
              max={1}
              step={0.005}
              value={progress}
              onChange={(e) => {
                setPlaying(false);
                setProgress(parseFloat(e.target.value));
              }}
            />

            <button
              type="button"
              aria-label="Replay explainer"
              onClick={handleReplay}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: '1px solid var(--rule)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: 'var(--ink-secondary)',
              }}
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>

          <div
            role="group"
            aria-label="Jump to explainer phase"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--rule)',
            }}
          >
            {[
              { label: '01 Flaw', active: progress < 0.34, jump: 0.14 },
              { label: '02 Diagnosis', active: progress >= 0.34 && progress < 0.66, jump: 0.5 },
              { label: '03 Fix', active: progress >= 0.66, jump: 0.85 },
            ].map((step, idx) => (
              <button
                key={step.label}
                type="button"
                aria-pressed={step.active}
                onClick={() => {
                  setPlaying(false);
                  setProgress(step.jump);
                }}
                style={{
                  minHeight: 38,
                  fontSize: 12,
                  fontWeight: step.active ? 600 : 500,
                  color: step.active ? 'var(--accent)' : 'var(--ink-secondary)',
                  background: step.active ? 'var(--accent-tint)' : 'transparent',
                  borderLeft: idx === 0 ? 'none' : '1px solid var(--rule)',
                }}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
