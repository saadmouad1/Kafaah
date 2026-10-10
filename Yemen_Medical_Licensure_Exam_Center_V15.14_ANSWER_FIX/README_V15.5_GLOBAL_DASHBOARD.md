# V15.5 — Global Question Banks Dashboard

## What changed
- Global Question Banks now open the **Dashboard**, not the Question Bank.
- The Global Dashboard aggregates the **full IndexedDB global dataset**, not the 750-question RAM cache.
- Medical section counts and sub-specialty counts are derived from imported global data.
- Global banks commonly store `Subject = Internal Medicine` and `Topic = Cardiology/Pulmonology/etc.`; the dashboard uses the topic to populate the correct subspecialty when the subject is generic.
- Global dashboard shows total question banks, total questions, medical sections, and exams/models.
- Existing Professional Licensure Dashboard behavior remains intact.
- Future imported Global Question Banks automatically participate in the same dashboard aggregation.
- IndexedDB remains the source of truth; the dashboard does not load the full database into RAM.

## Important
The Global Dashboard aggregation is performed with an IndexedDB cursor and stores only counters in memory. It is therefore suitable for very large databases.
