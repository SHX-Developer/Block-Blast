import React from 'react';
import { formatScore } from '../utils/scoringUtils';

interface ScorePanelProps {
  score: number;
  bestScore: number;
  combo: number;
}

export const ScorePanel = React.memo(function ScorePanel({
  score,
  bestScore,
  combo,
}: ScorePanelProps) {
  return (
    <div className="score-panel">
      <div className="score-block score-block--main">
        <span className="score-label">SCORE</span>
        <span className="score-value">{formatScore(score)}</span>
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
