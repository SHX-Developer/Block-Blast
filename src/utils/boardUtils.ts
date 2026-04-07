import { Shape, SHAPES, weightedRandom } from '../data/shapes';

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

/** Max lines a shape can clear from any valid position on the board. */
function shapeClearScore(board: Board, shape: Shape): number {
  let best = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, shape, r, c)) {
        const temp = placeOnBoard(board, shape, r, c);
        const { rows, cols } = findFullLines(temp);
        const score = rows.length + cols.length;
        if (score > best) best = score;
        if (best >= 4) return best; // early exit — can't do better than clearing 4 rows+cols
      }
    }
  }
  return best;
}

/** Pick a random item from a pool weighted by a score function. */
function weightedPick<T>(pool: T[], getWeight: (item: T) => number): T {
  const total = pool.reduce((s, x) => s + getWeight(x), 0);
  let rand = Math.random() * total;
  for (const item of pool) {
    rand -= getWeight(item);
    if (rand <= 0) return item;
  }
  return pool[pool.length - 1];
}

/**
 * Generate 3 shapes with smart bias:
 * - On a sparse board: mostly random (game is just starting)
 * - On a medium board: at least 1 shape can clear a line
 * - On a full board: 1–2 shapes that can clear lines
 * Always guarantees at least one shape is placeable.
 */
export function generateNextShapes(board: Board): Shape[] {
  const filledCells = board.flat().filter(c => c !== '').length;
  const fillRatio = filledCells / (BOARD_SIZE * BOARD_SIZE);

  // How many of the 3 shapes should be "line-clearing capable"
  const smartTarget = fillRatio > 0.55 ? 2 : fillRatio > 0.2 ? 1 : 0;

  // Score all shapes once
  const scored = SHAPES.map(s => ({
    shape: s,
    clearScore: smartTarget > 0 ? shapeClearScore(board, s) : 0,
    placeable: canPlaceAnywhere(board, s),
  }));

  const clearingPool = scored.filter(s => s.clearScore > 0);
  const placeablePool = scored.filter(s => s.placeable);

  const result: Shape[] = [];

  // Add smart (line-clearing) shapes
  const smartCount = Math.min(smartTarget, clearingPool.length);
  for (let i = 0; i < smartCount; i++) {
    const picked = weightedPick(clearingPool, x => x.clearScore * x.shape.weight);
    result.push(picked.shape);
  }

  // Fill remaining slots with placeable random shapes
  const MAX_ATTEMPTS = 60;
  let attempts = 0;
  while (result.length < 3 && attempts < MAX_ATTEMPTS) {
    attempts++;
    const shape = weightedRandom();
    if (canPlaceAnywhere(board, shape)) result.push(shape);
  }

  // Last resort: use placeable pool or anything
  while (result.length < 3) {
    if (placeablePool.length > 0) {
      result.push(weightedPick(placeablePool, x => x.shape.weight).shape);
    } else {
      result.push(weightedRandom());
    }
  }

  // Shuffle so smart shape isn't always in a fixed slot
  return result.sort(() => Math.random() - 0.5);
}
