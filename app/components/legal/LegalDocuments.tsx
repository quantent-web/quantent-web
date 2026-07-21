'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';

export type LegalType = 'privacy' | 'terms' | 'cookies' | 'responsible-business';

const LEGAL_CONTENT: Record<
  LegalType,
  {
    title: string;
    description: string;
    body: ReactNode;
  }
> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'Please review how we handle personal information.',
    body: (
      <>
        <p>
          This Privacy Policy explains how QuantEnt handles personal information submitted through
          this website.
        </p>
        <h4>What data we collect</h4>
        <p>We collect only the information you choose to provide through our contact form, such as:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Company name (if provided)</li>
          <li>Message content</li>
        </ul>
        <h4>Why we collect data</h4>
        <p>We use this information to:</p>
        <ul>
          <li>Respond to your inquiries</li>
          <li>Follow up on requested information about our services</li>
          <li>Maintain basic communication records</li>
        </ul>
        <h4>Legal basis</h4>
        <p>
          Depending on the context, our legal basis is your consent (when you submit the form)
          and/or our legitimate interest in responding to business inquiries.
        </p>
        <h4>Data retention</h4>
        <p>
          We retain contact form submissions for a reasonable period needed to manage communication
          and business follow-up, generally up to 12 months, unless a longer period is required by
          law or justified by an ongoing relationship.
        </p>
        <h4>Data sharing</h4>
        <p>
          We do not sell personal data. We may share information only with service providers that
          help us operate this website or communication tools, and only when necessary.
        </p>
        <h4>Your rights</h4>
        <p>Subject to applicable law, you may request:</p>
        <ul>
          <li>Access to your personal data</li>
          <li>Rectification of inaccurate data</li>
          <li>Deletion of your data</li>
        </ul>
        <h4>Contact</h4>
        <p>
          For privacy-related requests, contact:{' '}
          <a href="mailto:privacy@yourcompany.com">privacy@yourcompany.com</a>
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Use',
    description: 'Please review the terms that govern use of this website.',
    body: (
      <>
        <p>These Terms of Use govern your access to and use of the QuantEnt website.</p>
        <h4>Use of website</h4>
        <p>
          You agree to use this website lawfully and in a way that does not disrupt its operation,
          compromise security, or infringe on the rights of others.
        </p>
        <h4>Intellectual property</h4>
        <p>
          Unless otherwise stated, website content, branding, text, graphics, and related materials
          are owned by or licensed to QuantEnt and are protected by applicable intellectual
          property laws.
        </p>
        <h4>Disclaimer</h4>
        <p>
          Content on this website is provided for general informational purposes only. While we aim
          to keep information accurate and up to date, we make no guarantees regarding
          completeness, accuracy, or fitness for a particular purpose.
        </p>
        <h4>Limitation of liability</h4>
        <p>
          To the extent permitted by law, QuantEnt is not liable for indirect, incidental, or
          consequential damages arising from the use of, or inability to use, this website.
        </p>
        <h4>Changes to these terms</h4>
        <p>
          We may update these Terms of Use from time to time. Updated terms take effect when
          published on this page.
        </p>
        <h4>Contact</h4>
        <p>
          For questions about these terms, contact:{' '}
          <a href="mailto:privacy@yourcompany.com">privacy@yourcompany.com</a>
        </p>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'Please review how we use cookies and related technologies.',
    body: (
      <>
        <p>This Cookie Policy explains how QuantEnt uses cookies and similar technologies.</p>
        <h4>Current use of cookies</h4>
        <p>
          At this stage, we do not use tracking or advertising cookies for analytics, profiling, or
          behavioral marketing.
        </p>
        <h4>Essential cookies</h4>
        <p>
          The website may use essential technical cookies required for core functionality,
          security, and basic site operation.
        </p>
        <h4>Managing cookies</h4>
        <p>You can control or delete cookies through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>View stored cookies</li>
          <li>Delete all or selected cookies</li>
          <li>Block cookies for specific sites</li>
          <li>Block all cookies</li>
        </ul>
        <p>Disabling essential cookies may affect website functionality.</p>
        <h4>Updates to this policy</h4>
        <p>
          We may update this policy if our cookie practices change. Any updates will be posted on
          this page.
        </p>
      </>
    ),
  },
  'responsible-business': {
    title: 'Responsible business at QuantEnt',
    description: 'Our public environmental, social and governance commitments. Last updated July 2026.',
    body: (
      <>
        <p>
          We’re a small, fully remote consulting and software-development firm — and we hold
          ourselves to serious environmental, social and governance standards regardless of our
          size. This page sets out our public commitments and how we hold ourselves to them.
        </p>

        <h4>01 · Climate &amp; environment</h4>
        <p>
          We measure our carbon footprint every year across Scopes 1, 2 and 3 (GHG Protocol) and
          are working toward net-zero by 2030, with an interim milestone of halving our per-person
          emissions by 2027. We already offset the emissions from our business travel, and we’re
          extending offsetting across our full operational footprint so that our operations become
          carbon-neutral.
        </p>
        <p>
          We keep that footprint low by design: we work fully remotely, so there’s no office to
          heat, cool or commute to; we travel only when it genuinely adds value, in economy class
          and with every trip offset; and we take a circular approach to IT — buying durable or
          refurbished equipment, keeping it in service for at least five years, and recycling it
          responsibly at end of life.
        </p>

        <h4>02 · Diversity, equity &amp; inclusion</h4>
        <p>
          We are building an inclusive workplace where people of every background are treated with
          respect, paid and promoted fairly, and free from discrimination and harassment. We
          recruit inclusively, keep our hiring process accessible, and support access to work for
          people who face barriers to it. We align our approach with the principles of the UN
          Global Compact and keep it under regular review as we grow.
        </p>

        <h4>03 · Nature &amp; biodiversity</h4>
        <p>
          We are committed to protecting natural capital and biodiversity. As a remote digital
          business our direct impact is small, but we don’t ignore the indirect impacts embedded in
          the energy, hardware and data services we rely on. We analyse those impacts and act to
          reduce them — from extending the life of our hardware to choosing responsible cloud
          providers and offsetting residual carbon in ways that also benefit nature.
        </p>

        <h4>04 · Responsible digital &amp; accessibility</h4>
        <p>
          Software is what we do, so it’s where we can do the most good. We design digital products
          to be frugal with energy and data, privacy-respecting and GDPR-aligned, following
          recognised responsible-digital principles. And we build for everyone: we target WCAG 2.1
          level AA accessibility on the products we deliver, test against it before launch, and
          publish an accessibility statement so anyone can see where we stand — and tell us where
          we can do better.
        </p>

        <h4>05 · Ethics &amp; responsible sourcing</h4>
        <p>
          We do business with honesty and integrity, with zero tolerance for bribery and
          corruption, and we respect human rights in line with the UN Global Compact and the core
          conventions of the International Labour Organization. We extend the same expectations to
          our supply chain through a Supplier Code of Conduct, and we deliberately favour smaller,
          diverse and social-enterprise suppliers.
        </p>

        <h4>06 · How we hold ourselves to account</h4>
        <p>
          Responsibility isn’t a side project here — our Founder &amp; Director owns it directly. We
          set annual ESG objectives, track them against clear indicators, train everyone on the
          team, and review our policies at least once a year. And to have our approach checked by
          someone other than us, we’re pursuing independent validation through EcoVadis.
        </p>

        <h4>We keep this honest</h4>
        <p>
          Where something above is a target or still in progress, we say so rather than claim it as
          done. If you’d like to see the underlying policy or the evidence behind a commitment,
          just ask.
        </p>
        <p>
          <strong>Talk to us:</strong> Questions about our responsible-business practices, or want
          to see one of our policies? We’re happy to share. Email{' '}
          <a href="mailto:contact@quant-ent.com">contact@quant-ent.com</a>.
        </p>
      </>
    ),
  },
};

