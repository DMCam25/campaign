import { useState } from 'react';
import { useCampaigns, useCreateCampaign } from './useCampaigns';

export default function CampaignsPage() {
  const { data, isLoading, isError, error } = useCampaigns();
  const create = useCreateCampaign();
  const [name, setName] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await create.mutateAsync({ name: name.trim() });
      setName('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Campaigns</h1>
      </header>

      <section className="card">
        <h2>Create a new campaign</h2>
        <form onSubmit={onSubmit} className="row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blackthorne"
            aria-label="Campaign name"
          />
          <button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {create.isError && <p className="error">Error: {create.error.message}</p>}
      </section>

      <section className="card">
        <h2>Your campaigns</h2>
        {isLoading && <p>Loading…</p>}
        {isError && <p className="error">Error: {error.message}</p>}
        {!isLoading && !isError && (
          <ul className="list">
            {(data ?? []).map(c => (
              <li key={c.id} className="listItem">
                <div>
                  <strong>{c.name}</strong>
                  <div className="subtle">{c.role} · {c.owner}</div>
                </div>
                <a className="ghostBtn" href={`#/campaigns/${c.id}`}>Open</a>
              </li>
            ))}
            {(!data || data.length === 0) && <li className="subtle">No campaigns yet.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
