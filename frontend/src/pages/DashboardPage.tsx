import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const trimmedTitle = title.trim() || 'Procurement Requirement';
      const response = await api.post('/requirements', {
        title: trimmedTitle,
        requirement_text: requirementText,
        product: '',
        product_category: '',
        application: '',
        quantity: '',
        technical_requirements: '',
      });

      await api.post(`/requirements/${response.data.id}/analyse`);
      navigate(`/app/requirements/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Requirement analysis failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-intro">
        <div>
          <span className="eyebrow dark">INSPIRE</span>
          <h1>Start with your procurement requirement.</h1>
          <p>What are you looking to procure?</p>
        </div>
      </div>

      <div className="card requirement-panel">
        <label className="label">Requirement title</label>
        <input
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Industrial Safety Helmet Procurement"
        />

        <div className="requirement-input-wrap">
          <label className="label">Procurement requirement</label>
          <textarea
            className="input textarea-input requirement-textarea"
            value={requirementText}
            onChange={(event) => setRequirementText(event.target.value)}
            placeholder="Describe what you need to procure, including quantity, application and technical requirements..."
          />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="button-row">
          <button type="button" className="button-primary inline-flex" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Analysing requirement…' : 'Analyse Requirement'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
