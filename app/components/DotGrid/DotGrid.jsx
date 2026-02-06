'use client';

import { useEffect, useRef } from 'react';
import './DotGrid.css';

export default function DotGrid({
  dotSize = 5,
  gap = 15,
  baseColor = '#253535',
  activeColor = '#05CD98',
  proximity = 200,
}) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const hasEntered = useRef(false);
  const lastShock = useRef(0);

  const SHOCK_COOLDOWN = 250;
  const SPEED_THRESHOLD = 1.2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const shock = (x, y, force = 1) => {
      lastShock.current = Date.now();
      mouse.current = { x, y, force };
    };

    const onMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      const dt = now - lastMouse.current.t || 16;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      mouse.current = { x: e.clientX, y: e.clientY };

      if (
        speed > SPEED_THRESHOLD &&
        Date.now() - lastShock.current > SHOCK_COOLDOWN
      ) {
        shock(e.clientX, e.clientY, 0.6);
      }

      lastMouse.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const onEnter = (e) => {
      if (!hasEntered.current) {
        hasEntered.current = true;
        shock(e.clientX, e.clientY, 1);
      }
    };

    const onClick = (e) => {
      shock(e.clientX, e.clientY, 1.2);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('click', onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const influence = Math.max(
            0,
            1 - dist / proximity
          );

          const size =
            dotSize +
            influence * 2 * (mouse.current.force || 0.5);

          ctx.fillStyle = influence > 0.1 ? activeColor : baseColor;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="dotgrid-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}
