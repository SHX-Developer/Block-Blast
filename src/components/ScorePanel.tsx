import React from 'react';
import { formatScore } from '../utils/scoringUtils';

interface ScorePanelProps {
  score: number;
  bestScore: number;
  combo: number;
  onMenu: () => void;
}

export const ScorePanel = React.memo(function ScorePanel({
  score,
  bestScore,
  combo,
  onMenu,
}: ScorePanelProps) {
  return (
    <div className="score-panel">
      <button
        className="menu-icon-btn"
        onClick={onMenu}
        aria-label="Open menu"
        type="button"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="score-block score-block--main">
        <span className="score-label">SCORE</span>
        <span className="score-value" key={score}>
          {formatScore(score)}
        </span>
      </div>

      {combo > 1 && (
        <div className="combo-badge" key={combo}>
          <span className="combo-text">COMBO</span>
          <span className="combo-count">×{combo}</span>
        </div>
      )}

      <div className="score-block score-block--best">
        <span className="score-label">BEST</span>
        <span className="score-value score-value--best">{formatScore(bestScore)}</span>
      </div>
    </div>
  );
});
