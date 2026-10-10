# V14.2 — IndexedDB as the Source of Truth

## What changed
- IndexedDB is now the authoritative question database.
- The in-memory `db` array is only a small cache and is no longer used by Question Bank browsing.
- Question Bank uses IndexedDB cursor queries with pagination (50 questions/page).
- The UI displays the true matched total, e.g. 2,347 instead of the 250 write-batch size.
- Search and database-mode filters query IndexedDB rather than the RAM cache.
- Opening a question fetches it by ID from IndexedDB.
- Database export reads the selected database from IndexedDB rather than exporting only the RAM cache.
- IndexedDB schema upgraded to v3 with additional indexes.

## Why 250 no longer limits display
`250` is only the safe write transaction batch size. It is NOT a question limit.

## Large-bank behavior
For 2,000 questions the app can browse all records through pages without loading all records into memory. For very large banks, the same mechanism remains bounded in RAM.

## Existing data
Existing IndexedDB records are preserved during the v3 schema upgrade. If an older broken database is present, use Settings → Reset Database once and re-import the source JSON.
