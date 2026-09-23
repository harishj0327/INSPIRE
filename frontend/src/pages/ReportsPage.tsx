import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.get('/audit'), api.get('/requirements')]).then(([auditResponse, requirementsResponse]) => {
      const requirements = Object.fromEntries(requirementsResponse.data.map((item: any) => [item.id, item.title]));
      setReports(auditResponse.data.filter((item: any) => item.action === 'recommendation_report_generated').map((item: any) => ({ ...item, requirementTitle: requirements[item.object_id] || 'Requirement' })));
    }).catch(console.error);
  }, []);

  const download = async (requirementId: number) => {
    const response = await api.post(`/reports/recommendation/${requirementId}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspire-recommendation-${requirementId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Document centre</span>
          <h1>Reports</h1>
          <p>Generated recommendation reports available for download.</p>
        </div>
      </div>
      <div className="card panel-compact">
        {reports.length ? reports.map((report) => (
          <div className="list-row" key={report.id}>
            <div>
              <div className="row-title">{report.requirementTitle}</div>
              <div className="row-meta">Recommendation Report · {new Date(report.created_at).toLocaleString()}</div>
            </div>
            {report.object_id && <button className="button-secondary small-button inline-flex" onClick={() => void download(report.object_id)}><Download size={15} /> Download</button>}
          </div>
        )) : <div className="empty-state">No generated reports yet.</div>}
      </div>
    </div>
  );
}
