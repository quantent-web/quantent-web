import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Responsible business at QuantEnt',
  description:
    'QuantEnt’s public environmental, social, governance, accessibility and responsible-digital commitments.',
  alternates: { canonical: '/responsible-business' },
};

const commitments = [
  {
    number: '01',
    title: 'Climate & environment',
    content: (
      <>
        <p>We measure our carbon footprint every year across Scopes 1, 2 and 3 (GHG Protocol) and are working toward net-zero by 2030, with an interim milestone of halving our per-person emissions by 2027. We already offset the emissions from our business travel, and we’re extending offsetting across our full operational footprint so that our operations become carbon-neutral.</p>
        <p>We keep that footprint low by design: we work fully remotely, so there’s no office to heat, cool or commute to; we travel only when it genuinely adds value, in economy class and with every trip offset; and we take a circular approach to IT — buying durable or refurbished equipment, keeping it in service for at least five years, and recycling it responsibly at end of life.</p>
      </>
    ),
  },
  {
    number: '02',
    title: 'Diversity, equity & inclusion',
    content: <p>We are building an inclusive workplace where people of every background are treated with respect, paid and promoted fairly, and free from discrimination and harassment. We recruit inclusively, keep our hiring process accessible, and support access to work for people who face barriers to it. We align our approach with the principles of the UN Global Compact and keep it under regular review as we grow.</p>,
  },
  {
    number: '03',
    title: 'Nature & biodiversity',
    content: <p>We are committed to protecting natural capital and biodiversity. As a remote digital business our direct impact is small, but we don’t ignore the indirect impacts embedded in the energy, hardware and data services we rely on. We analyse those impacts and act to reduce them — from extending the life of our hardware to choosing responsible cloud providers and offsetting residual carbon in ways that also benefit nature.</p>,
  },
  {
    number: '04',
    title: 'Responsible digital & accessibility',
    content: <p>Software is what we do, so it’s where we can do the most good. We design digital products to be frugal with energy and data, privacy-respecting and GDPR-aligned, following recognised responsible-digital principles. And we build for everyone: we target WCAG 2.1 level AA accessibility on the products we deliver, test against it before launch, and publish an accessibility statement so anyone can see where we stand — and tell us where we can do better.</p>,
  },
  {
    number: '05',
    title: 'Ethics & responsible sourcing',
    content: <p>We do business with honesty and integrity, with zero tolerance for bribery and corruption, and we respect human rights in line with the UN Global Compact and the core conventions of the International Labour Organization. We extend the same expectations to our supply chain through a Supplier Code of Conduct, and we deliberately favour smaller, diverse and social-enterprise suppliers.</p>,
  },
  {
    number: '06',
    title: 'How we hold ourselves to account',
    content: <p>Responsibility isn’t a side project here — our Founder & Director owns it directly. We set annual ESG objectives, track them against clear indicators, train everyone on the team, and review our policies at least once a year. And to have our approach checked by someone other than us, we’re pursuing independent validation through EcoVadis.</p>,
  },
];

export default function ResponsibleBusinessPage() {
  return (
    <div className="responsible-page">
      <header className="responsible-nav">
        <Link href="/" aria-label="QuantEnt home">
          <Image src="/logo-quantent.svg" alt="QuantEnt" width={180} height={41} priority />
        </Link>
        <Link href="/#contact" className="btn btn-primary">Talk with us</Link>
      </header>

      <main className="responsible-main">
        <header className="responsible-hero">
          <p className="responsible-eyebrow">Our public commitments</p>
          <h1>Responsible business at QuantEnt</h1>
          <p className="responsible-intro">We’re a small, fully remote consulting and software-development firm — and we hold ourselves to serious environmental, social and governance standards regardless of our size. This page sets out our public commitments and how we hold ourselves to them.</p>
          <p className="responsible-updated">Last updated: <time dateTime="2026-07">July 2026</time></p>
        </header>

        <div className="responsible-commitments">
          {commitments.map((commitment) => (
            <section className="responsible-commitment" key={commitment.number}>
              <p className="responsible-number" aria-hidden="true">{commitment.number}</p>
              <div>
                <h2>{commitment.title}</h2>
                {commitment.content}
              </div>
            </section>
          ))}
        </div>

        <aside className="responsible-honesty" aria-labelledby="honesty-title">
          <p className="responsible-eyebrow">Transparency</p>
          <h2 id="honesty-title">We keep this honest.</h2>
          <p>Where something above is a target or still in progress, we say so rather than claim it as done. If you’d like to see the underlying policy or the evidence behind a commitment, just ask.</p>
          <p><strong>Talk to us:</strong> Questions about our responsible-business practices, or want to see one of our policies? We’re happy to share.</p>
          <a className="btn btn-primary" href="mailto:contact@quant-ent.com">Email contact@quant-ent.com</a>
        </aside>
      </main>

      <footer className="responsible-footer">
        <p>Responsible by design — low-carbon operations, an inclusive workplace, accessible software.</p>
        <Link href="/">Back to QuantEnt</Link>
      </footer>
    </div>
  );
}
