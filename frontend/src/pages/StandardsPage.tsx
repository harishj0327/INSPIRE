import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StandardsPage() {
  const [standards, setStandards] = useState<any[]>([]);
  useEffect(() => {
    api.get('/standards').then((res) => setStandards(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1>Standards catalogue</h1>
          <p>Review connected BIS standards and technical references relevant to procurement review.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {standards.map((standard) => (
          <div key={standard.id} className="card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{standard.is_number}</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{standard.title}</div>
              </div>
              <Link to={`/app/standards/${standard.id}`} className="button-secondary">View Standard</Link>
            </div>
            <p className="mt-3 text-slate-600">{standard.description || standard.scope}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">Category: {standard.category || '—'}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Application: {standard.application || '—'}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Status: {standard.status || 'Active'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
