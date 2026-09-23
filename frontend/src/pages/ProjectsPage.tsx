export default function ProjectsPage() {
  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Project grouping</span>
          <h1>Projects</h1>
          <p>Use this area to group procurement activities where needed.</p>
        </div>
      </div>

      <div className="card panel-compact">
        <div className="empty-state">No project groups are configured yet. Use the primary requirement workflow to begin analysis and recommendation review.</div>
      </div>
    </div>
  );
}
