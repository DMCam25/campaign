
const { createRemoteJWKSet, jwtVerify } = require("jose");
const JWKS = createRemoteJWKSet(new URL(process.env.CF_ACCESS_CERTS));
const AUD  = process.env.CF_ACCESS_AUD_API;

async function verifyAccessJWT(req, res, next) {
  const jwt = req.header("Cf-Access-Jwt-Assertion") || req.header("CF-Access-Jwt-Assertion");
  if (!jwt) return res.status(401).json({ error: "missing_jwt" });
  try {
    const { payload } = await jwtVerify(jwt, JWKS, { audience: AUD });
    req.user = { email: (payload.email || payload.sub || "").toLowerCase() };
    next();
  } catch (e) { return res.status(401).json({ error: "invalid_jwt", detail: e.message }); }
}

function requireDM(req, res, next) {
  const list = (process.env.DM_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(req.user?.email) ? next() : res.status(403).json({ error: "forbidden_dm_only" });
}

module.exports = { verifyAccessJWT, requireDM };
