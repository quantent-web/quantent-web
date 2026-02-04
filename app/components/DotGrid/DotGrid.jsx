'use client';

import { useEffect, useMemo, useRef } from 'react';
import './DotGrid.css';

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export default function DotGrid({
  dotSize = 5,
  gap = 15,
  baseColor = '#182323',
  activeColor = '#05CD98',
  proximity = 120,
  className = '',
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -99999, y: -99999 });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const { width, height } = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const step = dotSize + gap;
      const cols = Math.floor((width + gap) / step);
      const rows = Math.floor((height + gap) / step);

      const gridW = step * cols - gap;
      const gridH = step * rows - gap;

      const startX = (width - gridW) / 2 + dotSize / 2;
      const startY = (height - gridH) / 2 + dotSize / 2;

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const proxSq = proximity * proximity;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = startX + x * step;
          const cy = startY + y * step;

          const dx = cx - px;
          const dy = cy - py;
          const dsq = dx * dx + dy * dy;

          let fill = baseColor;

          if (dsq <= proxSq) {
            const dist = Math.sqrt(dsq);
            const t = 1 - dist / proximity;
            const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
            const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
            const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
            fill = `rgb(${r},${g},${b})`;
          }

          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    };

    const onLeave = () => {
      pointerRef.current.x = -99999;
      pointerRef.current.y = -99999;
    };

    resize();
    draw();

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    // OJO: el wrapper está pointer-events:none por CSS para no molestar al nav,
    // así que escuchamos el movimiento en window.
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity, baseRgb, activeRgb]);

  return (
    <div ref={wrapRef} className={`dotgrid-wrap ${className}`} style={style}>
      <canvas ref={canvasRef} className="dotgrid-canvas" />
    </div>
  );
}
