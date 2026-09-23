import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const severityStyles: Record<string, string> = {
  high: 'status-badge status-risk',
  medium: 'status-badge status-review',
  low: 'status-badge status-live',
};

export default function TenderReviewPage() {
  const [searchParams] = useSearchParams();
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
          const requestedId = searchParams.get('requirement_id');
          setRequirementId(requestedId && response.data.some((item: any) => String(item.id) === requestedId) ? requestedId : String(response.data[0].id));
        }
      } catch (err) {
        console.error('Failed to load requirements', err);
      }
    };

    loadRequirements();
  }, [searchParams]);

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

  const selectedRequirement = requirements.find((item) => String(item.id) === requirementId);
  const findings = result?.findings?.filter((finding: any) => finding.finding_type !== 'Review passed') || [];
  const downloadReviewReport = async () => {
    if (!requirementId) return;
    const response = await api.post(`/reports/recommendation/${requirementId}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspire-review-${requirementId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Cross-check</span>
          <h1>Tender Review</h1>
          <p>Upload an already-prepared tender or procurement specification to cross-check it against the identified requirements and standards.</p>
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

        {selectedRequirement && <div className="context-panel"><strong>{selectedRequirement.title}</strong><span>{selectedRequirement.product_category || 'Requirement'} · {selectedRequirement.application || 'Application not recorded'}</span></div>}

        <div className="requirement-input-wrap">
          <label className="label">Upload tender / specification</label>
          <input
            type="file"
            className="file-input"
            accept=".pdf,.docx,.txt"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="content-copy muted-copy"><Upload size={15} /> Supports PDF, DOCX and TXT tender documents. Upload the revised document here to review the same requirement again.</div>

        {error && <div className="error-banner">{error}</div>}

        <div className="button-row align-start">
          <button className="button-primary inline-flex" type="submit" disabled={isReviewing || !requirementId || !file}>
            {isReviewing ? 'Reviewing tender…' : 'Review Tender'}
          </button>
        </div>
      </form>

      {result && (
        <div className="card panel-compact">
          <div className="section-header">
            <h2>Document Summary</h2>
          </div>

          <p className="content-copy">{result.summary}</p>

          {findings.length === 0 ? (
            <div className="success-panel"><h2>Review complete</h2><p>No potential issues were detected based on the available requirements and identified standards.</p><div className="success-list"><span>✓ No missing requirements detected</span><span>✓ No unresolved items detected</span><span>✓ No outdated/reference issues flagged</span></div><button className="button-primary inline-flex" type="button" onClick={() => void downloadReviewReport()}><Download size={16} /> Download Review Report</button></div>
          ) : (
            <>
              <div className="section-header compact-header"><h2>Identified standards</h2></div>
              <div className="tag-list">{result.matched_standards?.map((standard: any) => <span className="tag" key={standard.is_number}>{standard.is_number} · {standard.title}</span>)}</div>
              <div className="section-header compact-header"><h2>Potential issues</h2></div>
            </>
          )}

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
            {findings.map((finding: any, index: number) => (
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
          {result.unresolved_requirements?.length > 0 && <div className="content-copy"><strong>Unresolved requirements:</strong> {result.unresolved_requirements.join(', ')}</div>}
        </div>
      )}
    </div>
  );
}
