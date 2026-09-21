import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function StandardDetailPage() {
  const { id } = useParams();
  const [standard, setStandard] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/standards/${id}`).then((res) => setStandard(res.data)).catch(console.error);
    api.get(`/standards/${id}/related`).then((res) => setRelated(res.data.related || [])).catch(console.error);
  }, [id]);

  if (!standard) return <div className="card p-6">Loading standard…</div>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{standard.is_number}</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{standard.title}</h1>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.12em] text-slate-500">Status</div><div className="mt-2 font-semibold">{standard.status || 'Active'}</div></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.12em] text-slate-500">Version</div><div className="mt-2 font-semibold">{standard.current_version || standard.year || '—'}</div></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.12em] text-slate-500">Review</div><div className="mt-2 font-semibold">{standard.review_year || standard.year || '—'}</div></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.12em] text-slate-500">Category</div><div className="mt-2 font-semibold">{standard.category || '—'}</div></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-heading">Overview</h2>
          <p className="text-slate-700">{standard.description || standard.scope || 'No descriptive overview is available for this standard in the current dataset.'}</p>
        </div>
        <div className="card p-6">
          <h2 className="section-heading">Scope</h2>
          <p className="text-slate-700">{standard.scope || standard.description || 'No scope statement has been recorded for this standard.'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-heading">Why it was recommended</h2>
          <p className="text-slate-700">{standard.keywords ? `Relevant technical areas include ${standard.keywords}.` : 'This standard was included because it aligns with the relevant product and technical context of the procurement requirement.'}</p>
        </div>
        <div className="card p-6">
          <h2 className="section-heading">Related standards</h2>
          {related.length ? (
            <div className="space-y-3">
              {related.map((item, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="font-semibold text-slate-800">{item.relationship_type || 'Related standard'}</div>
                  <div className="mt-1 text-slate-600">{item.related_standard?.is_number} {item.related_standard?.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No related standards are currently available for this record.</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-heading">Testing</h2>
          <p className="text-slate-700">{standard.technical_parameters || 'No testing parameters were captured in the current prototype dataset.'}</p>
        </div>
        <div className="card p-6">
          <h2 className="section-heading">Certification</h2>
          <p className="text-slate-700">{standard.source || 'Certification requirements should be validated against the relevant BIS or authority documentation.'}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-heading">Source</h2>
        <p className="text-slate-700">{standard.source || 'Demo dataset — verify against official BIS source.'}</p>
        <div className="mt-2 text-sm text-slate-500">{standard.source_url || 'Source URL unavailable in the current prototype dataset.'}</div>
      </div>

      <div className="disclaimer">
        INSPIRE provides decision-support recommendations. Verify applicability and current requirements against authoritative BIS sources before finalizing procurement specifications.
      </div>
    </div>
  );
}
