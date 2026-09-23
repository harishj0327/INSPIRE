import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [application, setApplication] = useState('');
  const [quantity, setQuantity] = useState('');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
  const [supportingFile, setSupportingFile] = useState<File | null>(null);
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
        product_category: productCategory,
        application,
        quantity,
        technical_requirements: technicalRequirements,
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
          <span className="eyebrow dark">Requirement</span>
          <h1>What are you planning to procure?</h1>
          <p>Enter the procurement context and technical requirements for standards analysis.</p>
        </div>
      </div>

      <form className="card requirement-panel" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
        <label className="label">Requirement title</label>
        <input
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Industrial Safety Helmet Procurement"
          required
        />

        <div className="requirement-input-wrap">
          <label className="label">What are you planning to procure?</label>
          <textarea
            className="input textarea-input requirement-textarea"
            value={requirementText}
            onChange={(event) => setRequirementText(event.target.value)}
            placeholder="Describe what you need to procure, including quantity, application and technical requirements..."
            required
          />
        </div>

        <div className="info-grid three-column">
          <div><label className="label">Product category</label><input className="input" value={productCategory} onChange={(event) => setProductCategory(event.target.value)} placeholder="Industrial safety" /></div>
          <div><label className="label">Application</label><input className="input" value={application} onChange={(event) => setApplication(event.target.value)} placeholder="Construction / industrial work" /></div>
          <div><label className="label">Quantity</label><input className="input" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="500" /></div>
        </div>

        <div className="requirement-input-wrap">
          <label className="label">Technical requirements</label>
          <textarea className="input textarea-input" value={technicalRequirements} onChange={(event) => setTechnicalRequirements(event.target.value)} placeholder="Impact protection, testing, certification or other technical requirements" />
        </div>

        <label className="upload-field">
          <span className="label">Upload supporting specification / tender document</span>
          <span className="upload-control"><Upload size={17} />{supportingFile?.name || 'Choose PDF, DOCX or TXT'}</span>
          <input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setSupportingFile(event.target.files?.[0] || null)} />
          <span className="muted-copy">Optional supporting document. Tender cross-checking is available after standards analysis.</span>
        </label>

        {error && <div className="error-banner">{error}</div>}

        <div className="button-row justify-end">
          <button type="submit" className="button-primary inline-flex" disabled={isSubmitting}>
            {isSubmitting ? 'Analysing requirement…' : 'Analyse Requirement'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
