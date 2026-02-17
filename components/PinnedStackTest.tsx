'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './PinnedStackTest.module.css';

type CardItem = {
  title: string;
  text: string;
};

type PinnedStackSection = {
  id: string;
  title: string;
  description: string;
  kicker: string;
  note: string;
  cards: CardItem[];
};

type PinnedStackTestProps = {
  sections: PinnedStackSection[];
};

const DESKTOP_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const STAGES_PER_SECTION = 7;

export default function PinnedStackTest({ sections }: PinnedStackTestProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const totalStages = useMemo(() => sections.length * STAGES_PER_SECTION, [sections.length]);

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
      setActiveStage(0);
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
      const index = Math.min(totalStages - 1, Math.floor(normalized * totalStages));

      setActiveStage(index);
    };

    const onScroll = () => requestAnimationFrame(update);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [isDesktop, isReducedMotion, totalStages]);

  const trackStyle = {
    '--stage-count': String(totalStages),
  } as CSSProperties;

  return (
    <section id="pinned-stack-test" className={`section ${styles.section}`} ref={sectionRef}>
      <div className={styles.track} style={trackStyle}>
        <div className={styles.viewport}>
          {sections.map((sectionData, sectionIndex) => {
            const base = sectionIndex * STAGES_PER_SECTION;
            const localStage = Math.min(Math.max(activeStage - base, 0), STAGES_PER_SECTION - 1);
            const isSectionVisible = !isDesktop || !isReducedMotion
              ? sectionIndex === 0
              : activeStage >= base && activeStage < base + STAGES_PER_SECTION;

            const showTitle = localStage === 0;
            const showKicker = localStage === 1;
            const showCards = localStage >= 2 && localStage <= 5;
            const showNote = localStage === 6;

            return (
              <article
                key={sectionData.id}
                className={`${styles.step} ${isSectionVisible ? styles.active : ''} ${
                  sectionIndex === 0 ? styles.defaultVisible : ''
                }`}
                aria-hidden={!isSectionVisible && isDesktop}
              >
                <div className={styles.stageContainer}>
                  <div className={`${styles.stage} ${showTitle ? styles.stageActive : ''}`}>
                    <h2 className="section-title">{sectionData.title}</h2>
                    <p className="section-lead">{sectionData.description}</p>
                  </div>

                  <div className={`${styles.stage} ${showKicker ? styles.stageActive : ''}`}>
                    <p className="section-kicker">{sectionData.kicker}</p>
                  </div>

                  <div className={`${styles.stage} ${showCards ? styles.stageActive : ''}`}>
                    <div className={styles.cardsGrid}>
                      {sectionData.cards.map((card, index) => {
                        const isShown = localStage >= 2 + index;
                        const fromClass =
                          index === 0
                            ? styles.fromLeft
                            : index === 1
                              ? styles.fromRight
                              : styles.fromBottom;

                        return (
                          <div
                            key={`${sectionData.id}-${card.title}`}
                            className={`card ${styles.cardAnimated} ${fromClass} ${isShown ? styles.cardShown : ''}`}
                          >
                            <h4 className="card-title">{card.title}</h4>
                            <p className="card-text">{card.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`${styles.stage} ${showNote ? styles.stageActive : ''}`}>
                    <p className="section-note">{sectionData.note}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
