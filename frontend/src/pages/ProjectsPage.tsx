export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Track procurement work packages and the requirements they contain.</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 text-lg font-semibold">Project portfolio</div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-lg font-bold text-slate-900">Construction Safety Program</div>
            <div className="mt-2 text-sm text-slate-600">Requirements: Safety Helmets, Safety Shoes, Safety Harnesses</div>
            <div className="mt-2 text-sm text-slate-600">Recommendations: 12 standards reviewed</div>
            <div className="mt-2 text-sm text-slate-600">Tender reviews: 3</div>
          </div>
        </div>
      </div>
    </div>
  );
}
