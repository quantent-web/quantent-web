'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Image from 'next/image';
import DotGrid from './components/DotGrid/DotGrid';
import BlurText from './components/BlurText/BlurText';
import DecryptedText from './components/DecryptedText/DecryptedText';
import Switch from './components/ui/Switch';
import { Badge } from './components/ui/badge';
import Particles from './components/ui/Particles';
import Footer from './components/footer/Footer';
import ContactStepperModal from './components/contact/ContactStepperModal';
import { useLenis } from './home/useLenis';
import { useAnchorScroll } from './home/useAnchorScroll';

type NavItem = { label: string; href: `#${string}` };

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
  const [isDark, setIsDark] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const setTheme = (next: 'light' | 'dark') => {
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setIsDark(next === 'dark');
  };

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'What we do', href: '#what-we-do' },
      { label: 'Products', href: '#products' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#about' },
    ],
    []
  );
  const [activeHref, setActiveHref] = useState('#what-we-do');
  const isProgrammaticScroll = useRef(false);
  const pendingTargetHref = useRef<string | null>(null);
  const programmaticScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cierra menú con ESC
  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'dark';
    setIsDark(current);

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

  // Scroll spy usando IntersectionObserver para activar links
  useEffect(() => {
    const sectionIds = navItems
      .map((item) => item.href.replace('#', ''))
      .filter(Boolean);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const ratios = new Map<string, number>();
    const updateActive = () => {
      if (isProgrammaticScroll.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      if (scrollTop <= 8) {
        setActiveHref('#what-we-do');
        return;
      }

      if (scrollTop + windowHeight >= docHeight - 8) {
        setActiveHref(`#${sectionIds[sectionIds.length - 1]}`);
        return;
      }

      let bestId = sectionIds[0];
      let bestRatio = 0;
      for (const id of sectionIds) {
        const ratio = ratios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }

      if (bestRatio >= 0.4) {
        setActiveHref(`#${bestId}`);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        updateActive();
      },
      {
        rootMargin: '0px 0px -20% 0px',
        threshold: [0, 0.25, 0.4, 0.6, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
    updateActive();

    return () => {
      observer.disconnect();
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

  useEffect(() => {
    const hash = window.location.hash as `#${string}` | '';

    if (!hash) return;

    if (hash === '#contact') {
      setActiveHref('#contact');
      openContactStepper();
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    runProgrammaticScroll(hash);
  }, [openContactStepper, runProgrammaticScroll]);

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

            {/* Toggle tema */}
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              ariaLabel="Toggle theme"
            />

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
                <h3>Entitlement and User analytics</h3>
                <p><span className="text-highlight">QuantEnt</span> is built for environments where correctness, scale, and evolution matter.</p>
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
                <h3>Data Cleaning, Categorizing, and Governance</h3>
                <p><span className="text-highlight">QuantEnt</span> structures and governs enterprise data so every dataset is clean, categorized, and controlled with transparent policies</p>
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
                  <h4 className="card-title">Trent Walker</h4>
                  <h5 className="leadership-role">Founder &amp; CEO</h5>
                </div>
              </div>

              <div className="leadership-card-body">
                <p className="card-text"><strong>Executive profile:</strong> Senior technology executive and former hedge fund CTO with nearly three decades building and leading mission-critical platforms for trading, risk, finance, and control functions across buy-side and sell-side organizations.</p>
                <p className="card-text"><strong>Recent mandate (Point72):</strong> As Head of Risk &amp; Controllers Technology, he modernized core systems, strengthened data and process coherence, reinforced robust P&amp;L foundations, and advanced frameworks for equity factor analytics and risk calculation.</p>
                <p className="card-text"><strong>Previous leadership:</strong> Head of Technology Strategy at Nasdaq; Managing Director at MSCI leading application development for Barra and RiskMetrics; CTO at BlueCrest Capital Management; and senior technology roles at Credit Suisse driving the transition from spreadsheet-based workflows to scalable front-to-back systems and disciplined new-product onboarding.</p>
                <p className="card-text"><strong>Prime services and risk:</strong> At Barclays Capital, he served as Global Head of Risk and Margin for Prime Services, leading global netting and risk teams across financing products and building a coherent, legally accurate view of counterparty exposure and set-off.</p>
                <p className="card-text"><strong>Academic foundation:</strong> Assistant Professor of Mathematics at UC Santa Barbara after earning a PhD from UC Berkeley, specializing in operator algebras and control theory.</p>
                <p className="card-text"><strong>Innovation:</strong> Inventor of the patented Induction Press coffee machine, planned for launch in Q2 2026.</p>
              </div>
            </article>

            <article className="leadership-card" role="listitem">
              <div className="leadership-card-header">
                <div className="leadership-photo" role="img" aria-label="Justo Ruiz profile photo">JR</div>
                <div className="leadership-heading-block">
                  <h4 className="card-title">Justo Ruiz</h4>
                  <h5 className="leadership-role">Co-Founder &amp; CTO</h5>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section">
          <h2 className="section-title">Talk to Us</h2>
          <p className="section-lead muted">Email addresses and Contact Phone Numbers</p>

          <div className="cta-strip">
            <p className="cta-text">Start with QuantCertify</p>
            <button className="btn btn-primary" type="button" onClick={openContactStepper}>
              Contact
            </button>
            </div>
        </section>

        <Footer />
        </div>
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
    </>
  );
}
