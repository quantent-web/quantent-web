'use client';

import { useEffect, useRef } from 'react';
import './DotGrid.css';

export default function DotGrid({
  dotSize = 5,
  gap = 15,
  baseColor = '#253535',
  activeColor = '#05CD98',
  proximity = 140,
}) {
  const canvasRef = useRef(null);

  // Hover (spotlight)
  const hover = useRef({ x: -9999, y: -9999 });

  // Shock (impulso/onda) con decaimiento
  const shock = useRef({
    x: -9999,
    y: -9999,
    force: 0,
    t: 0,
  });

  // Para detectar “movimiento rápido”
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });

  // Para disparar shock 1 vez al entrar
  const hasEntered = useRef(false);

  // Tuning (suave, sin “mancha” gigante)
  const SHOCK_RADIUS = 180;
  const SHOCK_DECAY_MS = 550;
  const SHOCK_COOLDOWN_MS = 350;
  const SPEED_THRESHOLD = 1.6; // más alto = menos shocks

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
   const parent = canvas.parentElement;
canvas.width = parent?.clientWidth ?? window.innerWidth;
canvas.height = parent?.clientHeight ?? window.innerHeight;

    };

    resize();
    window.addEventListener('resize', resize);

    const triggerShock = (x, y, force = 1) => {
      const now = Date.now();
      // cooldown
      if (now - shock.current.t < SHOCK_COOLDOWN_MS) return;

      shock.current = { x, y, force, t: now };
    };

    const onMove = (e) => {
      // spotlight
      hover.current = { x: e.clientX, y: e.clientY };

      // velocidad del cursor
      const now = performance.now();
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      const dt = now - lastMouse.current.t || 16;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      // shock si movimiento es rápido
      if (speed > SPEED_THRESHOLD) {
        triggerShock(e.clientX, e.clientY, 0.55);
      }

      lastMouse.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const onEnter = (e) => {
      if (!hasEntered.current) {
        hasEntered.current = true;
        triggerShock(e.clientX, e.clientY, 0.9);
      }
    };

    const onClick = (e) => {
      triggerShock(e.clientX, e.clientY, 1.0);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('click', onClick);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const shockAge = now - shock.current.t;
      const shockDecay =
        shock.current.t === 0
          ? 0
          : Math.max(0, 1 - shockAge / SHOCK_DECAY_MS);

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          // spotlight influence
          const hx = x - hover.current.x;
          const hy = y - hover.current.y;
          const hdist = Math.sqrt(hx * hx + hy * hy);
          const hoverInfluence = Math.max(0, 1 - hdist / proximity);

          // shock influence (local + decae)
          const sx = x - shock.current.x;
          const sy = y - shock.current.y;
          const sdist = Math.sqrt(sx * sx + sy * sy);
          const shockInfluence = Math.max(0, 1 - sdist / SHOCK_RADIUS);

          const shockBoost =
            shockInfluence * shockDecay * (shock.current.force || 0);

          // tamaño: base + hover suave + shock puntual
          const radius =
            dotSize +
            hoverInfluence * 1.4 +
            shockBoost * 2.2;

          // color: activo solo cerca del hover (evita “mancha” gigante)
         ctx.fillStyle = hoverInfluence > 0.22 ? activeColor : baseColor;


          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
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
  }, [dotSize, gap, baseColor, activeColor, proximity]);

  return (
    <div className="dotgrid-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}
