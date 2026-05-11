import React, { useRef, useCallback } from 'react';
import { Shape, getShapeBounds } from '../data/shapes';
import { mapShapeColor, ThemeId } from '../themes/themes';

interface ShapeCardProps {
  shape: Shape | null;
  index: number;
  isDragging: boolean;
  themeId: ThemeId;
  /** Increments each time a fresh set of shapes spawns — used to retrigger entrance anim. */
  genToken: number;
  onPointerDown: (
    e: React.PointerEvent,
    index: number,
    cardEl: HTMLElement,
    gridEl: HTMLElement
  ) => void;
}

// Max size the shape card inner area (px)
const CARD_INNER = 80;
const MAX_CELL = 26;
const CELL_GAP = 3;

export const ShapeCard = React.memo(function ShapeCard({
  shape,
  index,
  isDragging,
  themeId,
  genToken,
  onPointerDown,
}: ShapeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!shape || !cardRef.current || !gridRef.current) return;
      onPointerDown(e, index, cardRef.current, gridRef.current);
    },
    [shape, index, onPointerDown]
  );

  if (!shape) {
    return <div className="shape-card shape-card--empty" />;
  }

  const bounds = getShapeBounds(shape);
  const maxDim = Math.max(bounds.rows, bounds.cols);
  const cellSize = Math.min(
    Math.floor((CARD_INNER - (maxDim - 1) * CELL_GAP) / maxDim),
    MAX_CELL
  );
  const step = cellSize + CELL_GAP;

  const gridW = bounds.cols * step - CELL_GAP;
  const gridH = bounds.rows * step - CELL_GAP;
  const themedColor = mapShapeColor(shape.color, themeId);

  return (
    <div
      ref={cardRef}
      // key on genToken+index so a remount triggers the entrance animation
      key={`${genToken}-${index}`}
      className={`shape-card${isDragging ? ' shape-card--dragging' : ''}`}
      style={{ animationDelay: `${index * 70}ms` } as React.CSSProperties}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={gridRef}
        className="shape-grid"
        style={{ width: gridW, height: gridH, position: 'relative' }}
      >
        {shape.cells.map(([r, c]) => (
          <div
            key={`${r}-${c}`}
            className="shape-cell"
            style={{
              position: 'absolute',
              left: c * step,
              top: r * step,
              width: cellSize,
              height: cellSize,
              background: themedColor,
            }}
          />
        ))}
      </div>
    </div>
  );
});
