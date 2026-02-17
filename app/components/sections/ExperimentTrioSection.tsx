'use client';

import { useEffect, useMemo, useRef } from 'react';
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
  return (
    <section id={id} className="section experiment-trio" aria-label="Experimental scroll section">
      <div className="experiment-trio__inner">
        <ScrollFloat scrollContainerRef={scrollContainerRef}>
          Make governance feel measurable.
        </ScrollFloat>

        <ScrollReveal scrollContainerRef={scrollContainerRef}>
          QuantEnt turns entitlements and data governance into something you can prove — with
          clear controls, evidence, and repeatable processes.
        </ScrollReveal>

        <ScrollStack scrollContainerRef={scrollContainerRef}>
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
        </ScrollStack>
      </div>
    </section>
  );
}

function ScrollFloat({
  children,
  scrollContainerRef,
}: {
  children: ReactNode;
  scrollContainerRef?: ScrollContainerRef;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="experiment-char" key={`${char}-${index}`}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    ensureScrollTrigger();
    const scroller = resolveScroller(scrollContainerRef);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heading.querySelectorAll('.experiment-char'),
        { opacity: 0, yPercent: 120 },
        {
          opacity: 1,
          yPercent: 0,
          ease: 'none',
          stagger: 0.025,
          scrollTrigger: {
            trigger: heading,
            scroller,
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      );
    }, heading);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef]);

  return (
    <h2 ref={headingRef} className="experiment-trio__title">
      {splitText}
    </h2>
  );
}

function ScrollReveal({
  children,
  scrollContainerRef,
}: {
  children: ReactNode;
  scrollContainerRef?: ScrollContainerRef;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) =>
      /^\s+$/.test(word) ? (
        word
      ) : (
        <span className="experiment-word" key={`${word}-${index}`}>
          {word}
        </span>
      )
    );
  }, [children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ensureScrollTrigger();
    const scroller = resolveScroller(scrollContainerRef);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.querySelectorAll('.experiment-word'),
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: {
            trigger: container,
            scroller,
            start: 'top 86%',
            end: 'bottom 52%',
            scrub: true,
          },
        }
      );
    }, container);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef]);

  return (
    <div ref={containerRef} className="experiment-trio__description">
      <p>{splitText}</p>
    </div>
  );
}

function ScrollStackItem({ children }: { children: ReactNode }) {
  return <article className="experiment-card">{children}</article>;
}

function ScrollStack({
  children,
  scrollContainerRef,
}: {
  children: ReactNode;
  scrollContainerRef?: ScrollContainerRef;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    ensureScrollTrigger();

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.experiment-card'));
    const scroller = resolveScroller(scrollContainerRef);
    const isWindowScroller = scroller === window;

    const getScrollTop = () =>
      isWindowScroller ? window.scrollY : (scroller as HTMLElement).scrollTop;

    const getElementTop = (el: HTMLElement) => {
      if (isWindowScroller) {
        return el.getBoundingClientRect().top + window.scrollY;
      }

      const scrollerRect = (scroller as HTMLElement).getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      return elementRect.top - scrollerRect.top + (scroller as HTMLElement).scrollTop;
    };

    let rafId: number | null = null;
    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollTop = getScrollTop();
      const rootTop = getElementTop(root);
      const rootProgress = Math.max(0, scrollTop - rootTop);

      cards.forEach((card, index) => {
        const step = 140;
        const cardProgress = Math.min(1, Math.max(0, (rootProgress - index * step) / step));
        const lift = (1 - cardProgress) * 42;
        const scale = 1 - Math.max(0, cards.length - index - 1) * 0.02 * cardProgress;

        card.style.transform = `translate3d(0, ${lift}px, 0) scale(${scale})`;
        card.style.opacity = `${0.45 + cardProgress * 0.55}`;
      });
    };

    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(update);
    };

    const onScroll = () => {
      requestTick();
    };

    const pinTrigger = ScrollTrigger.create({
      trigger: root,
      scroller,
      start: 'top top+=72',
      end: () => `+=${cards.length * 280}`,
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: requestTick,
      onRefresh: requestTick,
    });

    scroller.addEventListener('scroll', onScroll, { passive: true });
    requestTick();

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      pinTrigger.kill();
    };
  }, [scrollContainerRef]);

  return <div ref={rootRef} className="experiment-trio__stack">{children}</div>;
}
