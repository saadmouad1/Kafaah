# V12.8 — Automatic Exam File Discovery

The app now supports this workflow:

1. Open `data/exams/`.
2. Put a new exam JSON file beside the existing exam files.
3. Open/reload the app, or use **Database → Auto-Detect Exam Files**.
4. The app attempts to read the `data/exams/` directory listing and automatically discovers every `.json` exam file there.
5. No manual edit of `database-manifest.json` is required when the local HTTP server exposes directory listings (as commonly provided by local editors/servers such as TrebEdit).

The app still keeps `database-manifest.json` as a fallback for servers that do not expose directory listings.

Important: repeated questions are preserved. Database de-duplication now uses question IDs, not question text.
