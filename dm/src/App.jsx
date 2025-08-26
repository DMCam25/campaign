import { Link, Route, Routes, Navigate } from 'react-router-dom';
import CampaignsPage from './features/campaigns/CampaignsPage';

function Layout({ children }) {
  return (
    <div className="shell">
      <nav className="topbar">
        <div className="brand">AH DM</div>
        <div className="spacer" />
        <Link to="/campaigns">Campaigns</Link>
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
      </Routes>
    </Layout>
  );
}
