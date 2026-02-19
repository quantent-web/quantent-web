'use client';

import { useEffect, type ReactNode } from 'react';

export type LegalType = 'privacy' | 'terms' | 'cookies';

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

type LegalTriggersProps = {
  onOpen: (type: LegalType) => void;
  className?: string;
};

export function LegalTriggers({ onOpen, className = 'footer-copy' }: LegalTriggersProps) {
  return (
    <nav className={className} aria-label="Legal links">
      <button type="button" className="footer-legal-trigger" onClick={() => onOpen('privacy')}>
        Privacy
      </button>
      {' · '}
      <button type="button" className="footer-legal-trigger" onClick={() => onOpen('terms')}>
        Terms
      </button>
      {' · '}
      <button type="button" className="footer-legal-trigger" onClick={() => onOpen('cookies')}>
        Cookies
      </button>
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
