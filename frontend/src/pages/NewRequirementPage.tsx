import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import api from '../services/api';

export default function NewRequirementPage() {
  const [requirements, setRequirements] = useState<any[]>([]);

  useEffect(() => {
    api.get('/requirements').then((response) => setRequirements(response.data)).catch(console.error);
  }, []);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Requirement workspace</span>
          <h1>Requirements</h1>
          <p>Open an existing procurement analysis or start a new one from the Dashboard.</p>
        </div>
        <Link to="/app/dashboard" className="button-primary inline-flex"><Plus size={17} /> New Requirement</Link>
      </div>

      <div className="card panel-compact">
        {requirements.length ? requirements.map((item) => (
          <div key={item.id} className="list-row">
            <div><div className="row-title">{item.title}</div><div className="row-meta">{item.product_category || 'Requirement'} · {item.status || 'Draft'}</div></div>
            <Link to={`/app/requirements/${item.id}`} className="button-secondary small-button inline-flex">Open <ArrowRight size={15} /></Link>
          </div>
        )) : <div className="empty-state">No requirements yet. Start from the Dashboard.</div>}
      </div>
    </div>
  );
}
