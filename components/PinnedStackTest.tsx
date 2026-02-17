'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './PinnedStackTest.module.css';
import BlurText from '../app/components/BlurText/BlurText';
import MagicBentoGrid from '../app/components/effects/MagicBentoGrid';

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
const STAGES_PER_SECTION = 8;

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
            const computedStage = Math.min(Math.max(activeStage - base, 0), STAGES_PER_SECTION - 1);
            const isStaticMobile = !isDesktop;
            const isStaticReduced = isDesktop && isReducedMotion;
            const localStage = computedStage;
            const isSectionVisible = isStaticMobile
              ? true
              : isStaticReduced
                ? sectionIndex === 0
                : activeStage >= base && activeStage < base + STAGES_PER_SECTION;

            const showEmptyIntro = localStage === 0;
            const showTitle = localStage === 1;
            const showKicker = localStage === 2;
            const showCards = localStage >= 3 && localStage <= 6;
            const showNote = localStage === 7;

            return (
              <article
                key={sectionData.id}
                className={`${styles.step} ${isSectionVisible ? styles.active : ''} ${
                  sectionIndex === 0 ? styles.defaultVisible : ''
                }`}
                aria-hidden={!isSectionVisible && isDesktop}
              >
                <div className={styles.stageContainer}>

                  <div
                    className={`${styles.stage} ${styles.emptyStage} ${showEmptyIntro ? styles.stageActive : ''}`}
                    aria-hidden="true"
                  />
                  <div className={`${styles.stage} ${styles.copyStage} ${showTitle ? styles.stageActive : ''}`}>
                    {showTitle ? (
                      <BlurText
                        key={`${sectionData.id}-title-${activeStage}`}
                        as="h2"
                        className="section-title"
                        text={sectionData.title}
                        delay={120}
                        animateBy="words"
                        direction="top"
                      />
                    ) : null}
                    <p className="section-lead">{sectionData.description}</p>
                  </div>

                  <div className={`${styles.stage} ${showKicker ? styles.stageActive : ''}`}>
                    <p className="section-kicker">{sectionData.kicker}</p>
                  </div>

                  <div className={`${styles.stage} ${showCards ? styles.stageActive : ''}`}>
                    <MagicBentoGrid
                      variant="4"
                      sectionId={`pinned-stack-${sectionData.id}`}
                      className={styles.cardsGrid}
                      enableGlow
                      enableTilt
                      disabled={false}
                    >
                      {sectionData.cards.map((card, index) => {
                        const isShown = localStage >= 3 + index;
                        const fromClass =
                          index === 0
                            ? styles.fromLeft
                            : index === 1
                              ? styles.fromRight
                              : styles.fromBottom;

                        return (
                          <div
                            key={`${sectionData.id}-${card.title}`}
                            className={`card ${styles.cardAnimated} ${!isShown ? fromClass : ''} ${isShown ? styles.cardShown : ''}`}
                          >
                            <h4 className="card-title">{card.title}</h4>
                            <p className="card-text">{card.text}</p>
                          </div>
                        );
                      })}
                    </MagicBentoGrid>
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
