'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type ScrollContainerRef = RefObject<HTMLElement | null>;

type ExperimentTrioSectionProps = {
  scrollContainerRef?: ScrollContainerRef;
  id?: string;
};

type StepMeta = {
  key: string;
  className: string;
  content: React.ReactNode;
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

const STEP_GAP_PX = 24;

const STEP_ITEMS: StepMeta[] = [
  {
    key: 'title',
    className: 'experiment-step experiment-step--title',
    content: <h2>What We Do</h2>,
  },
  {
    key: 'lead',
    className: 'experiment-step experiment-step--lead section-lead',
    content: (
      <p>
        QuantEnt analyzes and certifies who can access what — and what that data means — using
        quantitative models instead of static rules.
      </p>
    ),
  },
  {
    key: 'kicker',
    className: 'experiment-step experiment-step--kicker section-kicker',
    content: <p>We help organizations</p>,
  },
  {
    key: 'card-1',
    className: 'experiment-step experiment-step--card',
    content: (
      <article className="experiment-card">
        <h3>System Analysis</h3>
        <p>Analyze users, roles, entitlements, and data as interconnected systems.</p>
      </article>
    ),
  },
  {
    key: 'card-2',
    className: 'experiment-step experiment-step--card',
    content: (
      <article className="experiment-card">
        <h3>Quantitative Certification</h3>
        <p>Certify access and meaning with mathematical rigor.</p>
      </article>
    ),
  },
  {
    key: 'card-3',
    className: 'experiment-step experiment-step--card',
    content: (
      <article className="experiment-card">
        <h3>Risk Detection</h3>
        <p>Detect drift, over-exposure, and structural risk early.</p>
      </article>
    ),
  },
  {
    key: 'card-4',
    className: 'experiment-step experiment-step--card',
    content: (
      <article className="experiment-card">
        <h3>Continuous Control</h3>
        <p>Detect drift, over-exposure, and structural risk early.</p>
      </article>
    ),
  },
  {
    key: 'note',
    className: 'experiment-step experiment-step--note section-note',
    content: (
      <p>
        QuantEnt is built for complex, regulated environments where correctness, scale, and
        evolution matter.
      </p>
    ),
  },
];

export default function ExperimentTrioSection({
  scrollContainerRef,
  id = 'experiment-trio',
}: ExperimentTrioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const steps = stepRefs.current.filter((node): node is HTMLDivElement => Boolean(node));

    if (!section || steps.length !== STEP_ITEMS.length) return;

    ensureScrollTrigger();
    const scroller = resolveScroller(scrollContainerRef);

    const ctx = gsap.context(() => {
      gsap.set(steps, {
        autoAlpha: 0,
        y: 56,
      });

      const heights = steps.map((el) => el.getBoundingClientRect().height);
      const offsets = new Array(steps.length).fill(0);

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: () => `+=${window.innerHeight * (steps.length * 0.72 + 1.9)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      steps.forEach((step, index) => {
        if (index > 0) {
          const push = heights[index] + STEP_GAP_PX;

          for (let prev = 0; prev < index; prev += 1) {
            offsets[prev] -= push;
            tl.to(
              steps[prev],
              {
                y: offsets[prev],
                duration: 0.28,
              },
              '<'
            );
          }
        }

        tl.to(
          step,
          {
            autoAlpha: 1,
            y: offsets[index],
            duration: 0.44,
          },
          index > 0 ? '<' : '+=0.1'
        );

        tl.to({}, { duration: 0.18 });
      });

      tl.to({}, { duration: 0.55 });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef]);

  return (
    <section id={id} ref={sectionRef} className="section experiment-trio" aria-label="What we do scroll story">
      <div className="experiment-trio__viewport">
        <div className="experiment-trio__flow">
          {STEP_ITEMS.map((step, index) => (
            <div
              key={step.key}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              className={step.className}
            >
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
