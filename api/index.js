require("dotenv").config();

const express = require("express");
const crypto = require("node:crypto");
const { verifyAccessJWT, requireDM } = require("./auth");
const { createCampaign, listCampaigns, deleteCampaign } = require("./db");

const app = express();
app.use(express.json());

// tiny request log
app.use((req, _res, next) => {
  console.log(
    new Date().toISOString(),
    req.method,
    req.url,
    req.headers.origin || ""
  );
  next();
});

/**
 * CORS (explicit, no wildcard)
 * - Allows credentials
 * - Handles preflight for all routes
 * - Includes DELETE (and PUT/PATCH for future)
 */
const allowedOrigins = new Set([
  "https://app.ah2023.com",
  "https://dm.ah2023.com",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const ALLOW_METHODS = "GET,POST,DELETE,PUT,PATCH,OPTIONS";
const ALLOW_HEADERS = "Content-Type, CF-Access-Jwt-Assertion, Authorization";

// Apply CORS headers (and short-circuit OPTIONS) before routes
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", ALLOW_METHODS);
    res.setHeader("Access-Control-Allow-Headers", ALLOW_HEADERS);
    // Cache successful preflight for 10 minutes
    res.setHeader("Access-Control-Max-Age", "600");
  }

  // Preflight: respond with 204 after setting headers
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

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

// DELETE /api/campaigns/:id  (DM-only, owner-only)
app.delete("/api/campaigns/:id", verifyAccessJWT, requireDM, (req, res) => {
  const id = req.params.id;
  const email = req.user.email;
  console.log(`[DELETE] /api/campaigns/${id} by ${email}`);

  try {
    const out = deleteCampaign({ id, email });
    console.log(`[DELETE] success`, out);
    return res.json(out);
  } catch (err) {
    console.warn(`[DELETE] failed id=${id} user=${email} code=${err.code || err.message}`);
    if (err.code === "not_owner") return res.status(403).json({ error: "forbidden_not_owner" });
    if (err.code === "not_found") return res.status(404).json({ error: "not_found" });
    console.error("delete error", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// boot
app.listen(8000, "127.0.0.1", () =>
  console.log("API listening on http://127.0.0.1:8000 from", __dirname)
);
