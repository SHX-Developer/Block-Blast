import React from 'react';
import { Shape } from '../data/shapes';
import { ShapeCard } from './ShapeCard';

interface ShapeTrayProps {
  shapes: (Shape | null)[];
  draggedShapeIndex: number | null;
  onShapePointerDown: (
    e: React.PointerEvent,
    index: number,
    cardEl: HTMLElement,
    gridEl: HTMLElement
  ) => void;
}

export const ShapeTray = React.memo(function ShapeTray({
  shapes,
  draggedShapeIndex,
  onShapePointerDown,
}: ShapeTrayProps) {
  return (
    <div className="tray">
      {shapes.map((shape, i) => (
        <ShapeCard
          key={i}
          shape={shape}
          index={i}
          isDragging={draggedShapeIndex === i}
          onPointerDown={onShapePointerDown}
        />
      ))}
    </div>
  );
});
