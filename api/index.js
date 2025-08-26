require("dotenv").config();

const express = require("express");
const crypto = require("node:crypto");
const { verifyAccessJWT, requireDM } = require("./auth");
const { createCampaign, listCampaigns } = require("./db");

const app = express();
app.use(express.json());

// tiny request log
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url, req.headers.origin || "");
  next();
});

// CORS (explicit, no wildcard routes)
const allowedOrigins = new Set([
  "https://app.ah2023.com",
  "https://dm.ah2023.com",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, CF-Access-Jwt-Assertion");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204); // short-circuit preflight
  next();
});

// health & root
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);
app.get("/", (_req, res) =>
  res.send("Campaign API is alive. Try /api/health or /api/whoami")
);

// identity (requires Cloudflare Access)
app.get("/api/whoami", verifyAccessJWT, (req, res) =>
  res.json({ user: req.user.email })
);

// DM-only probe
app.get("/api/dm/ping", verifyAccessJWT, requireDM, (_req, res) =>
  res.json({ ok: true, role: "dm" })
);

// campaigns
app.get("/api/campaigns", verifyAccessJWT, (req, res) => {
  try {
    const rows = listCampaigns(req.user.email);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/campaigns:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/campaigns", verifyAccessJWT, requireDM, (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name_required" });
    const id = crypto.randomUUID();
    createCampaign({ id, name, owner: req.user.email });
    res.status(201).json({ id, name });
  } catch (e) {
    console.error("POST /api/campaigns:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// boot
app.listen(8000, "127.0.0.1", () =>
  console.log("API listening on http://127.0.0.1:8000 from", __dirname)
);
