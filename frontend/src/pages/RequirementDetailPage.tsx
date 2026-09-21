import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Save, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';

const workflowStages = [
  'Understanding requirement',
  'Extracting technical details',
  'Finding relevant standards',
  'Ranking matches',
  'Connecting related standards',
  'Preparing recommendations',
];

export default function RequirementDetailPage() {
  const { id } = useParams();
  const [requirement, setRequirement] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const requirementRes = await api.get(`/requirements/${id}`);
        const recsRes = await api.get(`/requirements/${id}/recommendations`);
        setRequirement(requirementRes.data);
        setRecommendations(recsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (id) load();
  }, [id]);

  const toggleSaved = async (recommendation: any) => {
    if (!id) return;
    try {
      if (recommendation.is_saved) {
        await api.delete(`/requirements/${id}/recommendations/${recommendation.id}/save`);
        setMessage('Recommendation removed from saved items.');
      } else {
        await api.post(`/requirements/${id}/recommendations/${recommendation.id}/save`, { notes: '' });
        setMessage('Recommendation saved.');
      }
      setRecommendations((items) => items.map((item) => item.id === recommendation.id ? { ...item, is_saved: !item.is_saved } : item));
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Could not update saved recommendation.');
    }
  };

  const downloadReport = async () => {
    if (!id) return;
    const response = await api.post(`/reports/recommendation/${id}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspire-recommendation-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!requirement) return <div className="card p-6">Loading requirement…</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>{requirement.title}</h1>
          <p>Requirement analysis and recommendation review.</p>
        </div>
        <button className="button-secondary inline-flex items-center gap-2" onClick={downloadReport}>
          <Download size={16} />
          Download PDF report
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="section-heading mb-0">Analysis workflow</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {workflowStages.map((stage, index) => (
            <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">{index + 1}</span>
                Stage {index + 1}
              </div>
              <div className="font-medium text-slate-700">{stage}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-heading">Understanding requirement</h2>
        <p className="mb-4 text-slate-700">{requirement.requirement_text}</p>
        <div className="grid-2">
          <div><strong>Product:</strong> {requirement.product || '—'}</div>
          <div><strong>Application:</strong> {requirement.application || '—'}</div>
          <div><strong>Product category:</strong> {requirement.product_category || '—'}</div>
          <div><strong>Quantity:</strong> {requirement.quantity || '—'}</div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-heading mb-0">Recommended Indian Standards</h2>
          <div className="score-pill">INSPIRE Match Score</div>
        </div>

        {message && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{message}</div>}

        <div className="space-y-4">
          {recommendations.length ? recommendations.map((rec) => (
            <div key={rec.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {rec.standard?.is_number || 'IS'} {rec.standard?.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">INSPIRE Match Score: {rec.score}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="score-pill">{rec.score}%</span>
                  <button className="button-secondary inline-flex items-center gap-2" onClick={() => toggleSaved(rec)}>
                    <Save size={15} />
                    {rec.is_saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-slate-700">{rec.why_it_matches}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                <div><strong>Relevant requirement elements:</strong> {rec.relevant_elements || 'Requirement criteria identified during analysis.'}</div>
                <div><strong>Related standards:</strong> {rec.related_standards?.length ? rec.related_standards.map((item: any) => item.is_number || item.title || 'Standard').join(', ') : 'No direct relationships available in the current dataset.'}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/app/standards/${rec.standard_id || rec.standard?.id}`} className="button-secondary inline-flex items-center gap-2">
                  <ExternalLink size={15} />
                  View Standard
                </Link>
                <Link to={`/app/standards?focus=${rec.standard_id || rec.standard?.id}`} className="button-ghost inline-flex items-center gap-2">
                  View Related Standards
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )) : <div className="empty-state">No recommendations yet for this requirement. Please complete the analysis step to generate candidate standards.</div>}
        </div>
      </div>

      <div className="disclaimer">
        INSPIRE provides decision-support recommendations. Verify applicability and current requirements against authoritative BIS sources before finalizing procurement specifications.
      </div>
    </div>
  );
}
