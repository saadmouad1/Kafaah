# V15.3 — Cross-Database Results Fixed

Fixes the case where Cross-Database Intelligence reported `0 Licensure source questions analyzed` even though questions were visible elsewhere in the app.

Changes:
- IndexedDB schema upgraded to v8.
- Existing rows are repaired on upgrade: databaseType, questionSignature, analysisKey, patternKey, intelligenceTokens.
- databaseType detection is tolerant of legacy/global labels (Global, International, World, USMLE, PLAB, MRCP, NBME, Prometric).
- Cross-database source discovery no longer depends on the databaseType index; it scans the store safely and closes the transaction before async scoring.
- Added `Rebuild Intelligence Index` button.
- No full database is loaded into RAM.
