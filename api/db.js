const Database = require("better-sqlite3");

// 1) Log which DB file the API opened
const DB_PATH = process.env.DB_FILE;
const db = new Database(DB_PATH, { fileMustExist: false });
console.log(`[DB] opened ${DB_PATH}`);

// schema
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS campaigns(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS campaign_members(
  campaign_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (campaign_id, email)
);
`);

function createCampaign({ id, name, owner }) {
  const insertC = db.prepare("INSERT INTO campaigns(id,name,owner_email) VALUES(?,?,?)");
  const insertM = db.prepare("INSERT INTO campaign_members(campaign_id,email,role) VALUES(?,?,?)");
  db.transaction(() => {
    insertC.run(id, name, owner);
    insertM.run(id, owner, "owner");
  })();
}

function listCampaigns(email) {
  return db.prepare(`
    SELECT c.id, c.name, c.owner_email AS owner, cm.role AS role
    FROM campaign_members cm
    JOIN campaigns c ON c.id = cm.campaign_id
    WHERE cm.email = ?
    ORDER BY c.name
  `).all(email);
}

// 2) Robust delete (existence + owner + row counts)
function deleteCampaign({ id, email }) {
  const txn = db.transaction(() => {
    const exists = db.prepare(`SELECT id FROM campaigns WHERE id = ?`).get(id);
    if (!exists) { const e = new Error("not_found"); e.code = "not_found"; throw e; }

    const isOwner = db.prepare(`
      SELECT 1 FROM campaign_members
      WHERE campaign_id = ? AND email = ? AND role = 'owner'
    `).get(id, email);
    if (!isOwner) { const e = new Error("not_owner"); e.code = "not_owner"; throw e; }

    const memDel = db.prepare(`DELETE FROM campaign_members WHERE campaign_id = ?`).run(id);
    const campDel = db.prepare(`DELETE FROM campaigns WHERE id = ?`).run(id);

    if (campDel.changes === 0) { const e = new Error("not_found"); e.code = "not_found"; throw e; }

    return { ok: true, removed: { members: memDel.changes, campaigns: campDel.changes } };
  });
  return txn();
}

module.exports = { db, createCampaign, listCampaigns, deleteCampaign };
