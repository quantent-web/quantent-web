export default function Home() {
  return (
    <main className="container">
      {/* HERO */}
      <section className="section">
        <h1 className="hero-title">
          Creating Institutional Control over Entitlements and Data
        </h1>

        <p className="hero-subtitle">
          Quantitative models and mathematics for entitlement and data governance.
        </p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#contact">
            Request a demo
          </a>
          <a className="btn btn-secondary" href="#what-we-do">
            What we do
          </a>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section id="what-we-do" className="section">
        <h2 className="section-title">What We Do</h2>

        <p className="section-lead">
          QuantEnt analyzes and certifies who can access what — and what that data
          means — using quantitative models instead of static rules.
        </p>

        <ul className="bullets">
          <li>Analyze users, roles, entitlements, and data as interconnected systems</li>
          <li>Certify access and meaning with mathematical rigor</li>
          <li>Detect drift, over-exposure, and structural risk early</li>
          <li>Maintain control as systems, data, and organizations evolve</li>
        </ul>
      </section>

      {/* CONTACT (placeholder) */}
      <section id="contact" className="section">
        <h2 className="section-title">Contact</h2>
        <p className="section-lead muted">
          Add your contact form or email link here.
        </p>
      </section>
    </main>
  );
}
