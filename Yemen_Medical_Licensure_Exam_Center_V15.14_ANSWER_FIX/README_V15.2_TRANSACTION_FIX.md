# V15.2 — Cross-Database Transaction Fix

Fixes IndexedDB `TransactionInactiveError` in automatic Cross-Database Similar Questions.

The previous implementation opened a cursor and awaited asynchronous candidate scoring before calling `cursor.continue()`. IndexedDB transactions are only active during their event callbacks, so the transaction could finish before `continue()`.

V15.2 now:
- Loads a bounded Licensure/Global source set in one short IndexedDB transaction.
- Closes that transaction before asynchronous similarity scoring.
- Processes sources sequentially outside the cursor transaction.
- Supports both Licensure → Global and Global → Licensure.
- Keeps IndexedDB as the source of truth and does not load the full database into RAM.
