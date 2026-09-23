import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import api from '../services/api';

const severityStyles: Record<string, string> = {
  high: 'status-badge status-risk',
  medium: 'status-badge status-review',
  low: 'status-badge status-live',
};

export default function TenderReviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [requirementId, setRequirementId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const loadRequirements = async () => {
      try {
        const response = await api.get('/requirements');
        setRequirements(response.data);
        if (response.data.length) {
          setRequirementId(String(response.data[0].id));
        }
      } catch (err) {
        console.error('Failed to load requirements', err);
      }
    };

    loadRequirements();
  }, []);

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Upload a tender document to begin review.');
      return;
    }
    if (!requirementId) {
      setError('Select an analysed requirement before running review.');
      return;
    }

    setError('');
    setIsReviewing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/tender-reviews?requirement_id=${requirementId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Tender review failed');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Final stage</span>
          <h1>Review Tender</h1>
          <p>Upload a tender document to identify potential gaps, outdated references and unresolved requirements against the analysed procurement requirement and relevant standards.</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="card requirement-panel">
        <div>
          <label className="label">Requirement</label>
          <select className="input" value={requirementId} onChange={(event) => setRequirementId(event.target.value)}>
            {requirements.length ? (
              requirements.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))
            ) : (
              <option value="">No analysed requirements available</option>
            )}
          </select>
        </div>

        <div className="requirement-input-wrap">
          <label className="label">Upload tender document</label>
          <input
            type="file"
            className="file-input"
            accept=".pdf,.docx,.txt"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="content-copy muted-copy">Supports PDF, DOCX and TXT tender documents.</div>

        {error && <div className="error-banner">{error}</div>}

        <div className="button-row align-start">
          <button className="button-primary inline-flex" type="submit" disabled={isReviewing || !requirementId || !file}>
            {isReviewing ? 'Reviewing tender…' : 'Run Tender Review'}
          </button>
        </div>
      </form>

      {result && (
        <div className="card panel-compact">
          <div className="section-header">
            <h2>Document Summary</h2>
          </div>

          <p className="content-copy">{result.summary}</p>

          <div className="info-grid three-column">
            <div className="metric-box">
              <span>Referenced standards</span>
              <strong>{result.referenced_standards?.length || 0}</strong>
            </div>
            <div className="metric-box">
              <span>Matched standards</span>
              <strong>{result.matched_standards?.length || 0}</strong>
            </div>
            <div className="metric-box">
              <span>Unresolved requirements</span>
              <strong>{result.unresolved_requirements?.length || 0}</strong>
            </div>
          </div>

          <div className="section-header compact-header">
            <h2>Findings</h2>
          </div>

          <div className="stacked-list">
            {result.findings?.map((finding: any, index: number) => (
              <div key={`${finding.title}-${index}`} className="finding-card">
                <div className="finding-header">
                  <div>
                    <div className="row-title">{finding.title}</div>
                    <div className="row-meta">{finding.finding_type}</div>
                  </div>
                  <span className={severityStyles[finding.severity] || 'status-badge status-live'}>{finding.severity}</span>
                </div>
                <p className="content-copy">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
