'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import DotGrid from './components/DotGrid/DotGrid';
import BlurText from './components/BlurText/BlurText';
import MagicBentoGrid from './components/effects/MagicBentoGrid';
import Switch from './components/ui/Switch';
import Footer from './components/footer/Footer';
import ContactStepperModal from './components/contact/ContactStepperModal';
import PinnedSection from './components/scroll/PinnedSection';
import { shouldEnablePinned, shouldEnableSnap } from '@/src/config/scrollExperience';

type NavItem = { label: string; href: string };

export default function Home() {
  const navRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const navInnerRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const linksRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [useBurger, setUseBurger] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [pinnedEnabled, setPinnedEnabled] = useState(false);

  const setTheme = (next: 'light' | 'dark') => {
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setIsDark(next === 'dark');
  };

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Home', href: '#home' },
      { label: 'What we do', href: '#what-we-do' },
      { label: 'Different', href: '#different' },
      { label: 'Products', href: '#products' },
      { label: 'QuantCertify', href: '#quantcertify' },
      { label: 'QuantVault', href: '#quantvault' },
      { label: 'QuantData', href: '#quantdata' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    []
  );
  const [activeHref, setActiveHref] = useState('#home');

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

  useEffect(() => {
    const syncScrollPreferences = () => {
      setSnapEnabled(shouldEnableSnap());
      setPinnedEnabled(shouldEnablePinned());
    };

    syncScrollPreferences();

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseMedia = window.matchMedia('(pointer: coarse)');
    const widthMedia = window.matchMedia('(max-width: 768px)');
    const onChange = () => syncScrollPreferences();

    reducedMotionMedia.addEventListener('change', onChange);
    coarseMedia.addEventListener('change', onChange);
    widthMedia.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);

    return () => {
      reducedMotionMedia.removeEventListener('change', onChange);
      coarseMedia.removeEventListener('change', onChange);
      widthMedia.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
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
    const snapIds = [
      'what-we-do',
      'different',
      'products',
      'quantcertify',
      'quantvault',
      'quantdata',
      'capabilities',
      'services',
    ];

    const outsideIds = ['home', 'about', 'contact'];
    const snapSections = snapIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const outsideSections = outsideIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const snapRatios = new Map<string, number>();
    const outsideRatios = new Map<string, number>();

    const updateActive = () => {
      let outsideBestId = '';
      let outsideBestRatio = 0;

      for (const id of outsideIds) {
        const ratio = outsideRatios.get(id) ?? 0;
        if (ratio > outsideBestRatio) {
          outsideBestRatio = ratio;
          outsideBestId = id;
        }
      }

      if (outsideBestRatio >= 0.35) {
        setActiveHref(`#${outsideBestId}`);
        return;
      }

      const snapRoot = snapEnabled ? mainRef.current : null;

      if (snapRoot && snapRoot.scrollTop <= 8) {
        setActiveHref('#what-we-do');
        return;
      }

      let snapBestId = snapIds[0];
      let snapBestRatio = 0;
      for (const id of snapIds) {
        const ratio = snapRatios.get(id) ?? 0;
        if (ratio > snapBestRatio) {
          snapBestRatio = ratio;
          snapBestId = id;
        }
      }

      if (snapBestRatio > 0) {
        setActiveHref(`#${snapBestId}`);
      }
    };

    const outsideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          outsideRatios.set(entry.target.id, entry.intersectionRatio);
        });
        updateActive();
      },
      {
        root: null,
        rootMargin: '0px 0px -20% 0px',
        threshold: [0, 0.2, 0.35, 0.6, 1],
      }
    );

    outsideSections.forEach((section) => outsideObserver.observe(section));

    const snapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          snapRatios.set(entry.target.id, entry.intersectionRatio);
        });
        updateActive();
      },
      {
        root: snapEnabled ? mainRef.current : null,
        rootMargin: '0px 0px -20% 0px',
        threshold: [0, 0.25, 0.4, 0.6, 1],
      }
    );

    snapSections.forEach((section) => snapObserver.observe(section));
    updateActive();

    return () => {
      outsideObserver.disconnect();
      snapObserver.disconnect();
    };
  }, [snapEnabled]);

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

  const closeMenu = () => setMenuOpen(false);
  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  const whatWeDoCards = [
    {
      title: 'System Analysis',
      text: 'Analyze users, roles, entitlements, and data as interconnected systems.',
    },
    {
      title: 'Quantitative Certification',
      text: 'Certify access and meaning with mathematical rigor.',
    },
    {
      title: 'Risk Detection',
      text: 'Detect drift, over-exposure, and structural risk early.',
    },
    {
      title: 'Continuous Control',
      text: 'Maintain control as systems, data, and organizations evolve.',
    },
  ];

  const dataCleaningCards = [
    {
      title: 'MetaData Tagging',
      text: 'Analyzing and Tagging APIs, data, applications, and resources for use by users and AI.',
    },
    {
      title: 'Data Model Rigorization',
      text: 'With software and consulting, our SMEs will help create, refine, or just critique the data models of the firm.',
    },
    {
      title: 'Ongoing Cleanliness',
      text: 'Institutional Data Cleanliness starts at the data model process',
    },
    {
      title: 'Agentic AI Compatibility',
      text: 'Our future product is designed to make Agentic AI work with the highest possible confidence level, with the safest data protection possible.',
    },
  ];

  return (
    <>
      {/* STICKY NAV */}
      <header className="nav" ref={navRef}>
          <div className="nav-inner nav-container" ref={navInnerRef}>
            <a
              className="nav-brand"
              href="#home"
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
                    onClick={() => {
                      setActiveHref(item.href);
                      if (menuOpen) {
                        setMenuOpen(false);
                      }
                    }}
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

      {/* HOME / HERO */}
      <section id="home" className="header-bg">
        <div className="header-bg__grid" aria-hidden="true">
          <DotGrid
            dotSize={5}
            gap={15}
            proximity={200}
            style={{}}
          />
        </div>

        <div className="container header-bg__content">
          <BlurText
  as="h1"
  className="hero-title"
  text="Creating Institutional Control over Entitlements and Data"
  delay={120}
  animateBy="words"
  direction="top"
/>



          <p className="hero-subtitle">
            Quantitative models and mathematics for entitlement and data governance.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={openContact}>
              Talk to Us
            </button>
            <a className="btn btn-secondary" href="#what-we-do">
              What we do
            </a>
          </div>
        </div>
      </section>

      {/* SNAP STEPS */}
      <main
        id="top"
        className="container"
        ref={mainRef}
        data-snap-scroll={snapEnabled ? 'true' : 'false'}
      >

        {/* WHAT WE DO */}
        <section id="what-we-do" className="section">
          <PinnedSection
            id="what-we-do"
            enabled={pinnedEnabled}
            steps={[
              {
                key: 'wtd-1',
                label: 'What We Do',
                content: (
                  <div className="what-we-do-layout">
                    <div className="what-we-do-left">
                      <h2 className="section-title">What We Do</h2>
                      <p className="section-lead">
                        QuantEnt analyzes and certifies who can access what — and what that data
                        means — using quantitative models instead of static rules.
                      </p>
                    </div>
                    <div className="what-we-do-right">
                      <p className="section-kicker">We help organizations:</p>
                      <MagicBentoGrid variant="4" sectionId="what-we-do">
                        {whatWeDoCards.map((card) => (
                          <div className="card" key={`what-we-do-${card.title}`}>
                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-text">{card.text}</p>
                          </div>
                        ))}
                      </MagicBentoGrid>
                      <p className="section-note">
                        QuantEnt is built for complex, regulated environments where correctness,
                        scale, and evolution matter.
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'wtd-2',
                label: 'Data Cleaning, Categorizing, and Governance',
                content: (
                  <div className="what-we-do-layout what-we-do-layout--inverted">
                    <div className="what-we-do-left what-we-do-left--description">
                      <h2 className="section-title">Data Cleaning, Categorizing, and Governance</h2>
                      <p className="section-lead">
                        QuantEnt structures and governs enterprise data so every dataset is clean,
                        categorized, and controlled with transparent policies.
                      </p>
                    </div>
                    <div className="what-we-do-right">
                      <p className="section-kicker">Entitlement And User Analysis:</p>
                      <MagicBentoGrid variant="4" sectionId="what-we-do-inverted">
                        {dataCleaningCards.map((card) => (
                          <div className="card" key={`what-we-do-inverted-${card.title}`}>
                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-text">{card.text}</p>
                          </div>
                        ))}
                      </MagicBentoGrid>
                      <p className="section-note">
                        QuantEnt provides end-to-end governance for high-volume, high-impact
                        enterprise data ecosystems.
                      </p>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>

      


        {/* WHAT MAKES DIFFERENT */}
        <section id="different" className="section">
          <h2 className="section-title">What Makes QuantEnt Different</h2>

          <MagicBentoGrid variant="auto" sectionId="different">
            <div className="card">
              <h3 className="card-title">Quantitative by design</h3>
              <p className="card-text">
                Exposure, drift, and structural risk are measured — not guessed.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">AI-native governance</h3>
              <p className="card-text">
                Built so AI can reason, opine, and alert safely on entitlements and
                data.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Designed for complexity</h3>
              <p className="card-text">
                Proven in financial-services-grade systems with real risk and
                regulatory consequences.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Enhances existing IAM</h3>
              <p className="card-text">
                Integrates with what you already run. We don’t replace your identity
                stack — we make it work better.
              </p>
            </div>
          </MagicBentoGrid>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="section">
          <h2 className="section-title">Our Products</h2>

          <MagicBentoGrid variant="auto" sectionId="products">
            <div className="card">
              <h3 className="card-title">QuantCertify</h3>
              <p className="card-text">Certification with quantitative control.</p>
              <div className="card-actions">
                <a className="btn btn-secondary" href="#quantcertify">
                  Learn more
                </a>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">QuantVault</h3>
              <p className="card-text">Enterprise entitlement intelligence.</p>
              <div className="card-actions">
                <a className="btn btn-secondary" href="#quantvault">
                  Learn more
                </a>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">QuantData</h3>
              <p className="card-text">Semantic governance for enterprise data.</p>
              <div className="card-actions">
                <a className="btn btn-secondary" href="#quantdata">
                  Learn more
                </a>
              </div>
            </div>
          </MagicBentoGrid>

          <div className="cta-strip">
            <p className="cta-text">Talk to Us — Start with QuantCertify</p>
            <a className="btn btn-primary" href="#contact">
              Start
            </a>
            </div>
        </section>

        {/* QUANTCERTIFY */}
        <section id="quantcertify" className="section">
          <PinnedSection
            id="quantcertify"
            enabled={pinnedEnabled}
            steps={[
              {
                key: 'qc-1',
                label: 'QuantCertify overview and What It Does',
                content: (
                  <>
                    <h2 className="section-title">QuantCertify</h2>
                    <p className="section-lead">Certification with Quantitative Control</p>
                    <p className="section-note">
                      QuantCertify transforms certification from a periodic compliance exercise
                      into a quantitative control mechanism.
                    </p>
                    <h3 className="subhead">What It Does</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantcertify-what-it-does">
                      <div className="card"><h4 className="card-title">Quantifies exposure</h4><p className="card-text">Quantifies entitlement exposure, drift, and role integrity using mathematics — not rules.</p></div>
                      <div className="card"><h4 className="card-title">System-level analysis</h4><p className="card-text">Analyzes users and entitlements as a system, not isolated records.</p></div>
                      <div className="card"><h4 className="card-title">AI opinions & alerts</h4><p className="card-text">Enables AI to opine and alert on access patterns, anomalies, and emerging risk.</p></div>
                      <div className="card"><h4 className="card-title">Forces clarity</h4><p className="card-text">Forces clarity and ownership during certification.</p></div>
                      <div className="card"><h4 className="card-title">Prevents rubber-stamping</h4><p className="card-text">Prevents rubber-stamp reviews by surfacing what actually matters.</p></div>
                      <div className="card"><h4 className="card-title">Focus on material risk</h4><p className="card-text">Focuses attention on material risk, not noise.</p></div>
                    </MagicBentoGrid>
                  </>
                ),
              },
              {
                key: 'qc-2',
                label: 'Why It’s Different',
                content: (
                  <>
                    <h3 className="subhead">Why It’s Different</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantcertify-why-different">
                      <div className="card"><h4 className="card-title">Quantifies entitlements</h4><p className="card-text">The only certification system that quantifies entitlements.</p></div>
                      <div className="card"><h4 className="card-title">AI-first architecture</h4><p className="card-text">Built from the ground up with AI in mind, not bolted on later.</p></div>
                      <div className="card"><h4 className="card-title">Improves over time</h4><p className="card-text">Designed to improve governance quality over time, not degrade.</p></div>
                      <div className="card"><h4 className="card-title">Risk thinking</h4><p className="card-text">Grounded in quantitative risk thinking, not static policy engines.</p></div>
                    </MagicBentoGrid>
                  </>
                ),
              },
              {
                key: 'qc-3',
                label: 'How It Fits Your Environment',
                content: (
                  <>
                    <h3 className="subhead">How It Fits Your Environment</h3>
                    <p className="section-note">QuantCertify integrates with and enhances your existing IAM solutions. It works alongside SailPoint, Okta, Active Directory, and other IAM platforms, adding quantitative insight to existing certification workflows — without disrupting current systems.</p>
                    <p className="section-note strong">QuantCertify does not replace your IAM stack. It makes it measurably better.</p>
                    <h3 className="subhead">Outcomes</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantcertify-outcomes">
                      <div className="card"><h4 className="card-title">Cleaner roles</h4><p className="card-text">Cleaner roles and access structures.</p></div>
                      <div className="card"><h4 className="card-title">Faster certifications</h4><p className="card-text">Faster, defensible certifications.</p></div>
                      <div className="card"><h4 className="card-title">Reduced drift</h4><p className="card-text">Reduced over-entitlement and drift.</p></div>
                    </MagicBentoGrid>
                    <div className="cta-strip">
                      <p className="cta-text">Talk to Us About QuantCertify</p>
                      <a className="btn btn-primary" href="#contact">Contact</a>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </section>

        {/* QUANTVAULT */}
        <section id="quantvault" className="section">
          <PinnedSection
            id="quantvault"
            enabled={pinnedEnabled}
            steps={[
              {
                key: 'qv-1',
                label: 'QuantVault overview and What It Does',
                content: (
                  <>
                    <h2 className="section-title">QuantVault</h2>
                    <p className="section-lead">Enterprise Entitlement Intelligence</p>
                    <p className="section-note">QuantVault provides a system-level view of entitlements across your organization.</p>
                    <h3 className="subhead">What It Does</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantvault-what-it-does">
                      <div className="card"><h4 className="card-title">Aggregates entitlements</h4><p className="card-text">Aggregates entitlements across IAM platforms and systems.</p></div>
                      <div className="card"><h4 className="card-title">Unified view</h4><p className="card-text">Creates a unified view of users, resources, roles, and access.</p></div>
                      <div className="card"><h4 className="card-title">Cross-system analysis</h4><p className="card-text">Enables cross-system analysis of entitlement structure and risk.</p></div>
                      <div className="card"><h4 className="card-title">Governance foundation</h4><p className="card-text">Foundation for quantitative entitlement governance at scale.</p></div>
                    </MagicBentoGrid>
                  </>
                ),
              },
              {
                key: 'qv-2',
                label: 'Relationship to QuantCertify',
                content: (
                  <>
                    <h3 className="subhead">Relationship to QuantCertify</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantvault-relationship">
                      <div className="card"><h4 className="card-title">Runs on top</h4><p className="card-text">QuantCertify runs on top of QuantVault.</p></div>
                      <div className="card"><h4 className="card-title">System context</h4><p className="card-text">QuantVault provides the system-wide context.</p></div>
                    </MagicBentoGrid>
                  </>
                ),
              },
              {
                key: 'qv-3',
                label: 'Integration Philosophy',
                content: (
                  <>
                    <h3 className="subhead">Integration Philosophy</h3>
                    <p className="section-note">QuantVault plugs into and enhances your existing IAM solutions. It does not replace them.</p>
                  </>
                ),
              },
            ]}
          />
        </section>

        {/* QUANTDATA */}
        <section id="quantdata" className="section">
          <PinnedSection
            id="quantdata"
            enabled={pinnedEnabled}
            steps={[
              {
                key: 'qd-1',
                label: 'QuantData overview and What It Does',
                content: (
                  <>
                    <h2 className="section-title">QuantData</h2>
                    <p className="section-lead">Semantic Governance for Enterprise Data</p>
                    <p className="section-note">QuantData governs what enterprise data means and how it evolves safely over time.</p>
                    <h3 className="subhead">What It Does</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantdata-what-it-does">
                      <div className="card"><h4 className="card-title">Canonical models</h4><p className="card-text">Establishes canonical data models and nomenclature.</p></div>
                      <div className="card"><h4 className="card-title">Controlled evolution</h4><p className="card-text">Governs evolution without breaking reporting or workflows.</p></div>
                      <div className="card"><h4 className="card-title">Detects semantic drift</h4><p className="card-text">Detects semantic drift, ambiguity, and incompatibility.</p></div>
                      <div className="card"><h4 className="card-title">AI readiness</h4><p className="card-text">Ensures data is fit for reporting, automation, and AI.</p></div>
                    </MagicBentoGrid>
                  </>
                ),
              },
              {
                key: 'qd-2',
                label: 'Why It Matters',
                content: (
                  <>
                    <h3 className="subhead">Why It Matters</h3>
                    <MagicBentoGrid variant="auto" sectionId="quantdata-why-it-matters">
                      <div className="card"><h4 className="card-title">Access + meaning</h4><p className="card-text">Entitlement governance fails if data meaning is broken.</p></div>
                      <div className="card"><h4 className="card-title">Meaning + access</h4><p className="card-text">Data governance fails if access governance is broken.</p></div>
                    </MagicBentoGrid>
                    <p className="section-note">QuantData and QuantCertify are designed to work together so data meaning and permissions evolve in lockstep.</p>
                  </>
                ),
              },
            ]}
          />
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="section">
          <h2 className="section-title">What We’re Exceptional At</h2>

          <MagicBentoGrid variant="auto" sectionId="capabilities">
            <div className="card">
              <h3 className="card-title">Quantitative Governance</h3>
              <p className="card-text">
                Mathematical modeling of exposure, drift, and structure. Prioritization of ambiguity by business impact.
                Governance focused on material risk.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Semantic Data Modeling</h3>
              <p className="card-text">
                Canonical models for complex enterprises. Consistent nomenclature and meaning. Financial-grade rigor.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Safe Model Evolution</h3>
              <p className="card-text">
                Controlled, governed change instead of ad-hoc drift. Explicit compatibility and upgrade paths. Early warnings before breakage.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Financial Services Depth</h3>
              <p className="card-text">
                Trading systems. Risk and margin. Regulatory reporting. Counterparty exposure. Built by people who’ve operated these systems at scale.
              </p>
            </div>
          </MagicBentoGrid>
        </section>

        {/* SERVICES */}
        <section id="services" className="section">
          <h2 className="section-title">Accelerating Governance and AI Readiness</h2>

          <p className="section-lead">
            QuantEnt provides services to accelerate adoption and maximize impact.
          </p>

          <p className="section-kicker">What We Offer</p>
          <MagicBentoGrid variant="auto" sectionId="services-offer">
            <div className="card">
              <h3 className="card-title">Tech review & scorecarding</h3>
              <p className="card-text">
                Full stack technology review and scorecarding of data, AI, and entitlements.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">Access cleanup</h3>
              <p className="card-text">Entitlement and access cleanup.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Semantic alignment</h3>
              <p className="card-text">Data model and semantic alignment.</p>
            </div>
            <div className="card">
              <h3 className="card-title">AI readiness</h3>
              <p className="card-text">AI and automation readiness assessments.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Architecture & operating model</h3>
              <p className="card-text">Architecture and operating-model design.</p>
            </div>
          </MagicBentoGrid>

          <MagicBentoGrid variant="auto" sectionId="services-structure">
            <div className="card">
              <h3 className="card-title">Services establish structure</h3>
              <p className="card-text">Products enforce and maintain it.</p>
            </div>
            <div className="card">
              <h3 className="card-title">No perpetual cleanup cycles</h3>
              <p className="card-text">
                We don’t just prepare organizations — we help them stay prepared.
              </p>
            </div>
          </MagicBentoGrid>
        </section>

      </main>

      <section id="about" className="container">
          <h2 className="section-title">About QuantEnt</h2>

          <p className="section-lead">
            QuantEnt was founded to solve a problem we’ve repeatedly seen inside large, complex organizations: systems scale faster than shared understanding.
          </p>

          <p className="section-note">
            When meaning decays, governance fails — quietly. We build systems that prevent semantic decay, even as organizations evolve.
          </p>

          <h3 className="subhead">Leadership</h3>
          <MagicBentoGrid variant="auto" sectionId="about-leadership">
            <div className="card">
              <h4 className="card-title">Trent Walker — Founder & CEO</h4>
              <p className="card-text">
                Former Head of Enterprise Architecture and Risk Technology at Point72; Managing Director at MSCI and Barclays; CTO roles across global financial institutions.
              </p>
            </div>
            <div className="card">
              <h4 className="card-title">Justo Ruiz — Co-Founder & CTO</h4>
              <p className="card-text">
                Enterprise architect and technologist with deep experience in data modeling, trading systems, and evolvable platforms.
              </p>
            </div>
          </MagicBentoGrid>
      </section>

      <section id="contact" className="container">
          <h2 className="section-title">Talk to Us</h2>
          <p className="section-lead muted">Email addresses and Contact Phone Numbers</p>

          <div className="cta-strip">
            <p className="cta-text">Start with QuantCertify</p>
            <button className="btn btn-primary" type="button" onClick={openContact}>
              Products
            </button>
            </div>
      </section>

      <Footer />

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
              onClick={() => {
                setActiveHref(item.href);
                if (menuOpen) {
                  setMenuOpen(false);
                }
              }}
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
