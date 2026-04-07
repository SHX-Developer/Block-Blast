/**
 * Calculate points for a single move.
 *
 * @param cellsPlaced  Number of cells in the placed piece
 * @param linesCleared Total rows + cols cleared this move
 * @param combo        Current consecutive-clear streak (0 = no streak)
 */
export function calculateScore(
  cellsPlaced: number,
  linesCleared: number,
  combo: number
): number {
  // Base: one point per placed block
  let pts = cellsPlaced;

  if (linesCleared > 0) {
    pts += linesCleared * 50;                            // 50 per cleared line
    if (linesCleared >= 2) pts += (linesCleared - 1) * 30; // multi-line bonus
    if (combo > 0) pts += combo * 20;                   // streak bonus
  }

  return pts;
}

export function formatScore(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
