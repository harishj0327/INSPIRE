import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Plus, ShieldCheck, Bookmark, ClipboardCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ active: 0, standards: 0, reviews: 0, saved: 0 });
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [requirementsRes, statsRes] = await Promise.all([
          api.get('/requirements'),
          api.get('/dashboard/stats'),
        ]);
        setRequirements(requirementsRes.data);
        setStats({
          active: statsRes.data.active_requirements,
          standards: statsRes.data.standards_recommended,
          reviews: statsRes.data.tender_reviews,
          saved: statsRes.data.saved_standards,
        });
      } catch (error) {
        console.error('Dashboard load failed', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>What is happening with my procurement standards work?</p>
        </div>
        <Link to="/app/requirements/new" className="button-primary inline-flex items-center gap-2">
          <Plus size={18} />
          + New Requirement
        </Link>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <CheckCircle2 size={18} className="text-blue-600" />
          <span className="font-semibold">Core workflow</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="status-badge status-live">Create Requirement</span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="status-badge status-review">Analyse</span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="status-badge status-live">Review Recommendations</span>
        </div>
      </div>

      <div className="grid-4">
        <StatCard icon={<FileText size={18} />} label="Active Requirements" value={stats.active} />
        <StatCard icon={<ShieldCheck size={18} />} label="Standards Recommended" value={stats.standards} />
        <StatCard icon={<ClipboardCheck size={18} />} label="Tender Reviews" value={stats.reviews} />
        <StatCard icon={<Bookmark size={18} />} label="Saved Standards" value={stats.saved} />
      </div>

      <div className="grid-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BarChart3 size={18} className="text-blue-600" />
            Recent Activity
          </div>

          {loading ? (
            <div className="empty-state">Loading requirement activity…</div>
          ) : requirements.length ? (
            <div className="space-y-3">
              {requirements.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.status || 'Draft'}</div>
                  </div>
                  <Link to={`/app/requirements/${item.id}`} className="text-sm font-semibold text-blue-700">View</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No requirements yet. Create your first requirement to start the review workflow.</div>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 text-lg font-semibold">Recent requirement examples</div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-200 p-3">Industrial Safety Helmet Procurement</li>
            <li className="rounded-xl border border-slate-200 p-3">Water Storage Tank Procurement</li>
            <li className="rounded-xl border border-slate-200 p-3">Electrical Cable Procurement</li>
            <li className="rounded-xl border border-slate-200 p-3">Construction Safety Shoes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2 text-blue-700">{icon}</div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}
