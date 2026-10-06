# Firebase to Postgres migration

Date: 2026-10-06. This is a summary of the observed execution, not a saved console log.

Source: `hear-me-out-785e2-default-rtdb-export.json`.
Destination: local Compose `postgres` service, database `hear_me_out`.
Importer: `scripts/import-firebase.cjs`.

The export passed validation. All three destination tables were empty before
the import. The transaction completed with COMMIT.

| Table | Verified rows |
| --- | ---: |
| minimal_pairs | 218 |
| words | 384 |
| minimal_pair_words | 436 |

The check for pairs with a link count other than two returned zero results.
The ID sequences were advanced to 218 and 384 respectively.
Firebase pair IDs, word order, Hebrew text, and media URLs were preserved.
Media files remain in Firebase Storage. The application still needs a backend
connection to Postgres. The importer refuses nonempty tables on subsequent runs.
