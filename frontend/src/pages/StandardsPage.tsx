import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StandardsPage() {
  const [standards, setStandards] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/standards')
      .then((res) => setStandards(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Standards catalogue</span>
          <h1>Recommended Indian Standards</h1>
          <p>Standards identified based on your procurement requirement.</p>
        </div>
      </div>

      <div className="stacked-list">
        {standards.map((standard) => (
          <div key={standard.id} className="list-row standard-row">
            <div>
              <div className="small-label">{standard.is_number}</div>
              <div className="row-title">{standard.title}</div>
              <div className="row-meta">{standard.scope || standard.description || 'Scope information is available in the database record.'}</div>
            </div>
            <Link to={`/app/standards/${standard.id}`} className="button-secondary small-button">
              View Standard
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
