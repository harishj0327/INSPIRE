import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import api from '../services/api';
import { logout } from '../utils/auth';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then((response) => setProfile(response.data)).catch(console.error);
  }, []);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow dark">Account</span>
          <h1>Settings</h1>
          <p>Manage profile and account information for this INSPIRE workspace.</p>
        </div>
      </div>

      <div className="card panel-compact">
        <div className="section-header"><h2>Profile</h2></div>
        <div className="info-grid two-column"><div><span className="label">Name</span><strong>{profile?.full_name || 'Procurement Administrator'}</strong></div><div><span className="label">Email</span><strong>{profile?.email || 'admin@inspire.local'}</strong></div><div><span className="label">Role</span><strong>Procurement officer</strong></div></div>
      </div>
      <div className="card panel-compact">
        <div className="section-header"><h2>Account</h2></div>
        <p className="content-copy">Authentication and account access are managed through the current INSPIRE account.</p>
        <button className="button-secondary inline-flex" type="button" onClick={logout}><LogOut size={16} /> Logout</button>
      </div>
    </div>
  );
}
