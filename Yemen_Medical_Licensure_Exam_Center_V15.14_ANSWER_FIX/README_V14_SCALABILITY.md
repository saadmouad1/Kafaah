# V14 Scalability Architecture

- Full question records are stored in IndexedDB, not localStorage.
- The in-memory question cache is bounded to 10,000 records so current banks containing more than 750 questions remain visible in dashboard and practice views; IndexedDB remains the source of truth.
- Large JSON files (>20 MB) use streaming import via `ReadableStream` + `TextDecoderStream`.
- Streaming import writes questions to IndexedDB in batches and never keeps the entire question array in memory.
- IndexedDB indexes are created for databaseType, questionBank, profession, qualification, specialty, country, city, governorate, year, subject, section, topic, title, examTitle and examProvider.
- User settings, attempts and preferences remain in localStorage.
- Repeated question IDs are preserved; only identical IDs are de-duplicated.

Important: the browser's IndexedDB quota is device/browser dependent. A million questions is an application-scale dataset and may require substantial local storage. For production multi-device sync, use a server database/API in addition to IndexedDB.

## V14.1 Transaction Fix
Fixed IndexedDB `TransactionInactiveError` caused by attempting to continue a single read/write transaction after `setTimeout`. Large imports are now committed as separate 250-row transactions, while cursor reads remain within one active read-only transaction.
