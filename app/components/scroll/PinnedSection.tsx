'use client';

import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type PinnedStep = {
  key: string;
  label: string;
  content: ReactNode;
};

type PinnedSectionProps = {
  id: string;
  enabled: boolean;
  steps: PinnedStep[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function PinnedSection({ id, enabled, steps }: PinnedSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const stepsCount = steps.length;

  useEffect(() => {
    if (!enabled || stepsCount <= 1) {
      setActiveIndex(0);
      return;
    }

    const track = trackRef.current;
    if (!track) return;

    const scrollRoot = track.closest('main[data-snap-scroll="true"]') as HTMLElement | null;
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;

    const updateActiveStep = () => {
      const rect = track.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const maxOffset = Math.max(rect.height - viewportHeight, 1);
      const progress = clamp((-rect.top) / maxOffset, 0, 0.9999);
      const nextIndex = clamp(Math.floor(progress * stepsCount), 0, stepsCount - 1);
      setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };

    updateActiveStep();

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveStep);
    };

    const onResize = () => {
      updateActiveStep();
    };

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, stepsCount]);

  const activeStep = useMemo(() => steps[activeIndex], [steps, activeIndex]);
  const trackStyle = useMemo(
    () => ({ ['--steps' as '--steps']: String(stepsCount) }) as CSSProperties,
    [stepsCount]
  );

  if (!enabled || stepsCount <= 1) {
    return (
      <div className="pinned pinned--fallback" data-pinned-id={id}>
        {steps.map((step) => (
          <div className="pinned__step-content" key={step.key} role="group" aria-label={step.label}>
            {step.content}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pinned" data-pinned-id={id}>
      <div
        ref={trackRef}
        className="pinned__track"
        style={trackStyle}
      >
        <div className="pinned__sticky" role="group" aria-label={activeStep?.label}>
          <div className="pinned__step-content">
            {activeStep.content}
          </div>
        </div>
      </div>
    </div>
  );
}
