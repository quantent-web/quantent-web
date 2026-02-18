'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';

type BackgroundRippleEffectProps = {
  rows?: number;
  cols?: number;
  cellSize?: number;
  borderColor?: string;
  fillColor?: string;
  className?: string;
  interactive?: boolean;
};

export default function BackgroundRippleEffect({
  rows = 8,
  cols = 27,
  cellSize = 56,
  borderColor = 'rgba(255, 255, 255, 0.08)',
  fillColor = 'rgba(5, 205, 152, 0.22)',
  className,
  interactive = true,
}: BackgroundRippleEffectProps) {
  const total = rows * cols;
  const cells = useMemo(() => Array.from({ length: total }, (_, index) => index), [total]);

  return (
    <div
      className={className}
      style={
        {
          '--ripple-rows': rows,
          '--ripple-cols': cols,
          '--ripple-cell-size': `${cellSize}px`,
          '--ripple-border-color': borderColor,
          '--ripple-fill-color': fillColor,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {cells.map((index) => {
        const opacitySeed = ((index % 7) + 1) / 100;
        const hoverOpacity = Math.min(0.2, 0.06 + opacitySeed);

        return (
          <div
            key={index}
            style={{
              '--cell-hover-opacity': hoverOpacity,
              '--interactive': interactive ? 1 : 0,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
