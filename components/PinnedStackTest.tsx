'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './PinnedStackTest.module.css';

type PinnedStackTestProps = {
  stepOne: ReactNode;
  stepTwo: ReactNode;
};

const DESKTOP_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export default function PinnedStackTest({ stepOne, stepTwo }: PinnedStackTestProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const desktopMedia = window.matchMedia(DESKTOP_QUERY);
    const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);

    const syncMediaState = () => {
      setIsDesktop(desktopMedia.matches);
      setIsReducedMotion(motionMedia.matches);
    };

    syncMediaState();
    desktopMedia.addEventListener('change', syncMediaState);
    motionMedia.addEventListener('change', syncMediaState);

    return () => {
      desktopMedia.removeEventListener('change', syncMediaState);
      motionMedia.removeEventListener('change', syncMediaState);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop || isReducedMotion) {
      setActiveStep(0);
      return;
    }

    const update = () => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const sectionTop = sectionEl.offsetTop;
      const sectionHeight = sectionEl.offsetHeight;
      const viewHeight = window.innerHeight;
      const usableDistance = Math.max(sectionHeight - viewHeight, 1);
      const progress = (window.scrollY - sectionTop) / usableDistance;
      const normalized = Math.min(Math.max(progress, 0), 0.9999);
      const index = Math.min(1, Math.floor(normalized * 2));

      setActiveStep(index);
    };

    const onScroll = () => requestAnimationFrame(update);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [isDesktop, isReducedMotion]);

  return (
    <section id="pinned-stack-test" className={`section ${styles.section}`} ref={sectionRef}>
      <div className={styles.track}>
        <div className={styles.viewport}>
          <article
            className={`${styles.step} ${styles.defaultVisible} ${activeStep === 0 ? styles.active : ''}`}
            aria-hidden={activeStep !== 0 && isDesktop}
          >
            {stepOne}
          </article>
          <article
            className={`${styles.step} ${activeStep === 1 ? styles.active : ''}`}
            aria-hidden={activeStep !== 1 && isDesktop}
          >
            {stepTwo}
          </article>
        </div>
      </div>
    </section>
  );
}
