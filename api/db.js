const Database = require("better-sqlite3");
const db = new Database(process.env.DB_FILE, { fileMustExist: false });

// schema (idempotent)
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
  role TEXT NOT NULL,                -- 'owner' | 'player' later
  PRIMARY KEY (campaign_id, email)
);
`);

function createCampaign({ id, name, owner }) {
  const insertC = db.prepare(
    "INSERT INTO campaigns(id,name,owner_email) VALUES(?,?,?)"
  );
  const insertM = db.prepare(
    "INSERT INTO campaign_members(campaign_id,email,role) VALUES(?,?,?)"
  );
  const tx = db.transaction(() => {
    insertC.run(id, name, owner);
    insertM.run(id, owner, "owner");
  });
  tx();
}

function listCampaigns(email) {
  return db.prepare(`
    SELECT c.id, c.name, c.owner_email AS owner,
           (cm.role) AS role
    FROM campaign_members cm
    JOIN campaigns c ON c.id = cm.campaign_id
    WHERE cm.email = ?
    ORDER BY c.name
  `).all(email);
}

module.exports = { db, createCampaign, listCampaigns };

