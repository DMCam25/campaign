# Campaign

Monorepo for the tabletop app:
- **api/** – Node/Express + SQLite
- **dm/** – DM frontend (Vite + React)
- **web/** – Player frontend (Vite + React)

## Dev

```bash
# API
cd api && npm ci && node index.js

# DM app
cd dm && npm ci && npm run dev

# Player app
cd web && npm ci && npm run dev
