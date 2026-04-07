import { Shape, weightedRandom } from '../data/shapes';

export const BOARD_SIZE = 8;

export type Board = string[][]; // '' = empty, color string = occupied

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));
}

export function canPlace(board: Board, shape: Shape, row: number, col: number): boolean {
  return shape.cells.every(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === '';
  });
}

export function placeOnBoard(board: Board, shape: Shape, row: number, col: number): Board {
  const next = board.map(r => [...r]);
  shape.cells.forEach(([dr, dc]) => {
    next[row + dr][col + dc] = shape.color;
  });
  return next;
}

export function findFullLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(cell => cell !== '')) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every(row => row[c] !== '')) cols.push(c);
  }

  return { rows, cols };
}

export function clearLines(board: Board, rows: number[], cols: number[]): Board {
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  return board.map((row, r) =>
    row.map((cell, c) => (rowSet.has(r) || colSet.has(c) ? '' : cell))
  );
}

export function canPlaceAnywhere(board: Board, shape: Shape): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, shape, r, c)) return true;
    }
  }
  return false;
}

export function hasAnyValidPlacement(board: Board, shapes: Shape[]): boolean {
  return shapes.some(s => canPlaceAnywhere(board, s));
}

/** Near-full threshold: rows/cols with this many or more filled cells get highlighted */
export const NEAR_FULL_THRESHOLD = 6;

export function getNearFullLines(board: Board): { rows: Set<number>; cols: Set<number> } {
  const rows = new Set<number>();
  const cols = new Set<number>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    const filled = board[r].filter(c => c !== '').length;
    if (filled >= NEAR_FULL_THRESHOLD && filled < BOARD_SIZE) rows.add(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    const filled = board.filter(row => row[c] !== '').length;
    if (filled >= NEAR_FULL_THRESHOLD && filled < BOARD_SIZE) cols.add(c);
  }

  return { rows, cols };
}

/**
 * Generate 3 random shapes, trying to ensure at least one is placeable on the board.
 */
export function generateNextShapes(board: Board): Shape[] {
  const MAX_ATTEMPTS = 40;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const set: Shape[] = [weightedRandom(), weightedRandom(), weightedRandom()];
    if (set.some(s => canPlaceAnywhere(board, s))) return set;
  }

  // Board is extremely full; return small pieces and let game-over handle it
  return [weightedRandom(), weightedRandom(), weightedRandom()];
}
