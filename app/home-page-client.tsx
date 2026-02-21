'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import Image from 'next/image';
import DotGrid from './components/DotGrid/DotGrid';
import BlurText from './components/BlurText/BlurText';
import DecryptedText from './components/DecryptedText/DecryptedText';
import { Badge } from './components/ui/badge';
import Particles from './components/ui/Particles';
import Footer from './components/footer/Footer';
import ContactStepperModal from './components/contact/ContactStepperModal';
import { LegalDialog, type LegalType } from './components/legal/LegalDocuments';
import { useLenis } from './home/useLenis';
import { useAnchorScroll } from './home/useAnchorScroll';

type NavItem = { label: string; href: `#${string}` };

type InlineContactForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  website: string;
};

export default function Home() {
  const { scrollTo, programmaticDurationMs } = useLenis();
  const enableSnapScroll = false;
  const navRef = useRef<HTMLElement | null>(null);

  const navInnerRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const linksRef = useRef<HTMLDivElement | null>(null);

  const { scrollToHash } = useAnchorScroll({ scrollTo, navRef });

  const [menuOpen, setMenuOpen] = useState(false);
  const [useBurger, setUseBurger] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalType | null>(null);
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactTouched, setContactTouched] = useState(false);
  const [contactForm, setContactForm] = useState<InlineContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    website: '',
  });

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'What we do', href: '#what-we-do' },
      { label: 'What Makes QuantEnt Different', href: '#different' },
      { label: 'Products', href: '#products' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
    []
  );
  const [activeHref, setActiveHref] = useState('#what-we-do');
  const isProgrammaticScroll = useRef(false);
  const pendingTargetHref = useRef<string | null>(null);
  const programmaticScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cierra menú con ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Bloquea scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Scroll spy reactivo compatible con secciones sticky
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (!sections.length) return;

    const navIds = new Set(navItems.map((item) => item.href.replace('#', '')));
    const visibility = new Map<string, number>();

    const updateActiveFromScroll = () => {
      if (isProgrammaticScroll.current) return;

      const navHeight = navRef.current?.offsetHeight ?? 0;
      const probeY = navHeight + Math.max(window.innerHeight * 0.2, 120);
      let nextActive: string | null = null;

      for (const section of sections) {
        if (!navIds.has(section.id)) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= navHeight + 12) {
          nextActive = `#${section.id}`;
        }
      }

      if (!nextActive) {
        let bestId: string | null = null;
        let bestRatio = -1;

        visibility.forEach((ratio, id) => {
          if (!navIds.has(id)) return;
          if (ratio > bestRatio) {
            bestId = id;
            bestRatio = ratio;
          }
        });

        if (bestId) nextActive = `#${bestId}`;
      }

      if (nextActive) setActiveHref(nextActive);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        updateActiveFromScroll();
      },
      {
        rootMargin: '-10% 0px -55% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.7, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateActiveFromScroll);
    };
  }, [navItems]);

  // Detecta si el nav “rompe” (wrap) y activa hamburguesa justo en ese punto
  useEffect(() => {
    const check = () => {
      const navEl = navRef.current;
      const navInnerEl = navInnerRef.current;
      const brandEl = brandRef.current;
      const burgerEl = burgerRef.current;
      const linksRowEl = linksRef.current;

      if (!navEl || !navInnerEl || !brandEl || !burgerEl || !linksRowEl) return;

      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      // Altura de una sola línea (tu mismo valor)
      const singleLineHeight = 44;
      const isWrapped = linksRowEl.offsetHeight > singleLineHeight;

      // gap real del flex (nav-inner)
      const styles = window.getComputedStyle(navInnerEl);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;

      // ancho disponible REAL dentro del nav-inner para los links
      const availableWidth =
        navInnerEl.clientWidth -
        brandEl.offsetWidth -
        burgerEl.offsetWidth -
        gap * 2;

      const neededWidth = linksRowEl.scrollWidth;

      // tolerancia para evitar “parpadeos”
      const overflowed = neededWidth > availableWidth + 4;

      const shouldBurger = isMobile || isWrapped || overflowed;

      setUseBurger(shouldBurger);
      if (!shouldBurger) setMenuOpen(false);
    };

    const raf = requestAnimationFrame(check);

    // Re-medir cuando cargan las fuentes (evita falsos cálculos)
    // @ts-ignore
    document.fonts?.ready?.then(() => check());


    const ro = new ResizeObserver(() => check());

    if (navRef.current) ro.observe(navRef.current);
    if (navInnerRef.current) ro.observe(navInnerRef.current);
    if (brandRef.current) ro.observe(brandRef.current);
    if (burgerRef.current) ro.observe(burgerRef.current);

    window.addEventListener('resize', check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', check);
      ro.disconnect();
    };
  }, []);


  const clearProgrammaticScrollState = useCallback(() => {
    if (programmaticScrollTimeoutRef.current) {
      clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = null;
    }

    isProgrammaticScroll.current = false;
    pendingTargetHref.current = null;
  }, []);

  const runProgrammaticScroll = useCallback((href: `#${string}`, opts?: { immediate?: boolean }) => {
    const immediate = opts?.immediate ?? false;

    clearProgrammaticScrollState();

    if (immediate) {
      scrollToHash(href, { immediate: true });
      setActiveHref(href);
      return;
    }

    isProgrammaticScroll.current = true;
    pendingTargetHref.current = href;
    setActiveHref(href);

    const durationMs = scrollToHash(href);
    const freezeMs = (durationMs || programmaticDurationMs) + 200;

    programmaticScrollTimeoutRef.current = setTimeout(() => {
      clearProgrammaticScrollState();
    }, freezeMs);
  }, [clearProgrammaticScrollState, programmaticDurationMs, scrollToHash]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: `#${string}`) => {
    e.preventDefault();

    if (menuOpen) {
      setMenuOpen(false);
    }

    runProgrammaticScroll(href);
  };
  const closeMenu = () => setMenuOpen(false);
  const openContactStepper = useCallback(() => {
    setIsContactOpen(true);
  }, []);
  const closeContact = () => setIsContactOpen(false);
  const openLegalModal = (type: LegalType) => setActiveLegalModal(type);
  const closeLegalModal = () => setActiveLegalModal(null);

  const isContactInlineValid =
    Boolean(contactForm.name.trim()) &&
    Boolean(contactForm.email.trim()) &&
    Boolean(contactForm.message.trim()) &&
    contactForm.consent;

  const updateInlineContactField = <K extends keyof InlineContactForm>(
    key: K,
    value: InlineContactForm[K]
  ) => {
    setContactForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleInlineContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactTouched(true);

    if (!isContactInlineValid || contactStatus === 'submitting') return;

    setContactStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: contactForm.name.trim(),
          lastName: 'Inline',
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim(),
          company: 'Website lead',
          role: 'Not provided',
          companySize: 'Not provided',
          productInterest: 'General inquiry',
          timeline: 'As soon as possible',
          message: contactForm.message.trim(),
          consent: contactForm.consent,
          hp: contactForm.website,
        }),
      });

      setContactStatus(response.ok ? 'success' : 'error');
      if (response.ok) {
        console.info('Inline contact submit success');
      } else {
        console.error('Inline contact submit failed');
      }
    } catch (error) {
      void error;
      console.error('Inline contact submit failed');
      setContactStatus('error');
    }
  };

  useEffect(() => {
    const hash = window.location.hash as `#${string}` | '';

    if (!hash) return;

    runProgrammaticScroll(hash);
  }, [runProgrammaticScroll]);

  useEffect(() => {
    const onUserScrollIntent = () => {
      if (isProgrammaticScroll.current) {
        clearProgrammaticScrollState();
      }
    };

    window.addEventListener('wheel', onUserScrollIntent, { passive: true });
    window.addEventListener('touchmove', onUserScrollIntent, { passive: true });

    return () => {
      window.removeEventListener('wheel', onUserScrollIntent);
      window.removeEventListener('touchmove', onUserScrollIntent);
      clearProgrammaticScrollState();
    };
  }, [clearProgrammaticScrollState]);

  return (
    <>
      {/* STICKY NAV + DOT GRID BACKGROUND */}
      <div className="header-bg">
        {/* DotGrid fondo */}
        <div className="header-bg__grid">
          <DotGrid
            dotSize={5}
            gap={15}
            proximity={200}
            style={{}}
          />
        </div>

        {/* STICKY NAV */}
        <header className="nav header-bg__nav" ref={navRef}>
          <div className="nav-inner nav-container" ref={navInnerRef}>
            <a
              className="nav-brand"
              href="#top"
              aria-label="Go to top"
              ref={brandRef}
            >
              <Image
                src="/logo-quantent.svg"
                alt="QuantEnt logo"
                width={160}
                height={36}
                priority
              />
            </a>

            {/* Links desktop */}
            <nav
              className={`nav-links ${useBurger ? "is-hidden" : ""}`}
              aria-label="Primary"
            >
              <div className="nav-links-row" ref={linksRef}>
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={activeHref === item.href ? 'nav-link-active' : ''}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Botón hamburguesa */}
            <button
              ref={burgerRef}
              className={`nav-burger ${useBurger ? "" : "is-invisible"}`}
              type="button"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="burger-lines" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main
          id="top"
          className="home-main"
          data-snap-scroll={enableSnapScroll ? 'true' : 'false'}
        >
        <div className="container">
        {/* HOME / HERO */}
        <section id="home" className="section">
          <BlurText
            as="h1"
            className="hero-title"
            text="Creating Institutional Control over Entitlements and Data"
            delay={120}
            animateBy="words"
            direction="top"
          />



          <DecryptedText
            text="Quantitative models and mathematics for entitlement and data governance."
            parentClassName="hero-subtitle"
            animateOn="view"
            speed={45}
            maxIterations={12}
          />

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={openContactStepper}
            >
              Talk to Us
            </button>
            <a className="btn btn-secondary" href="#what-we-do">
              What we do
            </a>
          </div>
        </section>
        </div>

        <section id="what-we-do" className="what-we-do-container section">
          <Particles className="what-we-do-background" particleCount={260} particleBaseSize={110} particleColors={['#ffffff', '#f1f5f9', '#dbeafe']} />
          <div className="header-section">
            <h2>What We Do</h2>
            <p>
              <span className="text-highlight">QuantEnt</span> analyzes and certifies who can access what — and what that data means — using quantitative models instead of static rules.
            </p>
          </div>

          <div id="what-we-do-capabilities" className="what-we-do-capabilities">
            <section className="what-we-do-entitlement-and-user">
              <div className="header-subsection">
                <div className="header-subsection-copy">
                  <h3>Entitlement and User analytics</h3>
                  <p><span className="text-highlight">QuantEnt</span> is built for environments where correctness, scale, and evolution matter.</p>
                </div>
              </div>
              <div className="what-we-do-grid what-we-do-grid--four">
                <article className="card what-we-do-card">
                  <img src="/images/card-icon-quantent.svg" alt="" width="40" height="40" className="what-we-do-icon" />
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">System Analysis</h4>
                    <p className="card-text"><span className="text-highlight">QuantEnt</span> analyzes users, roles, entitlements, and data as interconnected systems</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <img src="/images/card-icon-quantent.svg" alt="" width="40" height="40" className="what-we-do-icon" />
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Quantitative Certification</h4>
                    <p className="card-text"><span className="text-highlight">Certify access</span> and meaning with mathematical rigor</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <img src="/images/card-icon-quantent.svg" alt="" width="40" height="40" className="what-we-do-icon" />
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Risk Detection</h4>
                    <p className="card-text"><span className="text-highlight">Detect drift</span>, over-exposure, and structural risk early</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <img src="/images/card-icon-quantent.svg" alt="" width="40" height="40" className="what-we-do-icon" />
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Continuous Control</h4>
                    <p className="card-text"><span className="text-highlight">Maintain control</span> as systems, data, and organizations evolve</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="what-we-do-data-cleaning">
              <div className="header-subsection">
                <div className="header-subsection-copy">
                  <h3>Data Cleaning, Categorizing, and Governance</h3>
                  <p><span className="text-highlight">QuantEnt</span> structures and governs enterprise data so every dataset is clean, categorized, and controlled with transparent policies</p>
                </div>
              </div>
              <div className="what-we-do-grid what-we-do-grid--two">
                <article className="card what-we-do-card">
                  <h2 className="numbers-section" aria-hidden="true">01</h2>
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">MetaData Tagging</h4>
                    <p className="card-text card-text-secondary">Analyzing and <span className="text-highlight">Tagging APIs</span>, data, applications, and resources for use by users and AI</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <h2 className="numbers-section" aria-hidden="true">02</h2>
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Data Model Rigorization</h4>
                    <p className="card-text card-text-secondary">With software and consulting, our <span className="text-highlight">SMEs</span> will help create, refine, or just critique the data models of the firm</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <h2 className="numbers-section" aria-hidden="true">03</h2>
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Ongoing Cleanliness Certification</h4>
                    <p className="card-text card-text-secondary"><span className="text-highlight">Institutional Data Cleanliness</span> starts at the data model process</p>
                  </div>
                </article>
                <article className="card what-we-do-card">
                  <h2 className="numbers-section" aria-hidden="true">04</h2>
                  <div className="what-we-do-card-copy">
                    <h4 className="card-title">Agentic AI Compatibility</h4>
                    <p className="card-text card-text-secondary">Our future product is designed to make <span className="text-highlight">Agentic AI</span> work with the highest possible confidence level, with the safest data protection possible</p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </section>

        <section id="different" className="different-container section">
          <h2 className="different-title">What Makes<br />QuantEnt Different</h2>

          <div className="different-grid">
            <article className="different-item">
              <Image src="/images/card-icon-quantent.svg" alt="" width={56} height={56} aria-hidden="true" className="different-icon" />
              <h4 className="card-title different-card-title">Quantitative by<br />design</h4>
              <p className="card-text"><span className="text-highlight">Exposure, drift, and structural risk are</span> measured — not guessed.</p>
            </article>

            <article className="different-item">
              <Image src="/images/card-icon-quantent.svg" alt="" width={56} height={56} aria-hidden="true" className="different-icon" />
              <h4 className="card-title different-card-title">AI-native governance</h4>
              <p className="card-text">Built so AI can reason, opine, and alert safely on <span className="text-highlight">entitlements and data.</span></p>
            </article>

            <article className="different-item">
              <Image src="/images/card-icon-quantent.svg" alt="" width={56} height={56} aria-hidden="true" className="different-icon" />
              <h4 className="card-title different-card-title">Designed for<br />complexity</h4>
              <p className="card-text">Proven in financial-services-grade systems with <span className="text-highlight">real risk and regulatory consequences.</span></p>
            </article>

            <article className="different-item">
              <Image src="/images/card-icon-quantent.svg" alt="" width={56} height={56} aria-hidden="true" className="different-icon" />
              <h4 className="card-title different-card-title">Enhances existing IAM</h4>
              <p className="card-text">Integrates with what you already run. <span className="text-highlight">We don’t replace your identity stack — we make it work better.</span></p>
            </article>
          </div>
        </section>

        <section id="products" className="products-container section">
          <Particles className="products-background" particleCount={260} particleBaseSize={110} particleColors={['#ffffff', '#f1f5f9', '#dbeafe']} />
          <h2 className="section-title">Our Products</h2>

          <div className="cards-grid cards-grid--auto products-grid">
            <div className="card product-card">
              <div className="product-card-copy">
                <h3 className="product-card-title">QuantCertify</h3>
                <p className="card-text">Certification with quantitative control.</p>
              </div>
              <div className="card-actions product-card-actions">
                <a className="btn btn-secondary product-card-icon-btn" href="#quantcertify" aria-label="Learn more about QuantCertify">
                  <Image src="/images/product-card-arrow.svg" alt="" width={24} height={24} aria-hidden="true" className="product-card-icon" />
                </a>
              </div>
            </div>

            <div className="card product-card">
              <div className="product-card-copy">
                <h3 className="product-card-title">QuantVault</h3>
                <p className="card-text">Enterprise entitlement intelligence.</p>
              </div>
              <div className="card-actions product-card-actions">
                <a className="btn btn-secondary product-card-icon-btn" href="#quantvault" aria-label="Learn more about QuantVault">
                  <Image src="/images/product-card-arrow.svg" alt="" width={24} height={24} aria-hidden="true" className="product-card-icon" />
                </a>
              </div>
            </div>

            <div className="card product-card">
              <div className="product-card-copy">
                <h3 className="product-card-title">QuantData</h3>
                <p className="card-text">Semantic governance for enterprise data.</p>
              </div>
              <div className="card-actions product-card-actions">
                <a className="btn btn-secondary product-card-icon-btn" href="#quantdata" aria-label="Learn more about QuantData">
                  <Image src="/images/product-card-arrow.svg" alt="" width={24} height={24} aria-hidden="true" className="product-card-icon" />
                </a>
              </div>
            </div>
          </div>

          <div className="cta-strip">
            <p className="cta-text products-cta-text">Talk with us —<br /><span className="products-cta-highlight">Start with QuantCertify</span></p>
            <button className="btn btn-primary" type="button" onClick={openContactStepper}>
              Start
            </button>
          </div>

        {/* QUANTCERTIFY */}
        <section id="quantcertify" className="section container quantcertify-section">
          <div className="quantcertify-grid">
            <div className="qc-row qc-row--hero">
              <div className="qc-cell qc-cell--hero-main">
                <Badge className="qc-badge">Products</Badge>
                <h2>QuantCertify</h2>
                <h3>Certification with Quantitative Control</h3>
              </div>
              <div className="qc-cell qc-cell--hero-note">
                <p>
                  <span className="text-highlight">QuantCertify</span> transforms certification from a
                  periodic compliance exercise into a quantitative control mechanism.
                </p>
              </div>
            </div>

            <div className="qc-row qc-row--title">
              <div className="qc-cell">
                <h4 className="qc-section-label">What It Does</h4>
              </div>
            </div>

            <div className="qc-row qc-row--three-col">
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Quantifies exposure</h4>
                <p className="card-text">Quantifies entitlement exposure, drift, and role integrity using mathematics — not rules.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">System-level analysis</h4>
                <p className="card-text">Analyzes users and entitlements as a system, not isolated records.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">AI opinions & alerts</h4>
                <p className="card-text">Enables AI to opine and alert on access patterns, anomalies, and emerging risk.</p>
              </div>
            </div>

            <div className="qc-row qc-row--three-col">
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Forces clarity</h4>
                <p className="card-text">Forces clarity and ownership during certification.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Prevents rubber-stamping</h4>
                <p className="card-text">Prevents rubber-stamp reviews by surfacing what actually matters.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Focus on material risk</h4>
                <p className="card-text">Institutional Data Cleanliness starts at the data model process</p>
              </div>
            </div>

            <div className="qc-row qc-row--title">
              <div className="qc-cell">
                <h4 className="qc-section-label">Why It’s Different</h4>
              </div>
            </div>

            <div className="qc-row qc-row--two-col">
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Quantifies entitlements</h4>
                <p className="card-text">Quantifies entitlement exposure, drift, and role integrity using mathematics — not rules.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">AI-first architecture</h4>
                <p className="card-text">Built from the ground up with AI in mind, not bolted on later.</p>
              </div>
            </div>

            <div className="qc-row qc-row--two-col">
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Improves over time</h4>
                <p className="card-text">Designed to improve governance quality over time, not degrade.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Risk thinking</h4>
                <p className="card-text">Grounded in quantitative risk thinking, not static policy engines.</p>
              </div>
            </div>

            <div className="qc-row qc-row--title">
              <div className="qc-cell">
                <h4 className="qc-section-label">How It Fits Your Environment</h4>
              </div>
            </div>

            <div className="qc-row qc-row--single">
              <div className="qc-cell qc-cell--note">
                <p className="section-note">QuantCertify does not replace your IAM stack. <span className="text-highlight">It makes it measurably better</span></p>
                <p className="card-text"><span className="text-highlight">QuantCertify</span> integrates with and enhances your existing IAM solutions. It works alongside SailPoint, Okta, Active Directory, and other IAM platforms, adding quantitative insight to existing certification workflows — without disrupting current systems.</p>
              </div>
            </div>

            <div className="qc-row qc-row--title">
              <div className="qc-cell">
                <h4 className="qc-section-label">Outcomes</h4>
              </div>
            </div>

            <div className="qc-row qc-row--three-col">
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">Quantifies exposure</h4>
                <p className="card-text">Quantifies entitlement exposure, drift, and role integrity using mathematics — not rules.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">System-level analysis</h4>
                <p className="card-text">Analyzes users and entitlements as a system, not isolated records.</p>
              </div>
              <div className="qc-cell qc-cell--card">
                <h4 className="card-title">AI opinions & alerts</h4>
                <p className="card-text">Enables AI to opine and alert on access patterns, anomalies, and emerging risk.</p>
              </div>
            </div>
          </div>
        </section>

        </section>

        <div className="container">

        {/* QUANTVAULT */}
        <section id="quantvault" className="section product-detail-section">
          <div className="product-detail-grid product-detail-grid--vault">
            <div className="product-row product-row--hero">
              <div className="product-cell product-cell--hero-main">
                <Badge className="qc-badge">Products</Badge>
                <h2>QuantVault</h2>
                <h3>Enterprise Entitlement Intelligence</h3>
              </div>
              <div className="product-cell product-cell--hero-note">
                <p>
                  <span className="text-highlight">QuantVault</span> provides a system-level view of
                  entitlements across your organization.
                </p>
              </div>
            </div>

            <div className="product-row product-row--title">
              <div className="product-cell">
                <h4 className="qc-section-label">What It Does</h4>
              </div>
            </div>

            <div className="product-row product-row--two-col">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Aggregates entitlements</h4>
                <p className="card-text">Quantifies entitlement exposure, drift, and role integrity using mathematics — not rules.</p>
              </div>
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Unified view</h4>
                <p className="card-text">Analyzes users and entitlements as a system, not isolated records.</p>
              </div>
            </div>

            <div className="product-row product-row--two-col">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Cross-system analysis</h4>
                <p className="card-text">Enables cross-system analysis of entitlement structure and risk.</p>
              </div>
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Governance foundation</h4>
                <p className="card-text">Foundation for quantitative entitlement governance at scale.</p>
              </div>
            </div>

            <div className="product-row product-row--title">
              <div className="product-cell">
                <h4 className="qc-section-label">Relationship to QuantCertify</h4>
              </div>
            </div>

            <div className="product-row product-row--two-col">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Runs on top</h4>
                <p className="card-text">QuantCertify runs on top of QuantVault.</p>
              </div>
              <div className="product-cell product-cell--card">
                <h4 className="card-title">System context</h4>
                <p className="card-text">QuantVault provides the system-wide context.</p>
              </div>
            </div>

            <div className="product-row product-row--title">
              <div className="product-cell">
                <h4 className="qc-section-label">Integration Philosophy</h4>
              </div>
            </div>

            <div className="product-row product-row--single">
              <div className="product-cell product-cell--statement">
                <p className="section-note">QuantVault plugs into and enhances your existing IAM solutions. <span className="text-highlight">It does not replace them.</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* QUANTDATA */}
        <section id="quantdata" className="section product-detail-section">
          <div className="product-detail-grid product-detail-grid--data">
            <div className="product-row product-row--hero">
              <div className="product-cell product-cell--hero-main">
                <Badge className="qc-badge">Products</Badge>
                <h2>QuantData</h2>
                <h3>Semantic Governance for Enterprise Data</h3>
              </div>
              <div className="product-cell product-cell--hero-note">
                <p>
                  <span className="text-highlight">QuantData</span> governs what enterprise data means and
                  how it evolves safely over time.
                </p>
              </div>
            </div>

            <div className="product-row product-row--title">
              <div className="product-cell">
                <h4 className="qc-section-label">What It Does</h4>
              </div>
            </div>

            <div className="product-row product-row--single-card">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Canonical models</h4>
                <p className="card-text">Establishes canonical data models and nomenclature.</p>
              </div>
            </div>

            <div className="product-row product-row--single-card">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Controlled evolution</h4>
                <p className="card-text">Governs evolution without breaking reporting or workflows.</p>
              </div>
            </div>

            <div className="product-row product-row--single-card">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Detects semantic drift</h4>
                <p className="card-text">Detects semantic drift, ambiguity, and incompatibility.</p>
              </div>
            </div>

            <div className="product-row product-row--single-card">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">AI readiness</h4>
                <p className="card-text">Ensures data is fit for reporting, automation, and AI.</p>
              </div>
            </div>

            <div className="product-row product-row--title">
              <div className="product-cell">
                <h4 className="qc-section-label">Why It Matters</h4>
              </div>
            </div>

            <div className="product-row product-row--two-col">
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Access + meaning</h4>
                <p className="card-text">Entitlement governance fails if data meaning is broken.</p>
              </div>
              <div className="product-cell product-cell--card">
                <h4 className="card-title">Meaning + access</h4>
                <p className="card-text">Data governance fails if access governance is broken.</p>
              </div>
            </div>

            <div className="product-row product-row--single">
              <div className="product-cell product-cell--statement">
                <p className="section-note">QuantData and QuantCertify are designed to work together so <span className="text-highlight">data meaning and permissions evolve in lockstep.</span></p>
              </div>
            </div>
          </div>
        </section>

        </div>

        {/* CAPABILITIES */}
        <section id="capabilities" className="capabilities-container section">
          <h2 className="section-title exceptional-title">What We’re Exceptional At</h2>

          <div className="capabilities-shell">
            <div className="what-we-do-grid what-we-do-grid--two capabilities-grid">
              <article className="card what-we-do-card">
                <Image src="/images/card-icon-quantent.svg" alt="" width={40} height={40} aria-hidden="true" className="what-we-do-icon" />
                <div className="what-we-do-card-copy">
                  <h4 className="card-title">Quantitative Governance</h4>
                  <p className="card-text card-text-secondary">Mathematical modeling of exposure, drift, and structure. Prioritization of ambiguity by business impact. Governance focused on material risk.</p>
                </div>
              </article>

              <article className="card what-we-do-card">
                <Image src="/images/card-icon-quantent.svg" alt="" width={40} height={40} aria-hidden="true" className="what-we-do-icon" />
                <div className="what-we-do-card-copy">
                  <h4 className="card-title">Semantic Data Modeling</h4>
                  <p className="card-text card-text-secondary">Canonical models for complex enterprises. Consistent nomenclature and meaning. Financial-grade rigor.</p>
                </div>
              </article>

              <article className="card what-we-do-card">
                <Image src="/images/card-icon-quantent.svg" alt="" width={40} height={40} aria-hidden="true" className="what-we-do-icon" />
                <div className="what-we-do-card-copy">
                  <h4 className="card-title">Safe Model Evolution</h4>
                  <p className="card-text card-text-secondary">Controlled, governed change instead of ad-hoc drift. Explicit compatibility and upgrade paths. Early warnings before breakage.</p>
                </div>
              </article>

              <article className="card what-we-do-card">
                <Image src="/images/card-icon-quantent.svg" alt="" width={40} height={40} aria-hidden="true" className="what-we-do-icon" />
                <div className="what-we-do-card-copy">
                  <h4 className="card-title">Financial Services Depth</h4>
                  <p className="card-text card-text-secondary">Trading systems. Risk and margin. Regulatory reporting. Counterparty exposure. Built by people who’ve operated these systems at scale.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="services-container section">
          <h2 className="services-title">Accelerating Governance and AI Readiness</h2>

          <p className="services-lead">
            <span className="text-highlight">QuantEnt</span> provides services to accelerate adoption and maximize impact.
          </p>

          <div className="services-shell">
            <div className="services-strip">
              <h3 className="qc-section-label">What We Offer</h3>
            </div>

            <div className="services-grid">
              <article className="services-cell services-cell--tech">
                <h4 className="card-title">Tech review & scorecarding</h4>
                <p className="card-text"><span className="text-highlight">Full stack technology review and scorecarding</span> of data, AI, and entitlements.</p>
              </article>

              <article className="services-cell services-cell--access">
                <h4 className="card-title">Access cleanup</h4>
                <p className="card-text"><span className="text-highlight">Entitlement and access cleanup.</span></p>
              </article>

              <article className="services-cell services-cell--structure">
                <h4 className="card-title">Services establish structure</h4>
                <p className="card-text"><span className="text-highlight">Products enforce and maintain it.</span></p>
              </article>

              <article className="services-cell services-cell--cycles">
                <h4 className="card-title">No perpetual cleanup cycles</h4>
                <p className="card-text"><span className="text-highlight">We don’t just prepare organizations — we help them stay prepared.</span></p>
              </article>

              <article className="services-cell services-cell--semantic">
                <h4 className="card-title">Semantic alignment</h4>
                <p className="card-text"><span className="text-highlight">Data model and semantic alignment.</span></p>
              </article>

              <article className="services-cell services-cell--ai">
                <h4 className="card-title">AI readiness</h4>
                <p className="card-text"><span className="text-highlight">AI and automation readiness assessments.</span></p>
              </article>

              <article className="services-cell services-cell--architecture">
                <h4 className="card-title">Architecture & operating model</h4>
                <p className="card-text"><span className="text-highlight">Architecture and operating-model design.</span></p>
              </article>
            </div>
          </div>
        </section>

        <div className="container">

        {/* ABOUT */}
        <section id="about" className="section about-section">
          <div className="about-intro-grid">
            <h2 className="about-title">About QuantEnt</h2>
            <p className="about-intro-copy">
              <span className="text-highlight">QuantEnt</span> was founded to solve a problem we’ve repeatedly seen inside large, complex organizations: systems scale faster than shared understanding.
            </p>
          </div>

          <p className="section-note">
            When meaning decays, governance fails — quietly. <span className="text-highlight">We build systems that prevent semantic decay, even as organizations evolve.</span>
          </p>

          <h3 className="subhead leadership-heading">Leadership</h3>

          <div className="leadership-grid" role="list">
            <article className="leadership-card" role="listitem">
              <div className="leadership-card-header">
                <div className="leadership-photo" role="img" aria-label="Trent Walker profile photo">TW</div>
                <div className="leadership-heading-block">
                  <div className="leadership-heading-row">
                    <h2 className="leadership-name">Trent Walker</h2>
                    <a
                      className="profile-social-link leadership-social-link"
                      href="https://www.linkedin.com/in/trentewalker"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Trent Walker on LinkedIn"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6.5 8.5h3v9h-3v-9Zm1.5-4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm5.5 4.5h2.9v1.2h.1c.4-.7 1.4-1.4 2.9-1.4 3.1 0 3.6 2 3.6 4.6v4.6h-3V13.5c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7v4.1h-3v-9Z" />
                      </svg>
                    </a>
                  </div>
                  <h5 className="leadership-role">Founder &amp; CEO</h5>
                </div>
              </div>

              <div className="leadership-card-body">
                <p className="card-text">Trent Walker is a senior technology executive and former hedge fund CTO with nearly three decades of experience building and leading mission-critical platforms for trading, risk, finance, and control functions across buy-side, sell-side, and market infrastructure. Most recently at Point72, he served as Head of Risk &amp; Controllers Technology, modernizing core systems, strengthening data and process coherence, ensuring robust P&amp;L foundations, and advancing frameworks for equity factor analytics and risk calculation.</p>

                <p className="card-text">Previously, Trent was Head of Technology Strategy at Nasdaq and a Managing Director at MSCI, where he led application development for the Barra and RiskMetrics platforms. He also served as CTO at BlueCrest Capital Management and held senior technology leadership roles at Credit Suisse, helping drive the shift from spreadsheet-driven workflows to scalable front-to-back systems and disciplined new-product onboarding.</p>

                <p className="card-text">Trent has also led in the front office. At Barclays Capital he was Global Head of Risk and Margin for Prime Services, leading global netting and risk teams overseeing over $1 trillion in financing products and building a coherent, legally accurate view of counterparty exposure and set-off. This blend of front-office accountability, deep engineering experience, and still being a hands on developer gives Trent a rare perspective on how desk-level decisions propagate into data, models, controls, and firmwide outcomes.</p>

                <p className="card-text">Trent began his career as an Assistant Professor of Mathematics at UC Santa Barbara after earning his PhD from UC Berkeley, specializing in operator algebras and control theory. In his spare time, Trent invented the patented Induction Press coffee machine, launching in Q2 2026.</p>
              </div>
            </article>

            <article className="leadership-card" role="listitem">
              <div className="leadership-card-header">
                <div className="leadership-photo" role="img" aria-label="Justo Ruiz profile photo">JR</div>
                <div className="leadership-heading-block">
                  <div className="leadership-heading-row">
                    <h2 className="leadership-name">Justo Ruiz</h2>
                    <a
                      className="profile-social-link leadership-social-link"
                      href="https://www.linkedin.com/in/justoruiz"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Justo Ruiz on LinkedIn"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6.5 8.5h3v9h-3v-9Zm1.5-4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm5.5 4.5h2.9v1.2h.1c.4-.7 1.4-1.4 2.9-1.4 3.1 0 3.6 2 3.6 4.6v4.6h-3V13.5c0-1.7 0-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7v4.1h-3v-9Z" />
                      </svg>
                    </a>
                  </div>
                  <h5 className="leadership-role">CTO</h5>
                </div>
              </div>

              <div className="leadership-card-body">
                <p className="card-text">Justo Ruiz is an AI founder and hands-on computer scientist specializing in distributed systems, high-performance computing, and generative-AI infrastructure, with a track record of shipping production platforms for data-intensive workloads across startups and top hedge funds.</p>

                <p className="card-text">As Founder and CEO of Shapelets, Justo built a high-performance data processing and visualization platform and architected a vector database capable of ingesting 100,000+ embeddings per second for real-time semantic search and generative-AI use cases.</p>

                <p className="card-text">Previously, as CTO of a private equity–backed company, Justo reset product strategy, established development centers in Spain, modernized the platform, and contributed to a successful exit.</p>

                <p className="card-text">In front-office technology roles, including as Principal at BlueCrest Capital Management, Justo unified market and reference data systems and delivered a consolidated high-performance risk platform for trading and portfolio decisions.</p>

                <p className="card-text">Earlier at Barclays Capital as a Senior Quant Developer on the Convertible Bonds desk, Justo built performance-critical pricing and trading infrastructure for complex hybrid securities.</p>
              </div>
            </article>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section">
          <form className="contact-inline-form" onSubmit={handleInlineContactSubmit} noValidate>
            <div className="talk-form-header">
              <h2 className="section-title">Talk with us</h2>
              <p className="section-lead muted">Share your priorities and we will route your request to the right team.</p>
            </div>
            <input
              className="hp-field"
              type="text"
              name="website"
              value={contactForm.website}
              onChange={(event) => updateInlineContactField('website', event.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="contact-form-grid">
              <div className="field">
                <label htmlFor="contact-inline-name">Name</label>
                <input
                  id="contact-inline-name"
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(event) => updateInlineContactField('name', event.target.value)}
                  placeholder="Jordan Lee"
                />
                {contactTouched && !contactForm.name.trim() ? <span className="field-error">Required</span> : null}
              </div>

              <div className="field">
                <label htmlFor="contact-inline-email">Email</label>
                <input
                  id="contact-inline-email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(event) => updateInlineContactField('email', event.target.value)}
                  placeholder="jordan@company.com"
                />
                {contactTouched && !contactForm.email.trim() ? <span className="field-error">Required</span> : null}
              </div>

              <div className="field field-full">
                <label htmlFor="contact-inline-phone">Phone (optional)</label>
                <input
                  id="contact-inline-phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(event) => updateInlineContactField('phone', event.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="field field-full">
                <label htmlFor="contact-inline-message">Message</label>
                <textarea
                  id="contact-inline-message"
                  required
                  value={contactForm.message}
                  onChange={(event) => updateInlineContactField('message', event.target.value)}
                  placeholder="Tell us about your governance goals."
                />
                {contactTouched && !contactForm.message.trim() ? <span className="field-error">Required</span> : null}
              </div>
            </div>

            <label className="consent">
              <input
                type="checkbox"
                checked={contactForm.consent}
                onChange={(event) => updateInlineContactField('consent', event.target.checked)}
                required
              />
              <span>
                I agree with QuantEnt <button type="button" className="footer-legal-trigger consent-legal-link" onClick={() => openLegalModal('privacy')}>Privacy</button>, <button type="button" className="footer-legal-trigger consent-legal-link" onClick={() => openLegalModal('terms')}>Terms</button>, and <button type="button" className="footer-legal-trigger consent-legal-link" onClick={() => openLegalModal('cookies')}>Cookies</button>.
              </span>
            </label>

            {contactTouched && !contactForm.consent ? <span className="field-error">Consent is required</span> : null}

            <div className="contact-inline-actions">
              <button className="btn btn-primary contact-inline-btn" type="submit" disabled={contactStatus === 'submitting'}>
                {contactStatus === 'submitting' ? 'Sending...' : 'Send message'}
              </button>
              <button className="btn btn-secondary contact-inline-btn" type="button" onClick={openContactStepper}>
                Open advanced form
              </button>
            </div>

            {contactStatus === 'success' ? <p className="contact-success">Request sent. We will be in touch shortly.</p> : null}
            {contactStatus === 'error' ? <p className="contact-error">Something went wrong. Please try again.</p> : null}
          </form>
        </section>

        </div>
        <Footer onOpenLegal={openLegalModal} />
        </main>
      </div>

      {/* Overlay */}
      <div
        className={`drawer-overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
      />

      {/* Drawer right */}
      <aside className={`drawer ${menuOpen ? 'is-open' : ''}`} role="dialog" aria-label="Navigation menu">
        <div className="drawer-header">
          <span className="drawer-title">Menu</span>
          <button
            className="drawer-close"
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <nav className="drawer-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={activeHref === item.href ? 'nav-link-active' : ''}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <ContactStepperModal open={isContactOpen} onClose={closeContact} />
      <LegalDialog activeLegalModal={activeLegalModal} onClose={closeLegalModal} />
    </>
  );
}
