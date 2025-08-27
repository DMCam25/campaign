import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from './useCampaigns';

export default function CampaignsPage() {
  const { data, isLoading, isError, error } = useCampaigns();
  const create = useCreateCampaign();
  const del = useDeleteCampaign();

  const [name, setName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  function handleDelete(c) {
    const ok = window.confirm(`Delete "${c.name}"? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(c.id);
    del.mutate(c.id, {
      onSettled: () => setDeletingId(null),
    });
  }

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
          <button
            type="submit"
            disabled={create.isPending || !name.trim()}
            title="Create new campaign"
          >
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
            {(data ?? []).map((c) => (
              <li key={c.id} className="listItem">
                <div>
                  <strong>{c.name}</strong>
                  <div className="subtle">
                    {c.role} · {c.owner}
                  </div>
                </div>
                <div className="actions">
                  <a
                    className="ghostBtn"
                    href={`#/campaigns/${c.id}`}
                    title="Open campaign"
                  >
                    Open
                  </a>
                  <button
                    className="dangerBtn"
                    onClick={() => handleDelete(c)}
                    disabled={del.isPending && deletingId === c.id}
                    title="Delete campaign"
                  >
                    {del.isPending && deletingId === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
            {(!data || data.length === 0) && (
              <li className="subtle">No campaigns yet.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
