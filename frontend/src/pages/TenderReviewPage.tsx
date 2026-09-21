import { ChangeEvent, FormEvent, useState } from 'react';
import api from '../services/api';

const severityStyles: Record<string, string> = {
  high: 'status-badge status-risk',
  medium: 'status-badge status-review',
  low: 'status-badge status-live',
};

export default function TenderReviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [requirementId, setRequirementId] = useState('1');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please upload a PDF, DOCX or TXT tender document');
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
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Tender Review</h1>
          <p>Check uploaded tender documents against requirement-linked standards and review findings.</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="card p-6 space-y-5">
        <div>
          <label className="label">Requirement ID</label>
          <input className="input" value={requirementId} onChange={(e) => setRequirementId(e.target.value)} />
        </div>
        <div>
          <label className="label">Tender specification document</label>
          <input type="file" className="block w-full text-sm text-slate-600" accept=".pdf,.docx,.txt" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button className="button-primary" type="submit" disabled={isReviewing}>
          {isReviewing ? 'Reviewing tender…' : 'Run Tender Review'}
        </button>
      </form>

      {result && (
        <div className="card p-6">
          <div className="text-xl font-semibold">Document Summary</div>
          <p className="mt-3 text-slate-700">{result.summary}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Referenced standards</div>
              <div className="mt-2 font-semibold">{result.referenced_standards?.length || 0}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Matched standards</div>
              <div className="mt-2 font-semibold">{result.matched_standards?.length || 0}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Unresolved requirements</div>
              <div className="mt-2 font-semibold">{result.unresolved_requirements?.length || 0}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {result.findings?.map((finding: any, index: number) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{finding.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{finding.finding_type}</div>
                  </div>
                  <span className={severityStyles[finding.severity] || 'status-badge status-live'}>{finding.severity}</span>
                </div>
                <p className="mt-3 text-slate-700">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
