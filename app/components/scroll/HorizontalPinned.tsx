'use client';

import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type HorizontalPanel = {
  key: string;
  title: string;
  content: ReactNode;
};

type HorizontalPinnedProps = {
  enabled: boolean;
  panels: HorizontalPanel[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function HorizontalPinned({ enabled, panels }: HorizontalPinnedProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  const panelCount = panels.length;

  useEffect(() => {
    if (!enabled || panelCount <= 1) {
      setProgress(0);
      return;
    }

    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;

    const updateProgress = () => {
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const trackHeight = track.offsetHeight;
      const stickyHeight = sticky.offsetHeight;
      const maxScrollable = Math.max(trackHeight - stickyHeight, 1);
      const nextProgress = clamp((window.scrollY - trackTop) / maxScrollable, 0, 1);
      setProgress((prev) => (Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress));
    };

    updateProgress();

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    const onResize = () => updateProgress();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, panelCount]);

  const trackStyle = useMemo(
    () => ({ ['--hp-panels' as '--hp-panels']: String(panelCount) }) as CSSProperties,
    [panelCount]
  );

  if (!enabled || panelCount <= 1) {
    return (
      <div className="hpinned hpinned--fallback">
        {panels.map((panel) => (
          <div key={panel.key} className="hpinned__panel hpinned__panel--stacked" role="group" aria-label={panel.title}>
            {panel.content}
          </div>
        ))}
      </div>
    );
  }

  const translateX = progress * (panelCount - 1) * 100;

  return (
    <div className="hpinned">
      <div ref={trackRef} className="hpinned__track" style={trackStyle}>
        <div ref={stickyRef} className="hpinned__sticky">
          <div className="hpinned__rail" style={{ transform: `translate3d(-${translateX}%, 0, 0)` }}>
            {panels.map((panel) => (
              <div key={panel.key} className="hpinned__panel" role="group" aria-label={panel.title}>
                {panel.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
