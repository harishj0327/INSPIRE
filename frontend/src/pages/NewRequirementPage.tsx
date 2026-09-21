import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const sampleText = 'We need 500 industrial safety helmets for construction workers with impact protection, suitable for industrial use.';

export default function NewRequirementPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Industrial Safety Helmet Procurement');
  const [requirementText, setRequirementText] = useState(sampleText);
  const [productCategory, setProductCategory] = useState('Industrial safety');
  const [application, setApplication] = useState('Construction / industrial work');
  const [quantity, setQuantity] = useState('500');
  const [technicalRequirements, setTechnicalRequirements] = useState('Impact protection, industrial use, head protection');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/requirements', {
        title,
        requirement_text: requirementText,
        product: 'Industrial safety helmet',
        product_category: productCategory,
        application,
        quantity,
        technical_requirements: technicalRequirements,
      });
      const requirementId = response.data.id;
      await api.post(`/requirements/${requirementId}/analyse`);
      navigate(`/app/requirements/${requirementId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Requirement analysis failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Find the right Indian Standards for your requirement</h1>
          <p>Describe what you need to procure and INSPIRE identifies relevant standards, related references, and review points.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Requirement title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="label">What are you planning to procure?</label>
          <textarea className="input textarea-input" value={requirementText} onChange={(e) => setRequirementText(e.target.value)} placeholder="We need 500 industrial safety helmets for construction workers with impact protection for industrial use." />
        </div>

        <div className="grid-3">
          <div>
            <label className="label">Product category</label>
            <input className="input" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} />
          </div>
          <div>
            <label className="label">Application</label>
            <input className="input" value={application} onChange={(e) => setApplication(e.target.value)} />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Technical requirements</label>
          <textarea className="input textarea-input" value={technicalRequirements} onChange={(e) => setTechnicalRequirements(e.target.value)} />
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-800">Describe requirement</div>
              <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">Requirement input</div>
            </div>
            <div className="text-sm font-medium text-slate-500">OR</div>
            <div>
              <div className="text-sm font-bold text-slate-800">Upload specification / tender</div>
              <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">Supporting document</div>
            </div>
          </div>
          <input type="file" className="mt-3 block w-full text-sm text-slate-600" accept=".pdf,.docx,.txt" />
          <div className="mt-3 text-sm text-slate-500">PDF, DOCX, TXT or pasted specification supported.</div>
        </div>

        {error && <div className="text-sm text-red-700 rounded-lg bg-red-50 border border-red-200 px-3 py-2">{error}</div>}

        <div className="flex justify-end">
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Analysing requirement…' : 'Analyse Requirement'}
          </button>
        </div>
      </form>
    </div>
  );
}
