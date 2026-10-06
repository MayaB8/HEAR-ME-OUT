# Project Background
HEAR ME OUT was originally developed as a team project in 2023. I later forked the original repository to continue developing it independently, with a focus on improving the backend architecture, data persistence, API design, testing, and deployment.

# Link to the website:
https://hear-me-out-785e2.web.app/

# Import Firebase data into local Postgres

The existing database must contain `minimal_pairs`, `words`, and
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
