import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Relevant Indian Standards',
    description: 'Identify standards related to the procurement requirement.',
    icon: ShieldCheck,
  },
  {
    title: 'Explainable Recommendations',
    description: 'Understand why a standard is relevant to the requirement.',
    icon: Sparkles,
  },
  {
    title: 'Certification & Testing Information',
    description: 'View supporting standard information needed for procurement review.',
    icon: CheckCircle2,
  },
  {
    title: 'Tender Review Support',
    description: 'Use identified standards to review tender specifications.',
    icon: FileText,
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand-lockup">INSPIRE</div>
        <nav className="landing-nav" aria-label="Public navigation">
          <a href="#features">Features</a>
          <Link to="/login" className="button-primary small-button">Log In</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">Indian Standards Procurement Intelligence & Recommendation Engine</div>
            <h1>Find the right Indian Standards for your procurement requirement.</h1>
            <p>
              INSPIRE helps procurement officers identify relevant Indian Standards from product, application and technical requirements, with explainable recommendations and supporting standard information.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="button-primary inline-flex">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#features" className="button-secondary inline-flex">Learn More</a>
            </div>
          </div>
        </section>

        <section id="features" className="feature-section">
          <div className="section-header compact-header">
            <span className="eyebrow dark">What INSPIRE provides</span>
          </div>

          <div className="feature-grid">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon"><Icon size={18} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
