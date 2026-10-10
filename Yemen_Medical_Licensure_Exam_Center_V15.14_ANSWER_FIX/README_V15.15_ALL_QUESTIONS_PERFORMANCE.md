# V15.15 — All Questions & Performance Fix

- Rebuilt `data/database-manifest.json` to explicitly include every JSON source under `data/exams/`, avoiding reliance on server directory listings (which commonly fail in Android WebView/offline hosts).
- Added support for combined databases shaped as `{ "exams": [{ "examMetadata": ..., "questions": [...] }] }`.
- Added stable source-qualified question IDs so records from separate exams/models do not overwrite each other in IndexedDB.
- Kept database-backed pagination so the Question Bank renders a small page at a time rather than putting the entire bank in the DOM.
- Debounced Question Bank search to reduce repeated IndexedDB scans while typing.
- Bumped IndexedDB schema version to rebuild/repair indexes on upgrade.

Open `index.html` through an HTTP-capable local server/WebView. For a fresh install, the app loads the manifest and imports every bundled exam file into IndexedDB.
