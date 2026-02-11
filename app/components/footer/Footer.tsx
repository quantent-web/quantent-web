'use client';

import { useState, type FormEvent } from 'react';
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

export default function Footer() {
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
