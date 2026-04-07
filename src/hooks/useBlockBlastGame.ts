import { useState, useRef, useCallback, useEffect } from 'react';
import { Shape, getShapeBounds } from '../data/shapes';
import {
  Board,
  createEmptyBoard,
  canPlace,
  placeOnBoard,
  findFullLines,
  clearLines,
  canPlaceAnywhere,
  generateNextShapes,
  hasAnyValidPlacement,
} from '../utils/boardUtils';
import { calculateScore } from '../utils/scoringUtils';
import { triggerLineClearFeedback, triggerPlacementHaptic } from '../utils/feedback';

export interface PreviewState {
  row: number;
  col: number;
  isValid: boolean;
  clearRows: number[];
  clearCols: number[];
}

interface DragInfo {
  shapeIndex: number;
  shape: Shape;
  /** Fraction (0–1) of shape visual width where user grabbed */
  grabFractionX: number;
  /** Fraction (0–1) of shape visual height where user grabbed */
  grabFractionY: number;
  isTouchDrag: boolean;
}

interface BoardMetrics {
  cellSize: number;
  gap: number;
  /** Screen X of cell [0,0] left edge */
  originX: number;
  /** Screen Y of cell [0,0] top edge */
  originY: number;
}

function getBestScore(): number {
  try {
    return parseInt(localStorage.getItem('blockBlastBestScore') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem('blockBlastBestScore', String(score));
  } catch {
    // ignore
  }
}

export function useBlockBlastGame() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(getBestScore);
  const [shapes, setShapes] = useState<(Shape | null)[]>(() =>
    generateNextShapes(createEmptyBoard())
  );
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [draggedShapeIndex, setDraggedShapeIndex] = useState<number | null>(null);

  // ── Stable refs so event handlers never go stale ────────────────────────────
  const boardRef = useRef<HTMLDivElement>(null);   // board DOM element
  const floatingRef = useRef<HTMLDivElement>(null); // floating drag preview
  const dragInfoRef = useRef<DragInfo | null>(null);
  const boardMetricsRef = useRef<BoardMetrics | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
  } | null>(null);

  // State refs – always current, safe to read inside callbacks
  const boardStateRef = useRef(board);
  boardStateRef.current = board;
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const comboRef = useRef(combo);
  comboRef.current = combo;
  const bestScoreRef = useRef(bestScore);
  bestScoreRef.current = bestScore;
  const isAnimatingRef = useRef(isAnimating);
  isAnimatingRef.current = isAnimating;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;

  // ── Board metrics helper ─────────────────────────────────────────────────────
  const measureBoard = useCallback((): BoardMetrics | null => {
    const el = boardRef.current;
    if (!el) return null;
    const c0 = el.querySelector<HTMLElement>('[data-row="0"][data-col="0"]');
    const c1 = el.querySelector<HTMLElement>('[data-row="0"][data-col="1"]');
    if (!c0 || !c1) return null;
    const r0 = c0.getBoundingClientRect();
    const r1 = c1.getBoundingClientRect();
    return {
      cellSize: r0.width,
      gap: Math.max(0, r1.left - r0.right),
      originX: r0.left,
      originY: r0.top,
    };
  }, []);

  // ── Floating element helpers ─────────────────────────────────────────────────
  const buildFloatingElement = useCallback(
    (shape: Shape, metrics: BoardMetrics) => {
      const el = floatingRef.current;
      if (!el) return;
      const { cellSize, gap } = metrics;
      const step = cellSize + gap;
      const bounds = getShapeBounds(shape);

      el.innerHTML = '';
      el.style.width = `${bounds.cols * step - gap}px`;
      el.style.height = `${bounds.rows * step - gap}px`;

      shape.cells.forEach(([r, c]) => {
        const cell = document.createElement('div');
        cell.style.cssText = `
          position:absolute;
          left:${c * step}px;
          top:${r * step}px;
          width:${cellSize}px;
          height:${cellSize}px;
          background:${shape.color};
          border-radius:6px;
          box-shadow:0 4px 16px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.35);
        `;
        el.appendChild(cell);
      });

      el.style.display = 'block';
      el.style.opacity = '0.88';
    },
    []
  );

  const moveFloating = useCallback(
    (px: number, py: number, info: DragInfo, metrics: BoardMetrics) => {
      const el = floatingRef.current;
      if (!el) return;
      const { cellSize, gap } = metrics;
      const step = cellSize + gap;
      const bounds = getShapeBounds(info.shape);
      const visW = bounds.cols * step - gap;
      const visH = bounds.rows * step - gap;
      // On touch: raise shape above finger so it's visible
      const touchLift = info.isTouchDrag ? -(cellSize * 1.5) : 0;
      const left = px - info.grabFractionX * visW;
      const top = py - info.grabFractionY * visH + touchLift;
      el.style.transform = `translate(${left}px,${top}px)`;
    },
    []
  );

  const hideFloating = useCallback(() => {
    const el = floatingRef.current;
    if (el) el.style.display = 'none';
  }, []);

  // ── Preview calculation ──────────────────────────────────────────────────────
  const calcPreview = useCallback(
    (px: number, py: number, info: DragInfo, metrics: BoardMetrics) => {
      const { cellSize, gap, originX, originY } = metrics;
      const step = cellSize + gap;
      const bounds = getShapeBounds(info.shape);
      const visW = bounds.cols * step - gap;
      const visH = bounds.rows * step - gap;
      const touchLift = info.isTouchDrag ? -(cellSize * 1.5) : 0;
      const shapeLeft = px - info.grabFractionX * visW;
      const shapeTop = py - info.grabFractionY * visH + touchLift;
      return {
        row: Math.round((shapeTop - originY) / step),
        col: Math.round((shapeLeft - originX) / step),
      };
    },
    []
  );

  // ── Pointer move ─────────────────────────────────────────────────────────────
  const doPointerMove = useCallback(
    (e: PointerEvent) => {
      const info = dragInfoRef.current;
      const metrics = boardMetricsRef.current;
      if (!info || !metrics) return;
      e.preventDefault();

      moveFloating(e.clientX, e.clientY, info, metrics);

      const pos = calcPreview(e.clientX, e.clientY, info, metrics);
      const valid = canPlace(boardStateRef.current, info.shape, pos.row, pos.col);
      let clearRows: number[] = [];
      let clearCols: number[] = [];
      if (valid) {
        const tempBoard = placeOnBoard(boardStateRef.current, info.shape, pos.row, pos.col);
        const lines = findFullLines(tempBoard);
        clearRows = lines.rows;
        clearCols = lines.cols;
      }

      setPreview(prev => {
        if (
          prev?.row === pos.row &&
          prev?.col === pos.col &&
          prev?.isValid === valid &&
          prev?.clearRows.length === clearRows.length &&
          prev?.clearCols.length === clearCols.length
        ) return prev;
        return { ...pos, isValid: valid, clearRows, clearCols };
      });
    },
    [moveFloating, calcPreview]
  );

  // ── Cleanup drag listeners ───────────────────────────────────────────────────
  const removeDragListeners = useCallback(() => {
    const ls = activeListenersRef.current;
    if (!ls) return;
    document.removeEventListener('pointermove', ls.move);
    document.removeEventListener('pointerup', ls.up);
    document.removeEventListener('pointercancel', ls.up);
    activeListenersRef.current = null;
  }, []);

  // ── Place shape (called from doPointerUp) ────────────────────────────────────
  const commitPlace = useCallback(
    (shapeIndex: number, shape: Shape, row: number, col: number) => {
      const currentBoard = boardStateRef.current;
      const currentShapes = shapesRef.current;
      const currentScore = scoreRef.current;
      const currentCombo = comboRef.current;
      const currentBest = bestScoreRef.current;

      triggerPlacementHaptic();

      const newBoard = placeOnBoard(currentBoard, shape, row, col);
      const newShapes: (Shape | null)[] = currentShapes.map((s, i) => (i === shapeIndex ? null : s));
      const { rows: fullRows, cols: fullCols } = findFullLines(newBoard);

      if (fullRows.length > 0 || fullCols.length > 0) {
        // Show placed shape + full lines briefly, then clear
        setBoard(newBoard);
        setShapes(newShapes);
        setClearingRows(fullRows);
        setClearingCols(fullCols);
        setIsAnimating(true);
        setCombo(currentCombo + 1);

        const clearedBoard = clearLines(newBoard, fullRows, fullCols);
        const linesCleared = fullRows.length + fullCols.length;
        const pts = calculateScore(shape.cells.length, linesCleared, currentCombo);
        const newScore = currentScore + pts;
        const newBest = Math.max(currentBest, newScore);

        const allUsed = newShapes.every(s => s === null);
        const finalShapes: (Shape | null)[] = allUsed
          ? generateNextShapes(clearedBoard)
          : newShapes;
        const remaining = finalShapes.filter((s): s is Shape => s !== null);
        const isGameOver = !hasAnyValidPlacement(clearedBoard, remaining);

        triggerLineClearFeedback(linesCleared);

        animTimeoutRef.current = setTimeout(() => {
          setBoard(clearedBoard);
          setClearingRows([]);
          setClearingCols([]);
          setIsAnimating(false);
          setScore(newScore);
          setBestScore(newBest);
          saveBestScore(newBest);
          setShapes(finalShapes);
          if (isGameOver) setGameOver(true);
        }, 560);
      } else {
        // No lines to clear
        const pts = calculateScore(shape.cells.length, 0, 0);
        const newScore = currentScore + pts;
        const newBest = Math.max(currentBest, newScore);

        const allUsed = newShapes.every(s => s === null);
        const finalShapes: (Shape | null)[] = allUsed
          ? generateNextShapes(newBoard)
          : newShapes;
        const remaining = finalShapes.filter((s): s is Shape => s !== null);
        const isGameOver = !hasAnyValidPlacement(newBoard, remaining);

        setBoard(newBoard);
        setShapes(finalShapes);
        setScore(newScore);
        setBestScore(newBest);
        saveBestScore(newBest);
        setCombo(0);
        if (isGameOver) setGameOver(true);
      }
    },
    []
  );

  // ── Pointer up ───────────────────────────────────────────────────────────────
  const doPointerUp = useCallback(
    (e: PointerEvent) => {
      const info = dragInfoRef.current;
      const metrics = boardMetricsRef.current;

      removeDragListeners();
      hideFloating();
      setPreview(null);
      setDraggedShapeIndex(null);
      dragInfoRef.current = null;

      if (!info || !metrics || isAnimatingRef.current || gameOverRef.current) return;

      const pos = calcPreview(e.clientX, e.clientY, info, metrics);
      if (canPlace(boardStateRef.current, info.shape, pos.row, pos.col)) {
        commitPlace(info.shapeIndex, info.shape, pos.row, pos.col);
      }
    },
    [removeDragListeners, hideFloating, calcPreview, commitPlace]
  );

  // ── Pointer down on a shape card ─────────────────────────────────────────────
  const handleShapePointerDown = useCallback(
    (
      e: React.PointerEvent,
      shapeIndex: number,
      cardEl: HTMLElement,
      gridEl: HTMLElement
    ) => {
      const shape = shapesRef.current[shapeIndex];
      if (!shape || isAnimatingRef.current || gameOverRef.current) return;

      e.preventDefault();

      const metrics = measureBoard();
      if (!metrics) return;
      boardMetricsRef.current = metrics;

      // Grab offset – relative to the shape grid element (not the card)
      const gridRect = gridEl.getBoundingClientRect();
      const rawGX = e.clientX - gridRect.left;
      const rawGY = e.clientY - gridRect.top;
      const grabFractionX = Math.max(0, Math.min(1, rawGX / (gridRect.width || 1)));
      const grabFractionY = Math.max(0, Math.min(1, rawGY / (gridRect.height || 1)));

      const info: DragInfo = {
        shapeIndex,
        shape,
        grabFractionX,
        grabFractionY,
        isTouchDrag: e.pointerType === 'touch',
      };
      dragInfoRef.current = info;

      setDraggedShapeIndex(shapeIndex);

      // Build and initially position the floating element
      buildFloatingElement(shape, metrics);
      moveFloating(e.clientX, e.clientY, info, metrics);

      // Attach document-level drag listeners
      const move = (ev: PointerEvent) => doPointerMove(ev);
      const up = (ev: PointerEvent) => doPointerUp(ev);
      activeListenersRef.current = { move, up };
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    },
    [measureBoard, buildFloatingElement, moveFloating, doPointerMove, doPointerUp]
  );

  // ── Restart ──────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    removeDragListeners();
    hideFloating();
    dragInfoRef.current = null;

    const emptyBoard = createEmptyBoard();
    setBoard(emptyBoard);
    setScore(0);
    setShapes(generateNextShapes(emptyBoard));
    setGameOver(false);
    setCombo(0);
    setIsAnimating(false);
    setClearingRows([]);
    setClearingCols([]);
    setPreview(null);
    setDraggedShapeIndex(null);
  }, [removeDragListeners, hideFloating]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      removeDragListeners();
    };
  }, [removeDragListeners]);

  return {
    board,
    score,
    bestScore,
    shapes,
    gameOver,
    combo,
    isAnimating,
    clearingRows,
    clearingCols,
    preview,
    draggedShapeIndex,
    boardRef,
    floatingRef,
    handleShapePointerDown,
    restart,
  };
}
