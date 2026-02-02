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

        <div className="cards-grid">
  <div className="card">
    <h3 className="card-title">System Analysis</h3>
    <p className="card-text">
      Analyze users, roles, entitlements, and data as interconnected systems.
    </p>
  </div>

  <div className="card">
    <h3 className="card-title">Quantitative Certification</h3>
    <p className="card-text">
      Certify access and meaning with mathematical rigor.
    </p>
  </div>

  <div className="card">
    <h3 className="card-title">Risk Detection</h3>
    <p className="card-text">
      Detect drift, over-exposure, and structural risk early.
    </p>
  </div>

  <div className="card">
    <h3 className="card-title">Continuous Control</h3>
    <p className="card-text">
      Maintain control as systems, data, and organizations evolve.
    </p>
  </div>
</div>
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
