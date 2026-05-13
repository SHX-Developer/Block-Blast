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

// ════════════════════════════════════════════════════════════════════
// SURVIVABILITY CORE
// ════════════════════════════════════════════════════════════════════

/** Place a shape and apply any resulting line clears. */
function placeAndClear(board: Board, shape: Shape, r: number, c: number): Board {
  const placed = placeOnBoard(board, shape, r, c);
  const { rows, cols } = findFullLines(placed);
  if (rows.length === 0 && cols.length === 0) return placed;
  return clearLines(placed, rows, cols);
}

interface SurviveBudget { ops: number; }

/**
 * Enumerate valid placement positions for a shape on a board.
 * Ordered to try line-clearing placements first (they free up space, so DFS
 * finds survivable continuations faster) and corner-leaning positions next.
 */
function enumeratePlacements(board: Board, shape: Shape): Array<{ r: number; c: number; clears: number }> {
  const out: Array<{ r: number; c: number; clears: number }> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!canPlace(board, shape, r, c)) continue;
      const test = placeOnBoard(board, shape, r, c);
      const { rows, cols } = findFullLines(test);
      out.push({ r, c, clears: rows.length + cols.length });
    }
  }
  out.sort((a, b) => b.clears - a.clears);
  return out;
}

/**
 * DFS: does there exist an ordering and a placement sequence for `shapes`
 * such that all of them can be placed on `board` (with line clears in between)?
 *
 * Early-exits on first success. Bounded by `budget.ops`. If we run out of
 * budget without proving survivability, treat as not survivable so the caller
 * regenerates the hand.
 */
function canSurviveShapes(
  board: Board,
  shapes: Shape[],
  budget: SurviveBudget
): boolean {
  if (shapes.length === 0) return true;
  if (budget.ops <= 0) return false;

  if (shapes.length === 1) {
    budget.ops -= BOARD_SIZE * BOARD_SIZE;
    return canPlaceAnywhere(board, shapes[0]);
  }

  // Sort shapes by descending cell count — placing the largest first prunes
  // bad branches faster (fewer positions fit, so DFS narrows quickly).
  const order = shapes
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.cells.length - a.s.cells.length);

  for (const { s, i } of order) {
    if (budget.ops <= 0) return false;
    const rest: Shape[] = [];
    for (let j = 0; j < shapes.length; j++) if (j !== i) rest.push(shapes[j]);

    const placements = enumeratePlacements(board, s);
    budget.ops -= BOARD_SIZE * BOARD_SIZE;

    if (placements.length === 0) continue;

    for (const p of placements) {
      budget.ops--;
      if (budget.ops <= 0) return false;
      const next = placeAndClear(board, s, p.r, p.c);
      if (canSurviveShapes(next, rest, budget)) return true;
    }
  }
  return false;
}

/**
 * Public: is this trio (or any subset) survivable from this board state?
 * Used by the generator to validate a candidate hand.
 */
export function isHandSurvivable(board: Board, shapes: Shape[], opsBudget = 250_000): boolean {
  return canSurviveShapes(board, shapes, { ops: opsBudget });
}

// ════════════════════════════════════════════════════════════════════
// SHAPE GENERATION
// ════════════════════════════════════════════════════════════════════

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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a single candidate trio with smart bias according to board fill.
 */
