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
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const year = new Date().getFullYear();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || status === 'submitting') {
      return;
    }

    setSubmitError(null);
    setStatus('submitting');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), hp }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string; debug?: unknown } | null;
        const serverError = data?.error?.trim() || 'We could not process your request. Please try again.';
        setSubmitError(serverError);
        setStatus('error');
        if (process.env.NODE_ENV !== 'production') {
          console.error('newsletter failed', response.status, serverError, data?.debug);
        }
        return;
      }

      setStatus('success');
    } catch {
      const fallbackError = 'We could not process your request. Please try again.';
      setSubmitError(fallbackError);
      setStatus('error');
      if (process.env.NODE_ENV !== 'production') {
        console.error('newsletter failed', 0, fallbackError);
      }
    }
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

            <input
              className="hp-field"
              type="text"
              name="hp"
              value={hp}
              onChange={(event) => setHp(event.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
            />

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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
              </button>
            </div>

            {status === 'success' ? (
              <p className="footer-form__feedback" role="status">
                Thanks for subscribing!
              </p>
            ) : null}
            {status === 'error' ? (
              <p className="footer-form__feedback" role="alert">
                {submitError || 'We could not process your request. Please try again.'}
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
