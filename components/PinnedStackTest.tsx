'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './PinnedStackTest.module.css';
import BlurText from '../app/components/BlurText/BlurText';
import MagicBentoGrid from '../app/components/effects/MagicBentoGrid';
import Particles from '../app/components/ui/Particles';

type CardItem = {
  title: string;
  text: string;
};

type IconProps = {
  className?: string;
};

const IconShield = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
    <path d="M9.5 12.5l1.8 1.8 3.2-3.2" />
  </svg>
);

const IconChecklist = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" />
    <path d="M4 6l1.5 1.5L7.5 5.5" /><path d="M4 12l1.5 1.5L7.5 11.5" /><path d="M4 18l1.5 1.5L7.5 17.5" />
  </svg>
);

const IconAlert = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const IconRefresh = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </svg>
);

const IconTags = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m20 10-8 8a2 2 0 0 1-2.8 0L3 11.8V4h7.8L20 10z" />
    <path d="M7 7h.01" />
  </svg>
);

const IconSchema = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="7" height="5" rx="1" />
    <rect x="14" y="4" width="7" height="5" rx="1" />
    <rect x="8.5" y="15" width="7" height="5" rx="1" />
    <path d="M10 6.5h4M12 9v6" />
  </svg>
);

const IconDatabase = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="7" ry="3" />
    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);

const IconRobot = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="8" width="14" height="10" rx="3" />
    <path d="M12 4v4" />
    <path d="M9 13h.01M15 13h.01" />
    <path d="M9 16h6" />
  </svg>
);

const getCardIcon = (title: string) => {
  switch (title) {
    case 'System Analysis':
      return IconShield;
    case 'Quantitative Certification':
      return IconChecklist;
    case 'Risk Detection':
      return IconAlert;
    case 'Continuous Control':
      return IconRefresh;
    case 'MetaData Tagging':
      return IconTags;
    case 'Data Model Rigorization':
      return IconSchema;
    case 'Ongoing Cleanliness':
      return IconDatabase;
    case 'Agentic AI Compatibility':
      return IconRobot;
    default:
      return IconShield;
  }
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
const STAGES_PER_SECTION = 10;

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
          <Particles className={styles.particlesBackground} />
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
            const showTitle = localStage >= 1 && localStage <= 3;
            const showTitleBlur = localStage === 1;
            const showTitleHold = localStage === 2 || localStage === 3;
            const showKicker = localStage === 4;
            const showCards = localStage >= 5 && localStage <= 8;
            const showNote = localStage === 9;

            return (
              <article
                key={sectionData.id}
                className={`${styles.step} ${isSectionVisible ? styles.active : ''} ${
                  sectionIndex === 0 && (!isDesktop || isReducedMotion) ? styles.defaultVisible : ''
                }`}
                aria-hidden={!isSectionVisible && isDesktop}
              >
                <div className={styles.stageContainer}>

                  <div
                    className={`${styles.stage} ${styles.emptyStage} ${showEmptyIntro ? styles.stageActive : ''}`}
                    aria-hidden="true"
                  />
                  <div className={`${styles.stage} ${styles.copyStage} ${showTitle ? styles.stageActive : ''}`}>
                    {showTitleBlur ? (
                      <BlurText
                        key={`${sectionData.id}-title`}
                        as="h2"
                        className="section-title"
                        text={sectionData.title}
                        delay={100}
                        animateBy="words"
                        direction="top"
                        stepDuration={0.32}
                      />
                    ) : null}
                    {showTitleHold ? <h2 className="section-title">{sectionData.title}</h2> : null}
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
                        const Icon = getCardIcon(card.title);
                        const isShown = localStage >= 5 + index;
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
                            <Icon className={styles.cardIcon} />
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
