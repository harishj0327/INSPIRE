import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Save } from 'lucide-react';
import api from '../services/api';

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

      setRecommendations((items) =>
        items.map((item) => (item.id === recommendation.id ? { ...item, is_saved: !item.is_saved } : item))
      );
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

  if (!requirement) return <div className="card panel-compact">Loading recommendations…</div>;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Recommendation context</span>
          <h1>Recommended Indian Standards</h1>
          <p>Standards identified based on your procurement requirement.</p>
        </div>
        <button className="button-secondary inline-flex" onClick={downloadReport}>
          <Download size={16} />
          Download Recommendation Report
        </button>
      </div>

      <div className="card panel-compact">
        <div className="context-kicker">Requirement</div>
        <h2>{requirement.title}</h2>
        <p className="content-copy">{requirement.requirement_text}</p>
        <div className="context-line">
          {[requirement.quantity && `${requirement.quantity} units`, requirement.product_category, requirement.application].filter(Boolean).join(' · ')}
        </div>
      </div>

      <div id="recommended-standards" className="card panel-compact">
        <div className="section-header">
          <h2>Recommended standards</h2>
          <span className="muted-copy">{recommendations.length} identified</span>
        </div>

        {message && <div className="error-banner">{message}</div>}

        <div className="stacked-list">
          {recommendations.length ? (
            recommendations.map((rec, index) => (
              <div key={rec.id} className="finding-card">
                <div className="finding-header">
                  <div>
                    <div className="small-label">{index === 0 ? 'Primary recommendation' : 'Related recommendation'}</div>
                    <div className="row-title">{rec.standard?.is_number || 'IS'} {rec.standard?.title}</div>
                    <div className="row-meta">{rec.score}% Relevant</div>
                  </div>
                  <div className="row-actions">
                    <span className="score-pill">{rec.score}%</span>
                    <button className="button-secondary small-button inline-flex" onClick={() => toggleSaved(rec)}>
                      <Save size={15} />
                      {rec.is_saved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="content-copy">
                  <p><strong>Why it is relevant:</strong> {rec.why_it_matches}</p>
                  <p><strong>Scope / Applicability:</strong> {rec.standard?.scope || rec.standard?.description || 'Scope available in the database record.'}</p>
                  <p><strong>Certification / conformity:</strong> {rec.standard?.source || 'Information is not available in the current database record.'}</p>
                  <p><strong>Testing Information:</strong> {rec.standard?.technical_parameters || 'Testing details are recorded in the standard data.'}</p>
                  <p><strong>Version / Amendment:</strong> {rec.standard?.current_version || rec.standard?.year || 'Version information is not available in the current dataset.'}</p>
                  <p><strong>Source:</strong> {rec.standard?.source || 'Source information available through the current database record.'}</p>
                  <p><strong>Last Verified:</strong> {rec.standard?.last_verified_at ? new Date(rec.standard.last_verified_at).toLocaleString() : 'Not recorded in the current data set.'}</p>
                  <p><strong>Related Standards:</strong> {rec.related_standards?.length ? rec.related_standards.map((item: any) => `${item.is_number || item.id} ${item.title || ''}`.trim()).join(', ') : 'No direct relationships are currently recorded.'}</p>
                </div>

                <div className="button-row align-start">
                  <Link
                    to={`/app/standards/${rec.standard_id || rec.standard?.id}`}
                    state={{ relevanceScore: rec.score, requirementId: id }}
                    className="button-secondary inline-flex"
                  >
                    <ExternalLink size={15} />
                    View Standard Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No recommendations yet for this requirement.</div>
          )}
        </div>
      </div>

      <div className="card panel-compact">
        <div className="section-header"><h2>Related standards</h2></div>
        <div className="stacked-list compact-list">
          {recommendations.flatMap((rec) => rec.related_standards || []).filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index).map((item: any) => (
            <div className="list-row" key={item.id}>
              <div><div className="small-label">{item.is_number}</div><div className="row-title">{item.title}</div><div className="row-meta">{item.description || item.scope || 'Related standard in the current database record.'}</div></div>
              <Link to={`/app/standards/${item.id}`} state={{ requirementId: id }} className="button-secondary small-button">View Standard</Link>
            </div>
          ))}
        </div>
        {!recommendations.some((rec) => rec.related_standards?.length) && <div className="empty-state">No related standards are currently recorded.</div>}
      </div>

      <div className="button-row justify-end">
        <Link to={`/app/tender-review?requirement_id=${id}`} className="button-primary inline-flex">
          Review Tender Against These Standards <ArrowRight size={18} />
        </Link>
      </div>

      <div className="disclaimer small-disclaimer">
        INSPIRE relevance scoring indicates relevance to the procurement requirement. It does not by itself establish legal applicability, BIS approval, certification, or regulatory compliance.
      </div>
    </div>
  );
}
