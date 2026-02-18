'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

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
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const total = rows * cols;
  const cells = useMemo(() => Array.from({ length: total }, (_, index) => index), [total]);

  const triggerRipple = (index: number) => {
    if (!interactive) return;
    setActiveCell(index);
  };

  const onCellEnter = (index: number) => {
    triggerRipple(index);
  };

  const onCellClick = (e: MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    triggerRipple(index);
  };

  useEffect(() => {
    const seed = Math.floor(total / 2);
    setActiveCell(seed);

    const timer = window.setInterval(() => {
      setActiveCell((prev) => {
        const current = prev ?? seed;
        return (current + Math.max(3, Math.floor(cols / 3))) % total;
      });
    }, 850);

    return () => window.clearInterval(timer);
  }, [cols, total]);

  const getDelay = (index: number) => {
    if (activeCell === null) return 0;

    const activeRow = Math.floor(activeCell / cols);
    const activeCol = activeCell % cols;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const distance = Math.abs(row - activeRow) + Math.abs(col - activeCol);

    return distance * 18;
  };

  const getDistance = (index: number) => {
    if (activeCell === null) return 0;

    const activeRow = Math.floor(activeCell / cols);
    const activeCol = activeCell % cols;
    const row = Math.floor(index / cols);
    const col = index % cols;

    return Math.abs(row - activeRow) + Math.abs(col - activeCol);
  };

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
        const isActive = activeCell === index;
        const distance = getDistance(index);
        const idleOpacity = Math.max(0.08, 0.2 - distance * 0.01);
        const activeOpacity = Math.max(0.18, 0.38 - distance * 0.012);

        return (
          <div
            key={index}
            onMouseEnter={() => onCellEnter(index)}
            onClick={(e) => onCellClick(e, index)}
            className={isActive ? 'is-ripple-active' : ''}
            style={{
              '--delay': `${getDelay(index)}ms`,
              '--idle-opacity': idleOpacity,
              '--active-opacity': activeOpacity,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
