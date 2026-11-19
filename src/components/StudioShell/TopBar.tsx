import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  Compass,
  Hash,
  Moon,
  PanelLeft,
  PanelRight,
  Shuffle,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { LessonDefinition } from '../../engine/types';
import { normalizeSeedCode } from '../../engine/prng';
import { LessonCraftIcon, SightlineEmblem } from '../Icons/CraftIcons';

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSeedOpen(false);
        setPrefsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      {/* Left: Back + Custom Craft Icon + Lesson Title */}
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
            padding: '0 10px 0 6px',
            borderRadius: 8,
            color: 'var(--ink-secondary)',
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>Index</span>
        </button>

        {lesson ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <span style={{ color: 'var(--ink-primary)', flexShrink: 0, display: 'inline-flex' }}>
              <LessonCraftIcon lessonId={lesson.id} size={20} />
            </span>
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
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SightlineEmblem size={22} />
          </div>
        )}

        {dailyBadge && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'var(--bg-subtle)',
              color: 'var(--ink-primary)',
            }}
          >
            {dailyBadge}
          </span>
        )}
      </div>

      {/* Center: Learn / Practice Hardware Switch (full-width row 2 on <640px mobile) */}
      {mode && onChangeMode && (
        <div
          role="tablist"
          aria-label="Studio mode"
          className="topbar-mode-tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'learn'}
            onClick={() => onChangeMode('learn')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 34,
              padding: '0 13px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: mode === 'learn' ? 600 : 500,
              background: mode === 'learn' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'learn' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
              boxShadow: mode === 'learn' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <BookOpen size={14} aria-hidden="true" />
            <span>Learn</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'practice'}
            onClick={() => onChangeMode('practice')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 34,
              padding: '0 13px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: mode === 'practice' ? 600 : 500,
              background: mode === 'practice' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'practice' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
              boxShadow: mode === 'practice' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Compass size={14} aria-hidden="true" />
            <span>Practice</span>
          </button>
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
            aria-expanded={seedOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 38,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid var(--rule-strong)',
              background: 'var(--bg-surface)',
              fontSize: 12.5,
              color: 'var(--ink-secondary)',
            }}
            className="tabular"
          >
            <Hash size={12} strokeWidth={2} aria-hidden="true" />
            <span>{seed}</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Studio preferences"
          aria-expanded={prefsOpen}
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
            border: '1px solid var(--rule-strong)',
            background: 'var(--bg-surface)',
            color: 'var(--ink-secondary)',
          }}
        >
          <SlidersHorizontal size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Seed Popover */}
        {seedOpen && seed && (
          <div
            role="dialog"
            aria-label="Scenario seed code"
            style={{
              position: 'absolute',
              top: 48,
              right: 44,
              width: 244,
              padding: 14,
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--rule-strong)',
              boxShadow: 'var(--shadow-float)',
              zIndex: 60,
            }}
          >
            <label
              htmlFor="seed-code-input"
              style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}
            >
              Scenario Seed Code
            </label>
            <form onSubmit={commitSeed} style={{ display: 'flex', gap: 6 }}>
              <input
                id="seed-code-input"
                type="text"
                maxLength={4}
                value={seedDraft}
                onChange={(e) => setSeedDraft(e.target.value.toUpperCase())}
                className="tabular"
                style={{
                  flex: 1,
                  minHeight: 38,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: '1px solid var(--rule-strong)',
                  background: 'var(--bg-paper)',
                  fontSize: 13.5,
                }}
              />
              <button
                type="submit"
                style={{
                  minHeight: 38,
                  padding: '0 12px',
                  borderRadius: 6,
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
                  minHeight: 36,
                  borderRadius: 6,
                  border: '1px solid var(--rule)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  color: 'var(--ink-secondary)',
                }}
              >
                <Shuffle size={13} aria-hidden="true" />
                <span>Generate Random Brief</span>
              </button>
            )}
          </div>
        )}

        {/* Preferences Popover */}
        {prefsOpen && (
          <div
            role="dialog"
            aria-label="Studio ergonomics"
            style={{
              position: 'absolute',
              top: 48,
              right: 0,
              width: 244,
              padding: 14,
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--rule-strong)',
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
                minHeight: 40,
                padding: '0 10px',
                borderRadius: 6,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                fontSize: 13,
              }}
            >
              <span>{theme === 'dark' ? 'Darkroom (#14161A)' : 'Studio Paper'}</span>
              {theme === 'dark' ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={onToggleRailSide}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 40,
                padding: '0 10px',
                borderRadius: 6,
                background: 'var(--bg-paper)',
                border: '1px solid var(--rule)',
                fontSize: 13,
              }}
            >
              <span>Rail: {railSide === 'right' ? 'Right Hand' : 'Left Hand'}</span>
              {railSide === 'right' ? (
                <PanelRight size={15} aria-hidden="true" />
              ) : (
                <PanelLeft size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
