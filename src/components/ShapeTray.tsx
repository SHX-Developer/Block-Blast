import React from 'react';
import { Shape } from '../data/shapes';
import { ShapeCard } from './ShapeCard';
import { ThemeId } from '../themes/themes';

interface ShapeTrayProps {
  shapes: (Shape | null)[];
  draggedShapeIndex: number | null;
  themeId: ThemeId;
  genToken: number;
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
  themeId,
  genToken,
  onShapePointerDown,
}: ShapeTrayProps) {
  return (
    <div className="tray">
      {shapes.map((shape, i) => (
        <ShapeCard
          key={`${genToken}-${i}`}
          shape={shape}
          index={i}
          isDragging={draggedShapeIndex === i}
          themeId={themeId}
          genToken={genToken}
          onPointerDown={onShapePointerDown}
        />
      ))}
    </div>
  );
});
