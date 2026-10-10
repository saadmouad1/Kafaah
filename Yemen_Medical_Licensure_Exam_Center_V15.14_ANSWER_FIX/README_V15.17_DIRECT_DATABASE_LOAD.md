# V15.17 — Direct database loading fix

Fixes the V15.16 issue where the selected file had not yet been loaded into IndexedDB/in-memory cache and therefore produced “No questions from this database are loaded yet.”

- Clicking Practice or Mock Exam now loads and normalizes the selected JSON file directly using the app's existing loader.
- Practice starts with that file's question pool.
- Mock Exam keeps that file's question pool as its private context and uses it when starting the mock.
- Displays a loading toast and clear error messages for missing/unreadable/empty files.
- Existing generic Practice and Mock flows remain unchanged when no database-specific context is active.
