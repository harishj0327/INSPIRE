import { useEffect, useState } from 'react';
import api from '../services/api';

const actionLabelMap: Record<string, string> = {
  requirement_created: 'Requirement created',
  requirement_analyzed: 'Requirement analysed',
  recommendation_saved: 'Recommendation saved',
  recommendation_unsaved: 'Recommendation removed',
  tender_review_created: 'Tender reviewed',
  tender_finding_generated: 'Finding generated',
  register: 'User registered',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/audit')
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Traceability</span>
          <h1>Audit History</h1>
          <p>Date, action and requirement activity for review and accountability.</p>
        </div>
      </div>

      <div className="card panel-compact">
        {logs.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Action</th>
                  <th>Requirement</th>
                  <th>User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{actionLabelMap[log.action] || log.action}</td>
                    <td>{log.object_type || 'Requirement'}</td>
                    <td>{log.user?.full_name || 'Procurement officer'}</td>
                    <td>{log.details || 'No additional details recorded.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No audit activity yet.</div>
        )}
      </div>
    </div>
  );
}
