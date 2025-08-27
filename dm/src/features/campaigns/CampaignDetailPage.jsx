// dm/src/features/campaigns/CampaignDetailPage.jsx
import { Link, useParams } from 'react-router-dom';
import { useCampaigns } from './useCampaigns';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useCampaigns();

  const campaign = (data ?? []).find(c => c.id === id);

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Campaign</h1>
        <div className="breadcrumbs">
          <Link to="/campaigns" className="ghostBtn">← Back to campaigns</Link>
        </div>
      </header>

      <section className="card">
        {isLoading && <p>Loading…</p>}
        {isError && <p className="error">Error: {error.message}</p>}
        {!isLoading && !isError && !campaign && (
          <p className="subtle">Couldn’t find that campaign.</p>
        )}
        {!isLoading && !isError && campaign && (
          <div className="stack">
            <h2>{campaign.name}</h2>
            <div className="subtle">{campaign.role} · {campaign.owner}</div>
            <p className="subtle">Detail view stub — we’ll add tabs, notes, players, etc.</p>
          </div>
        )}
      </section>
    </div>
  );
}
