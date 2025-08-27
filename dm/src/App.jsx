import { Link, Route, Routes, Navigate } from 'react-router-dom';
import CampaignsPage from './features/campaigns/CampaignsPage';
import UserBadge from './features/user/UserBadge';
import CampaignDetailPage from './features/campaigns/CampaignDetailPage';


function Layout({ children }) {
  return (
    <div className="shell">
      <nav className="topbar">
        <div className="brand">AH DM</div>
        <div className="spacer" />
        <Link to="/campaigns">Campaigns</Link>
        <div className="spacer" />
        <UserBadge />
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/campaigns" replace />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      </Routes>
    </Layout>
  );
}
