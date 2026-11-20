import React from 'react';
import { MODES } from '../content/modes';
import { ModeId, ThemeId } from '../types';
import { DpIcon } from './Icons';

interface HeaderProps {
  modeId: ModeId | null;
  theme: ThemeId;
  panelOpen: boolean;
  onBack: () => void;
  onSelectMode: (id: ModeId) => void;
  onToggleTheme: () => void;
  onTogglePanel: () => void;
}

/** On a narrow screen the tabs scroll. Keep the current tab in view. */
const scrollIntoTabs = (el: HTMLButtonElement | null) => {
  el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
};

export const Header: React.FC<HeaderProps> = ({
  modeId,
  theme,
  panelOpen,
  onBack,
  onSelectMode,
  onToggleTheme,
  onTogglePanel,
}) => (
  <header className="dp-header">
    <div className="dp-title-group">
      <button type="button" className="dp-chip-btn" onClick={onBack} aria-label={modeId ? 'All modes' : 'Back to Sightline'}>
        <DpIcon name="back" />
      </button>
      <span className="dp-app-name">Design Playground</span>
    </div>
    <div className="dp-header-actions">
      {modeId && (
        <nav aria-label="Modes" className="dp-mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="dp-mode-tab"
              aria-current={m.id === modeId ? 'page' : undefined}
              ref={m.id === modeId ? scrollIntoTabs : undefined}
              onClick={() => onSelectMode(m.id)}
            >
              {m.name}
            </button>
          ))}
        </nav>
      )}
      {modeId && (
        <button type="button" className="dp-toggle" aria-pressed={panelOpen} aria-label="Lesson" title="Lesson" onClick={onTogglePanel}>
          <span className="dp-toggle-chip">
            <DpIcon name="book" />
          </span>
        </button>
      )}
      <button
        type="button"
        className="dp-chip-btn"
        aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
        onClick={onToggleTheme}
      >
        <DpIcon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </div>
  </header>
);
