'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { LegalTriggers, type LegalType } from '../legal/LegalDocuments';

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/quantent-technologies',
    icon: (
      <path d="M6.5 8.5h3v9h-3v-9Zm1.5-4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm5.5 4.5h2.9v1.2h.1c.4-.7 1.4-1.4 2.9-1.4 3.1 0 3.6 2 3.6 4.6v4.6h-3V13.5c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7v4.1h-3v-9Z" />
    ),
  },
];

type FooterProps = {
  onOpenLegal: (type: LegalType) => void;
};

export default function Footer({ onOpenLegal }: FooterProps) {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const year = new Date().getFullYear();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('success');
  };

  return (
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
              <p className="footer-form__subtitle">Get the latest QuantEnt insights in your inbox.</p>
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
          <LegalTriggers onOpen={onOpenLegal} />
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
  );
}
