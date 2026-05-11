import React, { useState } from 'react';
import { useBlockBlastGame } from './hooks/useBlockBlastGame';
import { BoardGrid } from './components/Board';
import { ShapeTray } from './components/ShapeTray';
import { ScorePanel } from './components/ScorePanel';
import { GameOverModal } from './components/GameOverModal';
import { MainMenu } from './components/MainMenu';
import { ScorePopups } from './components/ScorePopups';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function GameApp() {
  const { themeId } = useTheme();
  const [view, setView] = useState<'menu' | 'game'>('menu');
  // True once the player has taken any meaningful action since last restart.
  const [hasPlayed, setHasPlayed] = useState(false);

  const game = useBlockBlastGame(themeId);

  const hasActiveGame = hasPlayed && !game.gameOver;

  const handlePlay = () => {
    setView('game');
    setHasPlayed(true);
  };

  const handleNewGame = () => {
    game.restart();
    setView('game');
    setHasPlayed(true);
  };

  const handleMenu = () => {
    setView('menu');
  };

  const draggedShape =
    game.draggedShapeIndex !== null
      ? (game.shapes[game.draggedShapeIndex] ?? null)
      : null;

  return (
    <div className="app">
      {view === 'menu' ? (
        <MainMenu
          bestScore={game.bestScore}
          hasActiveGame={hasActiveGame}
          onPlay={handlePlay}
          onNewGame={handleNewGame}
        />
      ) : (
        <>
          {/* ── Top bar (score + menu button) ── */}
          <ScorePanel
            score={game.score}
            bestScore={game.bestScore}
            combo={game.combo}
            onMenu={handleMenu}
          />

          {/* ── Board ── */}
          <div className="board-wrapper">
            <BoardGrid
              board={game.board}
              preview={game.preview}
              draggedShape={draggedShape}
              clearingRows={game.clearingRows}
              clearingCols={game.clearingCols}
              placedCells={game.placedCells}
              themeId={themeId}
              boardRef={game.boardRef as React.RefObject<HTMLDivElement>}
            />
          </div>

          {/* ── Shape tray ── */}
          <ShapeTray
            shapes={game.shapes}
            draggedShapeIndex={game.draggedShapeIndex}
            themeId={themeId}
            genToken={game.trayGenToken}
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
              willChange: 'transform',
            }}
          />

          {/* ── Floating "+N" score popups ── */}
          <ScorePopups popups={game.scorePopups} />

          {/* ── Game-over overlay ── */}
          <GameOverModal
            score={game.score}
            bestScore={game.bestScore}
            onRestart={() => {
              game.restart();
              setHasPlayed(true);
            }}
            onMenu={handleMenu}
            visible={game.gameOver}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GameApp />
    </ThemeProvider>
  );
}
