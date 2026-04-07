import React, { useEffect, useState } from 'react';
import { formatScore } from '../utils/scoringUtils';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  visible: boolean;
}

export function GameOverModal({ score, bestScore, onRestart, visible }: GameOverModalProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShown(true), 80);
      return () => clearTimeout(t);
    } else {
      setShown(false);
    }
  }, [visible]);

  if (!visible) return null;

  const isNewBest = score >= bestScore && score > 0;

  return (
    <div className={`modal-overlay${shown ? ' modal-overlay--in' : ''}`}>
      <div className={`modal${shown ? ' modal--in' : ''}`}>
        <div className="modal-icon">💥</div>
        <h2 className="modal-title">Game Over</h2>

        {isNewBest && <div className="modal-badge">New Best!</div>}

        <div className="modal-scores">
          <div className="modal-score-row">
            <span className="modal-score-label">Your Score</span>
            <span className="modal-score-val">{formatScore(score)}</span>
          </div>
          <div className="modal-divider" />
          <div className="modal-score-row">
            <span className="modal-score-label">Best</span>
            <span className="modal-score-val modal-score-val--best">{formatScore(bestScore)}</span>
          </div>
        </div>

        <button className="modal-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}
