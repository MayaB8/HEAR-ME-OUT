# Project Background
HEAR ME OUT was originally developed as a team project in 2023. I later forked the original repository to continue developing it independently, with a focus on improving the backend architecture, data persistence, API design, testing, and deployment.

# Link to the website:
https://hear-me-out-785e2.web.app/

# Import Firebase data into local Postgres

The frontend is based on `yuval1414/HEAR-ME-OUT` branch `dev`, commit
`21363516b1094b24a0dfef49fc519dd807981b38`. The frontend loads exercise data from
the Express API backed by Postgres. Images and recordings still use Firebase
Storage URLs. Firebase.js and its SDK remain in the project for now.

## Run locally

```powershell
docker compose up -d --build
cd minimal-pairs-app
Copy-Item .env.example .env
npm ci
npm start
```

React runs at http://localhost:3000 and calls the backend at http://localhost:3001.
On first setup, copy `.env.example` only if `.env` does not already exist. Set
`REACT_APP_API_BASE_URL` in the frontend `.env` and restart React after changes.
Backend CORS allows `http://localhost:3000` by default; set `FRONTEND_ORIGIN` in
`backend/.env` for a native server, or in the root Compose environment for Docker.

## Run the Postgres backend

From the repository root, run `docker compose up -d --build`.
Check its database connection at http://localhost:3001/api/health.
Fresh Postgres volumes create the schema from `backend/sql/schema.sql`; existing
volumes and their imported data are preserved. Empty databases need the import below.
To initialize tables on an existing empty volume, run from the repository root:

```powershell
Get-Content -Raw backend/sql/schema.sql | docker compose exec -T postgres psql -X -v ON_ERROR_STOP=1 -U hear_me_out_user -d hear_me_out
```

For a backend running outside Docker, copy `backend/.env.example` to `backend/.env`,
then run `npm ci` and `npm start` from `backend`.

Firebase Hosting serves the static frontend only. Production also needs a deployed
backend, `REACT_APP_API_BASE_URL` set to its HTTPS URL at build time, and
`FRONTEND_ORIGIN` set to the frontend origin. This PR does not deploy the website.

The database must contain `minimal_pairs`, `words`, and
`minimal_pair_words`, all empty. Start Postgres with `docker compose up -d postgres`.
Run from the repository root (Node.js and Docker Compose are required):

```powershell
node scripts/import-firebase.cjs "C:/Maya/Programming/hear-me-out-785e2-default-rtdb-export.json" --dry-run
node scripts/import-firebase.cjs "C:/Maya/Programming/hear-me-out-785e2-default-rtdb-export.json"
```

The importer validates the export before writing, preserves Firebase pair IDs,
and stores two ordered word links per pair. Words with identical text, variant,
and media URLs share a row; different media variants remain separate. Sound codes
come from `word1_sound` / `word2_sound` and belong to each pair's word link.
Hebrew and media URLs are preserved as UTF-8. Media files remain in Firebase
Storage; this imports their URLs only.

All inserts run in one transaction. A subsequent import refuses nonempty tables
without replacing existing data. The original export is not copied into Git.
