import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function SavedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/requirements/saved')
      .then((response) => setItems(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Saved recommendations could not be loaded.'));
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
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Saved shortlist</span>
          <h1>Saved Recommendations</h1>
          <p>Standards retained for procurement review and follow-up.</p>
        </div>
      </div>

      <div className="card panel-compact">
        {error && <div className="error-banner">{error}</div>}

        {items.length ? (
          <div className="stacked-list">
            {items.map((item) => (
              <div key={item.id} className="list-row recommendation-row">
                <div>
                  <div className="row-title">{item.standard?.is_number} {item.standard?.title}</div>
                  <div className="row-meta">Relevance: {item.recommendation?.score || 0}%</div>
                  <div className="row-meta">Requirement: {item.requirement?.title}</div>
                  <div className="row-meta">Saved: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}</div>
                </div>

                <div className="row-actions">
                  {item.requirement?.id && (
                    <Link to={`/app/requirements/${item.requirement.id}`} className="button-secondary small-button inline-flex">
                      <ArrowUpRight size={15} />
                      Open
                    </Link>
                  )}
                  <button onClick={() => remove(item)} className="button-secondary small-button danger-button inline-flex">
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No saved recommendations yet.</div>
        )}
      </div>
    </div>
  );
}