function buildCandidate(
  board: Board,
  fillRatio: number,
  forceSmall: boolean
): Shape[] {
  // How many of the 3 shapes should be "line-clearing capable"
  const smartTarget = fillRatio > 0.55 ? 2 : fillRatio > 0.25 ? 1 : 0;

  // Score all shapes once (cheap-ish — 8x8 × shapes)
  const scored = SHAPES.map(s => ({
    shape: s,
    clearScore: smartTarget > 0 ? shapeClearScore(board, s) : 0,
    placeable: canPlaceAnywhere(board, s),
  }));

  const clearingPool = scored.filter(s => s.clearScore > 0 && s.placeable);
  const placeablePool = scored.filter(s => s.placeable);

  // When we're forced to use small shapes (rescue mode), restrict to ≤ 3 cells.
  const smallPlaceable = placeablePool.filter(p => p.shape.cells.length <= 3);

  const result: Shape[] = [];

  if (!forceSmall) {
    const smartCount = Math.min(smartTarget, clearingPool.length);
    for (let i = 0; i < smartCount; i++) {
      const picked = weightedPick(clearingPool, x => x.clearScore * x.shape.weight);
      result.push(picked.shape);
    }

    // Fill remaining slots with placeable random shapes
    const MAX_ATTEMPTS = 40;
    let attempts = 0;
    while (result.length < 3 && attempts < MAX_ATTEMPTS) {
      attempts++;
      const shape = weightedRandom();
      if (canPlaceAnywhere(board, shape)) result.push(shape);
    }
  }

  // Rescue / fill: prefer small shapes when the board is tight
  while (result.length < 3) {
    const pool = forceSmall || fillRatio > 0.6
      ? (smallPlaceable.length > 0 ? smallPlaceable : placeablePool)
      : placeablePool;
    if (pool.length === 0) {
      result.push(weightedRandom());
    } else {
      result.push(weightedPick(pool, x => x.shape.weight).shape);
    }
  }

  return shuffle(result);
}

/**
 * Generate 3 shapes — guaranteed survivable when possible.
 *
 * Algorithm:
 *   1. Build candidate trio with smart bias (line-clearing shapes when board is full).
 *   2. Verify the trio is *survivable*: there exists SOME ordering and SOME
 *      placement sequence (with line clears) where all 3 fit. The player must
 *      figure out that sequence themselves — we just guarantee one exists.
 *   3. If not survivable, regenerate. Repeat up to N tries.
 *   4. Escalate to "small shapes only" mode if normal attempts keep failing.
 *   5. Last resort: brute-force search through small shapes for any survivable trio.
 *
 * If no survivable hand exists for the current board, the game is genuinely
 * lost — we return any 3 placeable small shapes and the existing game-over
 * detection kicks in.
 */
export function generateNextShapes(board: Board): Shape[] {
  const filledCells = board.flat().filter(c => c !== '').length;
  const fillRatio = filledCells / (BOARD_SIZE * BOARD_SIZE);

  // Phase 1: normal candidate generation with survivability check
  const NORMAL_ATTEMPTS = 14;
  for (let attempt = 0; attempt < NORMAL_ATTEMPTS; attempt++) {
    const candidate = buildCandidate(board, fillRatio, false);
    if (isHandSurvivable(board, candidate)) {
      return candidate;
    }
  }

  // Phase 2: escalate — try small shapes only (much more likely to survive)
  const RESCUE_ATTEMPTS = 10;
  for (let attempt = 0; attempt < RESCUE_ATTEMPTS; attempt++) {
    const candidate = buildCandidate(board, fillRatio, true);
    if (isHandSurvivable(board, candidate, 400_000)) {
      return candidate;
    }
  }

  // Phase 3: brute-force search through small placeable shapes
  const smallPlaceable = SHAPES
    .filter(s => s.cells.length <= 3 && canPlaceAnywhere(board, s))
    .sort((a, b) => a.cells.length - b.cells.length);

  if (smallPlaceable.length > 0) {
    // Try a few random combinations from the small pool
    for (let attempt = 0; attempt < 30; attempt++) {
      const trio: Shape[] = [
        smallPlaceable[Math.floor(Math.random() * smallPlaceable.length)],
        smallPlaceable[Math.floor(Math.random() * smallPlaceable.length)],
        smallPlaceable[Math.floor(Math.random() * smallPlaceable.length)],
      ];
      if (isHandSurvivable(board, trio, 600_000)) return shuffle(trio);
    }
  }

  // Truly stuck — return any placeable shapes (game is effectively over,
  // game-over check in the hook will catch it after placement).
  const anyPlaceable = SHAPES.filter(s => canPlaceAnywhere(board, s));
  if (anyPlaceable.length === 0) {
    // Board has no room for anything (very rare). Fall back to singles.
    return [SHAPES[0], SHAPES[0], SHAPES[0]];
  }
  const safe = anyPlaceable.sort((a, b) => a.cells.length - b.cells.length);
  return [safe[0], safe[Math.min(1, safe.length - 1)], safe[Math.min(2, safe.length - 1)]];
}
