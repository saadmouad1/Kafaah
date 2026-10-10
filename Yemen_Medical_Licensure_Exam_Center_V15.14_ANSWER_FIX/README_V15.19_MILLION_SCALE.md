# V15.19 — Large question-bank performance and import

## Changes
- IndexedDB remains the full database of record; the in-memory cache is reduced from 10,000 to 1,500 questions to reduce memory pressure on mobile devices.
- IndexedDB writes use batches of 500 rows.
- JSON files above 5 MB use the existing streaming parser rather than FileReader + JSON.parse for the whole file.
- Streamed imports serialize batch writes to IndexedDB so hundreds/thousands of write transactions are not started concurrently.
- Import feedback reports progress by parsed question count; it does not claim an exact percentage because the parser does not expose a reliable total question count before scanning.
- Existing full-database search/analytics should use IndexedDB-backed functions, not the small RAM cache.

## Important limits / recommended data layout
- For a million-question database, use a modern browser with sufficient device storage and split the source into multiple JSON files (recommended 10,000–50,000 questions per file) instead of one enormous file.
- Use the supported `{ "examMetadata": {...}, "questions": [...] }` format for streaming imports.
- On Android, available storage, browser quota, and CPU determine practical capacity and speed. This build cannot promise that every phone can hold/process 1,000,000 full records.
- Current auto-detect/sync of bundled `data/exams/*.json` files still fetches each JSON as a complete file. For very large collections, import in batches from Database → Import Exam JSON or bundle chunked files.
- A progress toast reports parsed question counts. Exact percent/ETA for database-wide similarity analysis requires the analysis engine to expose per-record progress; it is not fabricated here.
