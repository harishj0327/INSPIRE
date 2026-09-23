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

  if (!requirement) return <div className="card panel-compact">Loading requirement…</div>;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Requirement Understanding</span>
          <h1>{requirement.title}</h1>
          <p>{requirement.requirement_text}</p>
        </div>
        <button className="button-secondary inline-flex" onClick={downloadReport}>
          <Download size={16} />
          Download Recommendation Report
        </button>
      </div>

      <div className="card panel-compact">
        <div className="section-header">
          <h2>Requirement details</h2>
        </div>

        <div className="info-grid two-column">
          <div><strong>Product / Item:</strong> {requirement.product || '—'}</div>
          <div><strong>Quantity:</strong> {requirement.quantity || '—'}</div>
          <div><strong>Application / Intended Use:</strong> {requirement.application || '—'}</div>
          <div><strong>Category:</strong> {requirement.product_category || '—'}</div>
          <div className="two-column-span"><strong>Technical Requirements:</strong> {requirement.technical_requirements || '—'}</div>
          <div className="two-column-span"><strong>Other Relevant Constraints:</strong> {requirement.requirement_text || '—'}</div>
        </div>

        <div className="button-row align-start">
          <Link to="#recommended-standards" className="button-primary inline-flex">
            View Recommended Standards
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div id="recommended-standards" className="card panel-compact">
        <div className="section-header">
          <h2>Recommended Indian Standards</h2>
        </div>

        {message && <div className="error-banner">{message}</div>}

        <div className="stacked-list">
          {recommendations.length ? (
            recommendations.map((rec) => (
              <div key={rec.id} className="finding-card">
                <div className="finding-header">
                  <div>
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
                  <p><strong>Certification Information:</strong> {rec.standard?.source || 'Certification details should be verified against the authoritative BIS source.'}</p>
                  <p><strong>Testing Information:</strong> {rec.standard?.technical_parameters || 'Testing details are recorded in the standard data.'}</p>
                  <p><strong>Version / Amendment:</strong> {rec.standard?.current_version || rec.standard?.year || 'Version information is not available in the current dataset.'}</p>
                  <p><strong>Source:</strong> {rec.standard?.source || 'Source information available through the current database record.'}</p>
                  <p><strong>Last Verified:</strong> {rec.standard?.last_verified_at ? new Date(rec.standard.last_verified_at).toLocaleString() : 'Not recorded in the current data set.'}</p>
                  <p><strong>Related Standards:</strong> {rec.related_standards?.length ? rec.related_standards.map((item: any) => `${item.is_number || item.id} ${item.title || ''}`.trim()).join(', ') : 'No direct relationships are currently recorded.'}</p>
                </div>

                <div className="button-row align-start">
                  <Link
                    to={`/app/standards/${rec.standard_id || rec.standard?.id}`}
                    state={{ relevanceScore: rec.score }}
                    className="button-secondary inline-flex"
                  >
                    <ExternalLink size={15} />
                    View Standard
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No recommendations yet for this requirement.</div>
          )}
        </div>
      </div>

      <div className="disclaimer small-disclaimer">
        INSPIRE relevance scoring indicates relevance to the procurement requirement. It does not by itself establish legal applicability, BIS approval, certification, or regulatory compliance.
      </div>
    </div>
  );
}
