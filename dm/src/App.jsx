import { useEffect, useState } from "react";

const API = "https://api.ah2023.com";
const j = (p, o = {}) =>
  fetch(API + p, { credentials: "include", ...o }).then((r) => r.json());

export default function App() {
  const [user, setUser] = useState(null);
  const [dmOk, setDmOk] = useState(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const who = await j("/api/whoami");
        setUser(who.user ?? null);
        const dm = await j("/api/dm/ping");
        setDmOk(dm.ok === true);
        const list = await j("/api/campaigns");
        setItems(Array.isArray(list) ? list : []);
      } catch {
        setErr("API error – are you logged into api.ah2023.com?");
      }
    })();
  }, []);

  async function createCampaign(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const created = await j("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (created?.id) setItems((x) => [...x, created]);
      setName("");
    } catch {
      setErr("Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "3rem auto", color: "#e6e6e6", fontFamily: "system-ui, sans-serif" }}>
      <h1>DM Console</h1>
      <p><b>User:</b> {user ?? "unknown"} {dmOk ? "✅ DM" : "❌ not DM"}</p>
      {err && <p style={{ color: "salmon" }}>{err}</p>}

      <form onSubmit={createCampaign} style={{ display: "flex", gap: ".5rem", margin: "1rem 0" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New campaign name"
          style={{ flex: 1, padding: ".6rem", borderRadius: 8, border: "1px solid #555", background: "#222", color: "#eee" }}
        />
        <button disabled={busy || !dmOk} style={{ padding: ".6rem 1rem", borderRadius: 8 }}>
          {busy ? "Creating…" : "Create"}
        </button>
      </form>

      <h2>Your campaigns</h2>
      <ul>
        {items.map(c => (
          <li key={c.id}>{c.name} <small style={{ opacity: .6 }}>({c.id.slice(0, 8)})</small></li>
        ))}
        {items.length === 0 && <li style={{ opacity: .7 }}>No campaigns yet.</li>}
      </ul>
    </div>
  );
}
