import React, { useMemo } from 'react';
import { Board as BoardType, BOARD_SIZE } from '../utils/boardUtils';
import { Shape } from '../data/shapes';
import { PreviewState } from '../hooks/useBlockBlastGame';

interface BoardProps {
  board: BoardType;
  preview: PreviewState | null;
  draggedShape: Shape | null;
  clearingRows: number[];
  clearingCols: number[];
  boardRef: React.RefObject<HTMLDivElement>;
}

interface CellProps {
  row: number;
  col: number;
  color: string;
  isClearing: boolean;
  isPreview: boolean;
  previewValid: boolean;
  previewColor: string;
}

const BoardCell = React.memo(function BoardCell({
  row,
  col,
  color,
  isClearing,
  isPreview,
  previewValid,
  previewColor,
}: CellProps) {
  let className = 'bcell';
  if (color) {
    className += ' bcell--filled';
  } else if (isPreview) {
    className += previewValid ? ' bcell--prev-ok' : ' bcell--prev-bad';
  } else {
    className += ' bcell--empty';
  }
  if (isClearing) className += ' bcell--clearing';

  const style: React.CSSProperties & Record<string, string> = {};
  if (color) style['--cc'] = color;
  if (isPreview && !color) style['--pc'] = previewColor;

  return (
    <div
      className={className}
      style={style}
      data-row={row}
      data-col={col}
    />
  );
});

export const BoardGrid = React.memo(function BoardGrid({
  board,
  preview,
  draggedShape,
  clearingRows,
  clearingCols,
  boardRef,
}: BoardProps) {
  const clearRowSet = useMemo(() => new Set(clearingRows), [clearingRows]);
  const clearColSet = useMemo(() => new Set(clearingCols), [clearingCols]);

  // Build preview cell map: "row,col" -> isValid
  const previewCells = useMemo(() => {
    if (!preview || !draggedShape) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    draggedShape.cells.forEach(([dr, dc]) => {
      map.set(`${preview.row + dr},${preview.col + dc}`, preview.isValid);
    });
    return map;
  }, [preview, draggedShape]);

  const previewColor = draggedShape?.color ?? '#ffffff';

  const cells = useMemo(() => {
    const out: CellProps[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const key = `${r},${c}`;
        const pEntry = previewCells.get(key);
        out.push({
          row: r,
          col: c,
          color: board[r][c],
          isClearing: clearRowSet.has(r) || clearColSet.has(c),
          isPreview: pEntry !== undefined,
          previewValid: pEntry === true,
          previewColor,
        });
      }
    }
    return out;
  }, [board, previewCells, previewColor, clearRowSet, clearColSet]);

  return (
    <div className="board" ref={boardRef}>
      {cells.map(cell => (
        <BoardCell key={`${cell.row}-${cell.col}`} {...cell} />
      ))}
    </div>
  );
});
