import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function SavedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/requirements/saved').then((response) => setItems(response.data)).catch((requestError) => setError(requestError.response?.data?.detail || 'Saved recommendations could not be loaded.'));
  }, []);

  const remove = async (item: any) => {
    try {
      await api.delete(`/requirements/${item.requirement.id}/recommendations/${item.recommendation.id}/save`);
      setItems((current) => current.filter((saved) => saved.id !== item.id));
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Saved recommendation could not be removed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1>Saved Recommendations</h1>
          <p>Standards retained for procurement review and follow-up.</p>
        </div>
      </div>

      <div className="card p-6">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{item.standard?.is_number} {item.standard?.title}</div>
                    <div className="mt-1 text-sm text-slate-600">Match score: {item.recommendation?.score}%</div>
                    <div className="mt-2 text-sm text-slate-600">Requirement: {item.requirement?.title}</div>
                    <div className="mt-2 text-sm text-slate-600">Notes: {item.notes || 'No notes added.'}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">Saved: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.requirement?.id && (
                      <Link to={`/app/requirements/${item.requirement.id}`} className="button-secondary inline-flex items-center gap-2">
                        <ArrowUpRight size={15} />
                        View
                      </Link>
                    )}
                    <button onClick={() => remove(item)} className="button-secondary inline-flex items-center gap-2 text-red-700">
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No saved recommendations yet. Save standards from a requirement review to keep them in your shortlist.</div>
        )}
      </div>
    </div>
  );
}
