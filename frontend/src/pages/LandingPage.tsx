import { ArrowRight, Check, FileText, Search, Sparkles, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  'Requirement-based recommendation',
  'Context-based matching',
  'Related & normative standard linking',
  'Version & amendment awareness',
  'Tender specification checking',
];

const workflow = ['Requirement', 'Understand', 'Recommend', 'Connect', 'Review'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold tracking-tight">INSPIRE</div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/login" className="rounded-xl bg-slate-900 px-4 py-2 text-white">Login</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="hero-grid items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              Indian Standards Procurement Intelligence
            </div>
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight text-slate-900">
              Find the right Indian Standards from your procurement requirement.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              INSPIRE helps procurement officers identify relevant Indian Standards, connect related standards and review technical specifications in one place.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/app/dashboard" className="button-primary inline-flex items-center gap-2">
                Start a Requirement <ArrowRight size={18} />
              </Link>
              <Link to="/app/standards" className="button-secondary inline-flex items-center gap-2">
                Explore Standards
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-5 flex items-center gap-3 text-slate-700">
              <Sparkles className="text-blue-600" size={18} />
              <span className="font-semibold">INSPIRE workflow</span>
            </div>
            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <div className="text-base font-medium text-slate-700">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="features" className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="card p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Check size={18} />
              </div>
              <div className="text-lg font-semibold">{feature}</div>
            </div>
          ))}
        </section>

        <section id="workflow" className="mt-20 card p-8">
          <div className="mb-6 flex items-center gap-3 text-slate-700">
            <Workflow size={20} className="text-blue-600" />
            <h2 className="text-2xl font-semibold">How INSPIRE works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <FileText className="mb-3 text-blue-600" size={20} />
              <div className="font-semibold">Requirement</div>
              <p className="mt-2 text-sm text-slate-600">Capture what you need to procure.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <Search className="mb-3 text-blue-600" size={20} />
              <div className="font-semibold">Understand</div>
              <p className="mt-2 text-sm text-slate-600">Extract product, application and technical context.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <Check className="mb-3 text-blue-600" size={20} />
              <div className="font-semibold">Recommend</div>
              <p className="mt-2 text-sm text-slate-600">Retrieve and rank relevant Indian Standards.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <Sparkles className="mb-3 text-blue-600" size={20} />
              <div className="font-semibold">Review</div>
              <p className="mt-2 text-sm text-slate-600">Check related standards and tender gaps.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
