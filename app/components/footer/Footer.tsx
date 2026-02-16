'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    icon: (
      <path d="M6.5 8.5h3v9h-3v-9Zm1.5-4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm5.5 4.5h2.9v1.2h.1c.4-.7 1.4-1.4 2.9-1.4 3.1 0 3.6 2 3.6 4.6v4.6h-3V13.5c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7v4.1h-3v-9Z" />
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    icon: (
      <path d="M4.5 4h3.8l3 4.4L15.6 4H19l-6.2 6.9L19.5 20h-3.8l-3.5-5.1L8 20H4.5l6.7-7.5L4.5 4Z" />
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: (
      <path d="M12 3C6.5 3 2 7.6 2 13.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 .9.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.1-1.2 3-.9 3-.9.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.8 0 3.9-2.4 4.7-4.6 5 .4.4.8 1 .8 2.1v3.1c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 7.6 17.5 3 12 3Z" />
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    icon: (
      <path d="M22 9.9c0-1.5-1.1-2.7-2.6-2.9C17.7 6.7 12 6.7 12 6.7s-5.7 0-7.4.3C3.1 7.2 2 8.4 2 9.9v4.2c0 1.5 1.1 2.7 2.6 2.9 1.7.3 7.4.3 7.4.3s5.7 0 7.4-.3c1.5-.2 2.6-1.4 2.6-2.9V9.9Zm-11 5.3V9.8l4.8 2.7-4.8 2.7Z" />
    ),
  },
];

type LegalType = 'privacy' | 'terms' | 'cookies';

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
};

export default function Footer() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [activeLegalModal, setActiveLegalModal] = useState<LegalType | null>(null);
  const year = new Date().getFullYear();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('success');
  };

  useEffect(() => {
    if (!activeLegalModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveLegalModal(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [activeLegalModal]);

  return (
    <>
      <footer className="site-footer" aria-labelledby="footer-heading">
        <div className="footer-card">
          <div className="footer-top">
            <div className="footer-brand">
              <Image src="/logo-quantent.svg" alt="QuantEnt logo" width={160} height={36} />
              <span className="sr-only" id="footer-heading">
                QuantEnt
              </span>
            </div>

            <form className="footer-form" onSubmit={handleSubmit}>
              <div className="footer-form__intro">
                <p className="footer-form__title">Stay up to date</p>
                <p className="footer-form__subtitle">
                  Get the latest QuantEnt insights in your inbox.
                </p>
              </div>

              <div className="footer-form__controls">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <button className="btn btn-primary" type="submit">
                  Subscribe
                </button>
              </div>

              {status === 'success' ? (
                <p className="footer-form__feedback" role="status">
                  Thanks for subscribing!
                </p>
              ) : null}
            </form>
          </div>

          <div className="footer-divider" aria-hidden="true" />

          <div className="footer-bottom">
            <p className="footer-copy">© {year} QuantEnt. All rights reserved.</p>
            <nav className="footer-copy" aria-label="Legal links">
              <button type="button" className="footer-legal-trigger" onClick={() => setActiveLegalModal('privacy')}>
                Privacy
              </button>
              {' · '}
              <button type="button" className="footer-legal-trigger" onClick={() => setActiveLegalModal('terms')}>
                Terms
              </button>
              {' · '}
              <button type="button" className="footer-legal-trigger" onClick={() => setActiveLegalModal('cookies')}>
                Cookies
              </button>
            </nav>
            <div className="footer-socials" aria-label="QuantEnt social links">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="footer-socials__link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`QuantEnt on ${link.label}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {link.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {activeLegalModal ? (
        <div className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-dialog-title">
          <button
            type="button"
            className="legal-dialog__overlay"
            aria-label="Close legal dialog"
            onClick={() => setActiveLegalModal(null)}
          />
          <div className="legal-dialog__content" role="document">
            <header className="legal-dialog__header">
              <div>
                <h3 id="legal-dialog-title">{LEGAL_CONTENT[activeLegalModal].title}</h3>
                <p>{LEGAL_CONTENT[activeLegalModal].description}</p>
              </div>
              <button
                type="button"
                className="legal-dialog__close"
                onClick={() => setActiveLegalModal(null)}
                aria-label="Close legal dialog"
              >
                ×
              </button>
            </header>
            <div className="legal-dialog__scrollable">{LEGAL_CONTENT[activeLegalModal].body}</div>
            <div className="legal-dialog__footer">
              <button type="button" className="btn btn-primary" onClick={() => setActiveLegalModal(null)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
