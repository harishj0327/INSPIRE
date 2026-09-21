import { useEffect, useState } from 'react';
import api from '../services/api';

const actionLabelMap: Record<string, string> = {
  requirement_created: 'Requirement created',
  requirement_analyzed: 'Requirement analysed',
  recommendation_saved: 'Recommendation saved',
  recommendation_unsaved: 'Recommendation removed',
  tender_review_created: 'Tender review completed',
  tender_finding_generated: 'Finding generated',
  register: 'User registered',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/audit').then((res) => setLogs(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1>Audit History</h1>
          <p>Record of recent requirement, recommendation, and review activity.</p>
        </div>
      </div>

      <div className="card p-6">
        {logs.length ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{actionLabelMap[log.action] || log.action}</div>
                  <div className="text-sm text-slate-500">{log.object_type || 'Activity'} • {log.object_id || '—'}</div>
                </div>
                <div className="text-sm text-slate-600 md:text-right">
                  <div>{new Date(log.created_at).toLocaleString()}</div>
                  <div className="mt-1">{log.details}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No audit activity yet. Activity will appear here as requirements, recommendations and tenders are reviewed.</div>
        )}
      </div>
    </div>
  );
}
