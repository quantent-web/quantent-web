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
  baseColor = '#271E37',
  activeColor = '#5227FF',
  className = '',
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const step = dotSize + gap;
      const cols = Math.floor((width + gap) / step);
      const rows = Math.floor((height + gap) / step);

      const gridW = step * cols - gap;
      const gridH = step * rows - gap;

      const startX = (width - gridW) / 2 + dotSize / 2;
      const startY = (height - gridH) / 2 + dotSize / 2;

      // (por ahora) degradado estático suave entre baseColor y activeColor
      // solo para comprobar que todo dibuja OK
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const t = (x + y) / Math.max(1, cols + rows - 2);
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          const cx = startX + x * step;
          const cy = startY + y * step;
          ctx.beginPath();
          ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(wrap);

    return () => ro.disconnect();
  }, [dotSize, gap, baseRgb, activeRgb]);

  return (
    <div ref={wrapRef} className={`dotgrid-wrap ${className}`} style={style}>
      <canvas ref={canvasRef} className="dotgrid-canvas" />
    </div>
  );
}
