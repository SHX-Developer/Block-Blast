import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEMES, THEME_ORDER, ThemeId } from '../themes/themes';
import { formatScore } from '../utils/scoringUtils';

interface MainMenuProps {
  bestScore: number;
  hasActiveGame: boolean;
  onPlay: () => void;
  onNewGame: () => void;
}

export function MainMenu({ bestScore, hasActiveGame, onPlay, onNewGame }: MainMenuProps) {
  const { themeId, setThemeId } = useTheme();

  return (
    <div className="menu">
      <div className="menu-inner">
        <div className="menu-header">
          <div className="menu-logo">
            <div className="menu-logo__grid">
              <span style={{ background: THEMES[themeId].swatches[0] }} />
              <span style={{ background: THEMES[themeId].swatches[1] }} />
              <span style={{ background: THEMES[themeId].swatches[2] }} />
              <span style={{ background: THEMES[themeId].swatches[3] }} />
            </div>
          </div>
          <h1 className="menu-title">Block Blast</h1>
          <p className="menu-subtitle">Drop · Clear · Combo</p>
        </div>

        <div className="menu-best">
          <span className="menu-best__label">BEST SCORE</span>
          <span className="menu-best__value">{formatScore(bestScore)}</span>
        </div>

        <div className="menu-section">
          <span className="menu-section__title">Choose your style</span>
          <div className="theme-picker">
            {THEME_ORDER.map((id) => (
              <ThemeCard
                key={id}
                id={id}
                active={themeId === id}
                onSelect={() => setThemeId(id)}
              />
            ))}
          </div>
        </div>

        <div className="menu-actions">
          {hasActiveGame ? (
            <>
              <button className="menu-btn menu-btn--primary" onClick={onPlay}>
                Resume
              </button>
              <button className="menu-btn menu-btn--ghost" onClick={onNewGame}>
                New Game
              </button>
            </>
          ) : (
            <button className="menu-btn menu-btn--primary" onClick={onPlay}>
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  id: ThemeId;
  active: boolean;
  onSelect: () => void;
}

function ThemeCard({ id, active, onSelect }: ThemeCardProps) {
  const theme = THEMES[id];
  return (
    <button
      type="button"
      className={`theme-card theme-card--${id}${active ? ' theme-card--active' : ''}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <div className="theme-card__preview">
        <div className="theme-card__board">
          {theme.swatches.slice(0, 6).map((c, i) => (
            <span key={i} style={{ background: c }} className="theme-card__chip" />
          ))}
        </div>
      </div>
      <div className="theme-card__info">
        <span className="theme-card__name">{theme.name}</span>
        <span className="theme-card__tagline">{theme.tagline}</span>
      </div>
      {active && <div className="theme-card__check" aria-hidden>✓</div>}
    </button>
  );
}
