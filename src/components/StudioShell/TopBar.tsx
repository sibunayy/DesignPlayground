import React, { useState } from 'react';
import {
  ChevronLeft,
  Hash,
  Moon,
  PanelLeft,
  PanelRight,
  Shuffle,
  Sliders,
  Sun,
} from 'lucide-react';
import { LessonDefinition } from '../../engine/types';
import { normalizeSeedCode } from '../../engine/prng';

interface TopBarProps {
  lesson?: LessonDefinition;
  mode?: 'learn' | 'practice';
  onChangeMode?: (mode: 'learn' | 'practice') => void;
  seed?: string;
  onChangeSeed?: (nextSeed: string) => void;
  onRandomSeed?: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  railSide: 'right' | 'left';
  onToggleRailSide: () => void;
  dailyBadge?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  lesson,
  mode,
  onChangeMode,
  seed,
  onChangeSeed,
  onRandomSeed,
  onBack,
  theme,
  onToggleTheme,
  railSide,
  onToggleRailSide,
  dailyBadge,
}) => {
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedDraft, setSeedDraft] = useState(seed ?? '4F9A');
  const [prefsOpen, setPrefsOpen] = useState(false);

  const commitSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (onChangeSeed) {
      const normalized = normalizeSeedCode(seedDraft);
      setSeedDraft(normalized);
      onChangeSeed(normalized);
    }
    setSeedOpen(false);
  };

  return (
    <header className="studio-topbar">
      {/* Left: Back + Lesson Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to curriculum index"
          className="touch-target"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '0 8px 0 4px',
            borderRadius: 8,
            color: 'var(--ink-secondary)',
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
          <span>Index</span>
        </button>

        {lesson && (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <span className="tabular" style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
              {lesson.number}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lesson.shortTitle}
            </span>
          </div>
        )}

        {dailyBadge && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--bg-subtle)',
              color: 'var(--ink-primary)',
            }}
          >
            {dailyBadge}
          </span>
        )}
      </div>

      {/* Center: Learn / Practice Segmented Switch */}
      {mode && onChangeMode && (
        <div
          role="tablist"
          aria-label="Studio mode"
          style={{
            display: 'inline-flex',
            padding: 3,
            borderRadius: 999,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--rule)',
          }}
        >
          {(['learn', 'practice'] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeMode(m)}
                style={{
                  minHeight: 32,
                  padding: '0 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  background: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: Seed Pill + Studio Preferences */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
        {seed && (
          <button
            type="button"
            onClick={() => {
              setSeedDraft(seed);
              setSeedOpen((s) => !s);
              setPrefsOpen(false);
            }}
            aria-label={`Brief seed ${seed}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 36,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid var(--rule)',
              background: 'var(--bg-surface)',
              fontSize: 12.5,
              color: 'var(--ink-secondary)',
            }}
            className="tabular"
          >
            <Hash size={12} strokeWidth={2} />
            <span>{seed}</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Studio preferences"
          onClick={() => {
            setPrefsOpen((p) => !p);
            setSeedOpen(false);
          }}
          className="touch-target"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 38,
            height: 38,
            borderRadius: 8,
            border: '1px solid var(--rule)',
            background: 'var(--bg-surface)',
            color: 'var(--ink-secondary)',
          }}
        >
          <Sliders size={15} strokeWidth={1.75} />
        </button>

        {/* Seed Popover */}
        {seedOpen && seed && (
          <div
            style={{
              position: 'absolute',
              top: 46,
              right: 44,
              width: 240,
              padding: 14,
              borderRadius: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--rule)',
              boxShadow: 'var(--shadow-float)',
              zIndex: 60,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Scenario Seed Code
            </div>
            <form onSubmit={commitSeed} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                maxLength={4}
                value={seedDraft}
                onChange={(e) => setSeedDraft(e.target.value.toUpperCase())}
                className="tabular"
                style={{
                  flex: 1,
                  minHeight: 36,
                  padding: '0 10px',
                  borderRadius: 8,
                  border: '1px solid var(--rule-strong)',
                  background: 'var(--bg-paper)',
                  fontSize: 13.5,
                }}
              />
              <button
                type="submit"
                style={{
                  minHeight: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  background: 'var(--ink-primary)',
                  color: 'var(--bg-surface)',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Load
              </button>
            </form>
            {onRandomSeed && (
              <button
                type="button"
                onClick={() => {
                  onRandomSeed();
                  setSeedOpen(false);
                }}
                style={{
                  marginTop: 8,
                  width: '100%',
                  minHeight: 34,
                  borderRadius: 8,
                  border: '1px solid var(--rule)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  color: 'var(--ink-secondary)',
                }}
              >
                <Shuffle size={13} />
                <span>Generate Random Brief</span>
              </button>
            )}
          </div>
        )}

        {/* Preferences Popover */}
        {prefsOpen && (
          <div
            style={{
              position: 'absolute',
              top: 46,
              right: 0,
              width: 240,
              padding: 14,
              borderRadius: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--rule)',
              boxShadow: 'var(--shadow-float)',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>Studio Ergonomics</div>
            <button
              type="button"
              onClick={onToggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 38,
                padding: '0 10px',
                borderRadius: 8,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                fontSize: 13,
              }}
            >
              <span>{theme === 'dark' ? 'Darkroom (#161618)' : 'Archival Paper'}</span>
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <button
              type="button"
              onClick={onToggleRailSide}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 38,
                padding: '0 10px',
                borderRadius: 8,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                fontSize: 13,
              }}
            >
              <span>Rail: {railSide === 'right' ? 'Right Hand' : 'Left Hand'}</span>
              {railSide === 'right' ? <PanelRight size={15} /> : <PanelLeft size={15} />}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
