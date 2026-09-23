import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';

export default function StandardDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const relevanceScore = (location.state as any)?.relevanceScore ?? null;
  const [standard, setStandard] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/standards/${id}`)
      .then((res) => setStandard(res.data))
      .catch(console.error);
    api
      .get(`/standards/${id}/related`)
      .then((res) => setRelated(res.data.related || []))
      .catch(console.error);
  }, [id]);

  if (!standard) return <div className="card panel-compact">Loading standard…</div>;

  return (
    <div className="page-stack">
      <div className="card header-card">
        <div className="small-label">{standard.is_number}</div>
        <h1>{standard.title}</h1>
        {relevanceScore !== null && (
          <div className="inline-row compact-row">
            <span className="section-label">Relevance to current requirement:</span>
            <span className="score-pill">{relevanceScore}%</span>
          </div>
        )}
      </div>

      <div className="info-grid two-column">
        <div className="card panel-compact">
          <h2>Why this standard is relevant</h2>
          <p>{standard.keywords ? `Relevant technical areas include ${standard.keywords}.` : 'This standard aligns with the product, application and technical context captured in the procurement requirement.'}</p>
        </div>

        <div className="card panel-compact">
          <h2>Scope</h2>
          <p>{standard.scope || standard.description || 'No scope record is currently available for this standard.'}</p>
        </div>
      </div>

      <div className="info-grid two-column">
        <div className="card panel-compact">
          <h2>Key requirements</h2>
          <p>{standard.technical_parameters || 'No key technical requirements are recorded in the current database record.'}</p>
        </div>

        <div className="card panel-compact">
          <h2>Certification</h2>
          <p>{standard.source || 'No certification requirements are recorded for this standard in the current dataset.'}</p>
        </div>
      </div>

      <div className="info-grid two-column">
        <div className="card panel-compact">
          <h2>Testing</h2>
          <p>{standard.technical_parameters || 'No testing information is recorded for this standard in the current data set.'}</p>
        </div>

        <div className="card panel-compact">
          <h2>Version / Amendment</h2>
          <p>
            {standard.current_version || standard.year || 'No version or amendment information is recorded in the current database record.'}
          </p>
        </div>
      </div>

      <div className="card panel-compact">
        <h2>Related Standards</h2>
        {related.length ? (
          <div className="stacked-list compact-list">
            {related.map((item, index) => (
              <div key={`${item.relationship_type}-${index}`} className="list-row relation-row">
                <div>
                  <div className="row-title">{item.related_standard?.is_number} {item.related_standard?.title}</div>
                  <div className="row-meta">{item.relationship_type || 'Related standard'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No related standards are currently available for this record.</div>
        )}
      </div>

      <div className="card panel-compact">
        <h2>Source / Verification</h2>
        <div className="content-copy">
          <div><strong>Source:</strong> {standard.source || 'No source information recorded.'}</div>
          <div><strong>Source URL:</strong> {standard.source_url || 'No source URL recorded.'}</div>
          <div><strong>Last verified:</strong> {standard.last_verified_at ? new Date(standard.last_verified_at).toLocaleString() : 'Not available in the current dataset.'}</div>
        </div>
      </div>

      <div className="button-row align-start">
        <Link to="/app/tender-review" className="button-primary inline-flex">
          Review Tender Against These Standards
        </Link>
      </div>

      <div className="disclaimer small-disclaimer">
        INSPIRE relevance scoring indicates relevance to the procurement requirement. It does not by itself establish legal applicability, BIS approval, certification, or regulatory compliance.
      </div>
    </div>
  );
}
