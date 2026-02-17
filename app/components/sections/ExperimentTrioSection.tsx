'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type ScrollContainerRef = RefObject<HTMLElement | null>;

type ExperimentTrioSectionProps = {
  scrollContainerRef?: ScrollContainerRef;
  id?: string;
};

let isScrollTriggerRegistered = false;

const ensureScrollTrigger = () => {
  if (!isScrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    isScrollTriggerRegistered = true;
  }
};

const resolveScroller = (scrollContainerRef?: ScrollContainerRef) =>
  scrollContainerRef?.current ?? window;

export default function ExperimentTrioSection({
  scrollContainerRef,
  id = 'experiment-trio',
}: ExperimentTrioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const cardsRoot = cardsRef.current;

    if (!section || !title || !description || !cardsRoot) return;

    ensureScrollTrigger();

    const cards = Array.from(cardsRoot.querySelectorAll<HTMLElement>('.experiment-card'));
    const scroller = resolveScroller(scrollContainerRef);

    const ctx = gsap.context(() => {
      gsap.set([title, description, ...cards], {
        opacity: 0,
        yPercent: 30,
      });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.8}`,
          scrub: 1.1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(title, { opacity: 1, yPercent: 0, duration: 0.65 })
        .to({}, { duration: 0.25 })
        .to(description, { opacity: 1, yPercent: 0, duration: 0.55 })
        .to({}, { duration: 0.2 });

      cards.forEach((card) => {
        timeline.to(card, { opacity: 1, yPercent: 0, duration: 0.42 }, '+=0.1');
      });

      timeline.to({}, { duration: 0.55 });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef]);

  return (
    <section id={id} ref={sectionRef} className="section experiment-trio" aria-label="Experimental scroll section">
      <div className="experiment-trio__inner">
        <h2 ref={titleRef} className="experiment-trio__title">
          Make governance feel measurable.
        </h2>

        <p ref={descriptionRef} className="experiment-trio__description">
          QuantEnt turns entitlements and data governance into something you can prove — with
          clear controls, evidence, and repeatable processes.
        </p>

        <div ref={cardsRef} className="experiment-trio__stack">
          <ScrollStackItem>
            <h3>Evidence-ready controls</h3>
            <p>Replace “we think it’s compliant” with audit-friendly proof.</p>
          </ScrollStackItem>

          <ScrollStackItem>
            <h3>Entitlements you can explain</h3>
            <p>Map access decisions to policy and ownership.</p>
          </ScrollStackItem>

          <ScrollStackItem>
            <h3>Operational clarity</h3>
            <p>Make governance visible and measurable.</p>
          </ScrollStackItem>
        </div>
      </div>
    </section>
  );
}

function ScrollStackItem({ children }: { children: ReactNode }) {
  return <article className="experiment-card">{children}</article>;
}
