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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function HorizontalPinned({ enabled, panels }: HorizontalPinnedProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const animationRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  const panelCount = panels.length;
  const maxIndex = panelCount - 1;

  const animateToIndex = (index: number) => {
    const clampedIndex = clamp(index, 0, maxIndex);
    const from = displayProgress;
    const to = maxIndex <= 0 ? 0 : clampedIndex / maxIndex;
    const duration = 420;
    const start = performance.now();

    cancelAnimationFrame(animationRef.current);
    isAnimatingRef.current = true;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(t);
      setDisplayProgress(from + (to - from) * eased);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      isAnimatingRef.current = false;
      setDisplayProgress(to);
    };

    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!enabled || panelCount <= 1) {
      setActiveIndex(0);
      setDisplayProgress(0);
      return;
    }

    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;

    const syncFromScroll = () => {
      if (isAnimatingRef.current) return;

      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const trackHeight = track.offsetHeight;
      const stickyHeight = sticky.offsetHeight;
      const maxScrollable = Math.max(trackHeight - stickyHeight, 1);
      const rawProgress = clamp((window.scrollY - trackTop) / maxScrollable, 0, 1);
      const index = maxIndex <= 0 ? 0 : Math.round(rawProgress * maxIndex);
      setActiveIndex(index);
      setDisplayProgress(maxIndex <= 0 ? 0 : index / maxIndex);
    };

    syncFromScroll();

    const onScroll = () => syncFromScroll();
    const onResize = () => syncFromScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, panelCount, maxIndex]);

  useEffect(() => {
    if (!enabled || panelCount <= 1) return;

    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!sticky || !track) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    const threshold = 140;
    const cooldownMs = 620;

    const onWheel = (event: WheelEvent) => {
      const direction = event.deltaY > 0 ? 1 : -1;
      const now = performance.now();
      const atFirstAndGoingUp = activeIndex === 0 && direction < 0;
      const atLastAndGoingDown = activeIndex === maxIndex && direction > 0;

      if (atFirstAndGoingUp || atLastAndGoingDown) {
        wheelAccumulatorRef.current = 0;
        return;
      }

      event.preventDefault();

      if (isAnimatingRef.current || now < cooldownUntilRef.current) {
        return;
      }

      wheelAccumulatorRef.current += event.deltaY;

      if (Math.abs(wheelAccumulatorRef.current) < threshold) {
        return;
      }

      const nextIndex = clamp(activeIndex + (wheelAccumulatorRef.current > 0 ? 1 : -1), 0, maxIndex);
      wheelAccumulatorRef.current = 0;
      cooldownUntilRef.current = now + cooldownMs;
      setActiveIndex(nextIndex);
      animateToIndex(nextIndex);

      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const maxScrollable = Math.max(track.offsetHeight - sticky.offsetHeight, 1);
      const panelDistance = maxIndex <= 0 ? 0 : maxScrollable / maxIndex;
      const nextScrollTop = trackTop + panelDistance * nextIndex;
      window.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
    };

    sticky.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      sticky.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, panelCount, activeIndex, maxIndex, displayProgress]);

  const trackStyle = useMemo(
    () => ({ ['--hp-panels' as '--hp-panels']: String(panelCount) }) as CSSProperties,
    [panelCount]
  );

  if (!enabled || panelCount <= 1) {
    return (
      <div className="hpinned hpinned--fallback">
        {panels.map((panel) => (
          <div key={panel.key} className="hpinned__panel hpinned__panel--stacked" role="group" aria-label={panel.title}>
            <div className="hpinned__panelInner container">{panel.content}</div>
          </div>
        ))}
      </div>
    );
  }

  const translateX = displayProgress * maxIndex * 100;

  return (
    <div className="hpinned">
      <div ref={trackRef} className="hpinned__track" style={trackStyle}>
        <div ref={stickyRef} className="hpinned__sticky">
          <div className="hpinned__frame">
            <div className="hpinned__rail" style={{ transform: `translate3d(-${translateX}%, 0, 0)` }}>
              {panels.map((panel) => (
                <section key={panel.key} className="hpinned__panel" role="group" aria-label={panel.title}>
                  <div className="hpinned__panelInner container">{panel.content}</div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
