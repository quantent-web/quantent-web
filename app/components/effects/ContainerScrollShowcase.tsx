'use client';

import Image from 'next/image';
import { ContainerScroll } from '../ui/container-scroll-animation';

export default function ContainerScrollShowcase() {
  return (
    <section id="container-scroll" className="container-scroll-section" aria-label="Container scroll animation">
      <div className="container-scroll-section__inner">
        <ContainerScroll
          titleComponent={(
            <>
              <p className="container-scroll-section__eyebrow">QuantEnt platform</p>
              <h2 className="container-scroll-section__title">
                Unleash the power
                <span>Our Products</span>
              </h2>
            </>
          )}
        >
          <Image
            src="/system-analysis-icon.png"
            alt="QuantEnt analytics preview"
            width={1400}
            height={720}
            className="container-scroll-section__image"
            draggable={false}
            priority={false}
          />
        </ContainerScroll>
      </div>
    </section>
  );
}
