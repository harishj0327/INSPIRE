import { Bookmark, History, LogOut, Settings, ShieldCheck, UserCircle, FileText } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';

const utilityLinks = [
  { label: 'Saved', to: '/app/saved', icon: Bookmark },
  { label: 'Audit history', to: '/app/audit', icon: History },
  { label: 'Reports', to: '/app/reports', icon: FileText },
];

export default function AppLayout() {
  const location = useLocation();
  const pageLabel = location.pathname.includes('/standards/')
    ? 'Standard Details'
    : location.pathname.includes('/tender-review')
      ? 'Tender Review'
      : location.pathname.includes('/saved')
        ? 'Saved Recommendations'
        : location.pathname.includes('/audit')
          ? 'Audit History'
          : location.pathname.includes('/settings')
            ? 'Settings'
            : location.pathname.includes('/reports')
              ? 'Reports'
            : location.pathname.includes('/standards')
              ? 'Indian Standards Catalogue'
              : location.pathname.includes('/requirements/')
                ? 'Recommended Indian Standards'
                : 'Procurement Requirement';

  return (
    <div className="app-shell">
      <main className="main-panel">
        <header className="topbar">
          <Link to="/app/dashboard" className="topbar-brand">
            <span className="brand-mark">I</span>
            <span>INSPIRE</span>
          </Link>
          <nav className="topbar-nav" aria-label="Application navigation">
            <NavLink to="/app/dashboard" end>Analyse requirements</NavLink>
            <NavLink to="/app/standards">Standards</NavLink>
            <NavLink to="/app/tender-review">Tender review</NavLink>
            {utilityLinks.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to}><Icon size={15} />{label}</NavLink>)}
            <NavLink to="/app/settings" className="settings-link"><Settings size={16} /><span className="sr-only">Settings</span></NavLink>
          </nav>
          <div className="topbar-context">
            <span className="page-context">{pageLabel}</span>
            <Link to="/app/settings" className="profile-link inline-flex" aria-label="Profile and settings">
              <UserCircle size={17} />
            </Link>
            <button className="logout-button" onClick={logout} type="button" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
