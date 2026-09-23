import { Home, FileText, ShieldCheck, Search, Bookmark, History, Settings, LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { logout } from '../utils/auth';

const navItems = [
  { label: 'Home', to: '/app/dashboard', icon: Home },
  { label: 'Requirements', to: '/app/requirements/new', icon: FileText },
  { label: 'Standards', to: '/app/standards', icon: ShieldCheck },
  { label: 'Tender Review', to: '/app/tender-review', icon: Search },
  { label: 'Saved Recommendations', to: '/app/saved', icon: Bookmark },
  { label: 'Audit History', to: '/app/audit', icon: History },
  { label: 'Reports', to: '/app/settings', icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">INSPIRE</div>
          <div className="sidebar-brand-subtitle">Indian Standards Procurement Intelligence & Recommendation Engine</div>
        </div>

        <div className="sidebar-section">
          <nav className="sidebar-nav" aria-label="Application navigation">
            {navItems.map(({ label, to, icon: Icon }, index) => (
              <div key={label} className={index === 4 ? 'nav-divider' : undefined}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </div>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="nav-link logout-link" onClick={logout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
