# V14.9 — Cross-Database Similar Question Intelligence

Question Frequency now has a dedicated priority layer for questions that are not text-identical but repeat across Professional Licensure and Global Question Banks.

It detects cross-database pairs using:
- same/related subject or topic bucket
- meaningful clinical question tokens
- token overlap / Jaccard-style similarity
- explicit Licensure ↔ Global pairing

Example targeted by this release:
- "Earliest appearance of clubbing is seen in:"
- "Clubbing occurs earliest with:"

These are not classified as exact duplicates. They appear under **Cross-Database Similar Questions** and show both source questions, locations, similarity score, View buttons, and Practice Both.

Exact repetition remains Level 1. Cross-database similar wording/concept is a separate higher-value Level 2 intelligence layer.