type LegalTriggersProps = {
  onOpen: (type: LegalType) => void;
  className?: string;
};

export function LegalTriggers({ onOpen, className = 'footer-copy' }: LegalTriggersProps) {
  return (
    <nav className={className} aria-label="Legal links">
      <Link
        href="/privacy"
        className="footer-legal-trigger"
        onClick={(event) => {
          event.preventDefault();
          onOpen('privacy');
        }}
      >
        Privacy
      </Link>
      {' · '}
      <Link
        href="/terms"
        className="footer-legal-trigger"
        onClick={(event) => {
          event.preventDefault();
          onOpen('terms');
        }}
      >
        Terms
      </Link>
      {' · '}
      <Link
        href="/cookies"
        className="footer-legal-trigger"
        onClick={(event) => {
          event.preventDefault();
          onOpen('cookies');
        }}
      >
        Cookies
      </Link>
      {' · '}
      <Link
        href="/responsible-business"
        className="footer-legal-trigger"
        onClick={(event) => {
          event.preventDefault();
          onOpen('responsible-business');
        }}
      >
        Responsible business
      </Link>
    </nav>
  );
}

type LegalDialogProps = {
  activeLegalModal: LegalType | null;
  onClose: () => void;
};

export function LegalDialog({ activeLegalModal, onClose }: LegalDialogProps) {
  useEffect(() => {
    if (!activeLegalModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [activeLegalModal, onClose]);

  if (!activeLegalModal) return null;

  return (
    <div className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-dialog-title">
      <button
        type="button"
        className="legal-dialog__overlay"
        aria-label="Close legal dialog"
        onClick={onClose}
      />
      <div className="legal-dialog__content" role="document">
        <header className="legal-dialog__header">
          <div>
            <h3 id="legal-dialog-title">{LEGAL_CONTENT[activeLegalModal].title}</h3>
            <p>{LEGAL_CONTENT[activeLegalModal].description}</p>
          </div>
          <button type="button" className="legal-dialog__close" onClick={onClose} aria-label="Close legal dialog">
            ×
          </button>
        </header>
        <div className="legal-dialog__scrollable">{LEGAL_CONTENT[activeLegalModal].body}</div>
        <div className="legal-dialog__footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
