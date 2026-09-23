import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StandardsPage() {
  const [standards, setStandards] = useState<any[]>([]);
  const [query, setQuery] = useState('');

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
          <h1>Indian Standards Catalogue</h1>
          <p>Browse standards independently from any procurement recommendation.</p>
        </div>
      </div>

      <div className="card panel-compact catalogue-search">
        <label className="label" htmlFor="standard-search">Search standards</label>
        <input id="standard-search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by standard number, title or category" />
      </div>

      <div className="stacked-list">
        {standards.filter((standard) => `${standard.is_number} ${standard.title} ${standard.category} ${standard.description}`.toLowerCase().includes(query.toLowerCase())).map((standard) => (
          <div key={standard.id} className="list-row standard-row">
            <div>
              <div className="small-label">{standard.is_number}</div>
              <div className="row-title">{standard.title}</div>
              <div className="row-meta">{standard.category || 'Category not recorded'} · {standard.scope || standard.description || 'Description is not recorded in the database.'}</div>
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
