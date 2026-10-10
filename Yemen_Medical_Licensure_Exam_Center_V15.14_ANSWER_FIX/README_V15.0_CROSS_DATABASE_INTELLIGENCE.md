# V15.0 — Cross-Database Similar Questions

Standalone Medical Intelligence tool under More → Medical Intelligence → Cross-Database Similar Questions.

## Purpose
Prioritizes Professional Licensure questions and compares them against Global Question Banks to find:
- exact repetitions
- very high similarity
- high similarity
- conceptual/same-pattern matches

## Matching signals
- Original question wording
- Original answer options A–E
- Subject
- Topic
- Title
- Tags

Answer-choice similarity is explicitly scored and displayed. Results include View Licensure, View Global, and Practice Both.

## Scalability
IndexedDB remains the source of truth. A multi-entry `intelligenceTokens` index is used to retrieve candidates without loading the full database into RAM.
