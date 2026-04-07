import React from 'react';
import { useBlockBlastGame } from './hooks/useBlockBlastGame';
import { BoardGrid } from './components/Board';
import { ShapeTray } from './components/ShapeTray';
import { ScorePanel } from './components/ScorePanel';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const game = useBlockBlastGame();

  const draggedShape =
    game.draggedShapeIndex !== null
      ? (game.shapes[game.draggedShapeIndex] ?? null)
      : null;

  return (
    <div className="app">
      {/* ── Score row ── */}
      <ScorePanel score={game.score} bestScore={game.bestScore} combo={game.combo} />

      {/* ── Board ── */}
      <div className="board-wrapper">
        <BoardGrid
          board={game.board}
          preview={game.preview}
          draggedShape={draggedShape}
          clearingRows={game.clearingRows}
          clearingCols={game.clearingCols}
          boardRef={game.boardRef as React.RefObject<HTMLDivElement>}
        />
      </div>

      {/* ── Shape tray ── */}
      <ShapeTray
        shapes={game.shapes}
        draggedShapeIndex={game.draggedShapeIndex}
        onShapePointerDown={game.handleShapePointerDown}
      />

      {/* ── Floating drag element (DOM-managed for perf) ── */}
      <div
        ref={game.floatingRef as React.RefObject<HTMLDivElement>}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1000,
          display: 'none',
        }}
      />

      {/* ── Game-over overlay ── */}
      <GameOverModal
        score={game.score}
        bestScore={game.bestScore}
        onRestart={game.restart}
        visible={game.gameOver}
      />
    </div>
  );
}
