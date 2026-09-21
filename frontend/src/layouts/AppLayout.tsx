import { Home, FolderKanban, FileText, ShieldCheck, Search, Bookmark, History, Settings, LogOut } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { logout } from '../utils/auth';

const navItems = [
  { label: 'Dashboard', to: '/app/dashboard', icon: Home },
  { label: 'Requirements', to: '/app/requirements/new', icon: FileText },
  { label: 'Standards', to: '/app/standards', icon: ShieldCheck },
  { label: 'Tender Review', to: '/app/tender-review', icon: Search },
  { label: 'Projects', to: '/app/projects', icon: FolderKanban },
  { label: 'Saved', to: '/app/saved', icon: Bookmark },
  { label: 'Audit History', to: '/app/audit', icon: History },
  { label: 'Settings', to: '/app/settings', icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">INSPIRE</div>
          <div className="sidebar-brand-subtitle">Indian Standards Procurement Intelligence</div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="header">
          <div className="header-search">
            <Search size={16} className="text-slate-400" />
            <input aria-label="Global search" placeholder="Search IS number or requirement" />
          </div>

          <div className="header-actions">
            <button className="button-ghost" type="button" title="Notifications feed is not yet enabled" disabled>
              Notifications
            </button>
            <Link to="/app/settings" className="profile-link">
              Procurement Officer
            </Link>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
