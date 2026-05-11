import React from 'react';
import { ScorePopup } from '../hooks/useBlockBlastGame';

interface Props {
  popups: ScorePopup[];
}

export const ScorePopups = React.memo(function ScorePopups({ popups }: Props) {
  return (
    <>
      {popups.map((p) => (
        <div
          key={p.id}
          className={`score-popup${p.big ? ' score-popup--big' : ''}`}
          style={{ left: p.x, top: p.y }}
        >
          +{p.points}
        </div>
      ))}
    </>
  );
});
