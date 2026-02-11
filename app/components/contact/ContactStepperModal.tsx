'use client';

import { useEffect, useMemo, useState } from 'react';
import Stepper, { Step } from '../Stepper/Stepper';

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  companySize: string;
  productInterest: string;
  timeline: string;
  message: string;
  consent: boolean;
  website?: string;
};

type ContactStepperModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ContactStepperModal({ open, onClose }: ContactStepperModalProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitErrorText = 'Something went wrong. Please try again.';
  const [touched, setTouched] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const successMessage =
    'Request sent. We will contact you within the timeframe you indicated. Thank you!';
  const [formState, setFormState] = useState<ContactFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    companySize: '',
    productInterest: '',
    timeline: '',
    message: '',
    consent: false,
    website: '',
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    setStatus('idle');
    setTouched(false);
    setSubmitError(null);
    setCurrentStep(1);
  }, [open]);

  const handleChange = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(formState.firstName && formState.lastName && formState.email);
      case 2:
        return Boolean(formState.company && formState.role && formState.companySize);
      case 3:
        return Boolean(formState.productInterest && formState.timeline && formState.message);
      case 4:
        return formState.consent;
      default:
        return false;
    }
  }, [formState, currentStep]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isStepValid) return;
    setStatus('submitting');
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        setStatus('error');
        setSubmitError(submitErrorText);
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setSubmitError(submitErrorText);
    }
  };

  if (!open) return null;

  return (
    <div className="contact-modal" role="dialog" aria-modal="true" aria-label="Contact wizard">
      <div className="contact-modal-overlay" onClick={onClose} />

      <button
        className="contact-modal-close"
        type="button"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <div className="contact-modal-card" role="document">
        <div className="contact-modal-content">
          <header className="contact-modal-header">
            <p className="contact-modal-eyebrow">QuantEnt Contact</p>
            <h3>Let’s connect</h3>
            <p className="contact-modal-subtitle">
              A short wizard to route your request to the right team.
            </p>
          </header>


          <input
            className="hp-field"
            type="text"
            name="website"
            value={formState.website || ''}
            onChange={(event) => handleChange('website', event.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
          />

          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              setCurrentStep(step);
              setTouched(false);
            }}
            onFinalStepCompleted={handleSubmit}
            backButtonText="Previous"
            nextButtonText="Next"
            nextButtonProps={{
              disabled: status === 'submitting' || !isStepValid,
            }}
          >
            <Step>
              <div className="contact-form-grid">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={formState.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    placeholder="Jordan"
                    required
                  />
                  {touched && !formState.firstName && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={formState.lastName}
                    onChange={(event) => handleChange('lastName', event.target.value)}
                    placeholder="Lee"
                    required
                  />
                  {touched && !formState.lastName && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="email">Work email</label>
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="jordan@company.com"
                    required
                  />
                  {touched && !formState.email && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </Step>

            <Step>
              <div className="contact-form-grid">
                <div className="field">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    type="text"
                    value={formState.company}
                    onChange={(event) => handleChange('company', event.target.value)}
                    placeholder="QuantEnt"
                    required
                  />
                  {touched && !formState.company && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="role">Role or title</label>
                  <input
                    id="role"
                    type="text"
                    value={formState.role}
                    onChange={(event) => handleChange('role', event.target.value)}
                    placeholder="VP, Governance"
                    required
                  />
                  {touched && !formState.role && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="companySize">Company size</label>
                  <select
                    id="companySize"
                    value={formState.companySize}
                    onChange={(event) => handleChange('companySize', event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-250">51-250 employees</option>
                    <option value="251-1000">251-1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                  {touched && !formState.companySize && <span className="field-error">Required</span>}
                </div>
              </div>
            </Step>

            <Step>
              <div className="contact-form-grid">
                <div className="field">
                  <label htmlFor="productInterest">Area of interest</label>
                  <select
                    id="productInterest"
                    value={formState.productInterest}
                    onChange={(event) => handleChange('productInterest', event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="QuantCertify">QuantCertify</option>
                    <option value="QuantVault">QuantVault</option>
                    <option value="QuantData">QuantData</option>
                    <option value="Services">Services</option>
                    <option value="General">General inquiry</option>
                  </select>
                  {touched && !formState.productInterest && <span className="field-error">Required</span>}
                </div>
                <div className="field">
                  <label htmlFor="timeline">Desired timeline</label>
                  <select
                    id="timeline"
                    value={formState.timeline}
                    onChange={(event) => handleChange('timeline', event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Immediate">Immediate</option>
                    <option value="This quarter">This quarter</option>
                    <option value="Next quarter">Next quarter</option>
                    <option value="Exploring">Just exploring</option>
                  </select>
                  {touched && !formState.timeline && <span className="field-error">Required</span>}
                </div>
                <div className="field field-full">
                  <label htmlFor="message">What would you like to achieve?</label>
                  <textarea
                    id="message"
                    value={formState.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    placeholder="Tell us about your governance goals and current challenges."
                    rows={4}
                    required
                  />
                  {touched && !formState.message && <span className="field-error">Required</span>}
                </div>
              </div>
            </Step>

            <Step>
              <div className="contact-review">
                <div className="review-grid">
                  <div>
                    <span className="review-label">Name</span>
                    <p>{formState.firstName} {formState.lastName}</p>
                  </div>
                  <div>
                    <span className="review-label">Email</span>
                    <p>{formState.email}</p>
                  </div>
                  <div>
                    <span className="review-label">Company</span>
                    <p>{formState.company}</p>
                  </div>
                  <div>
                    <span className="review-label">Role</span>
                    <p>{formState.role}</p>
                  </div>
                  <div>
                    <span className="review-label">Interest</span>
                    <p>{formState.productInterest}</p>
                  </div>
                  <div>
                    <span className="review-label">Timeline</span>
                    <p>{formState.timeline}</p>
                  </div>
                  <div className="review-message">
                    <span className="review-label">Message</span>
                    <p>{formState.message}</p>
                  </div>
                </div>

                <label className="consent">
                  <input
                    type="checkbox"
                    checked={formState.consent}
                    onChange={(event) => handleChange('consent', event.target.checked)}
                  />
                  I agree to be contacted by the QuantEnt team about this request.
                </label>
                {touched && !formState.consent && <span className="field-error">Consent required</span>}

              </div>
            </Step>
          </Stepper>

          {status === 'success' && (
            <div className="contact-success">
              <strong>{successMessage}</strong>
            </div>
          )}
          {submitError && (
            <small className="muted" role="alert">
              {submitError}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}
