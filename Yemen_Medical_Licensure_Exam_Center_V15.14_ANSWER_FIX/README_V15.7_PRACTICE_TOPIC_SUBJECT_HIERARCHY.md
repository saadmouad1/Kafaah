# V15.7 — Practice Topic → Subject Hierarchy

Practice filters now follow the requested medical hierarchy:

**Major Section → Sub-specialty → Topic → Subject → Question**

For the existing database schema:
- UI **Topic** maps to the stored `subject` field (broad topic/category such as Cardiology).
- UI **Subject** maps to the stored `topic` field (specific subject such as Heart Failure).

Behavior:
- Selecting a Major Section limits the available Sub-specialties and Topics.
- Selecting a Sub-specialty limits Topics.
- Selecting a Topic dynamically limits Subjects to subjects/questions under that Topic.
- Starting Practice applies the same mapping to the actual question pool.
- Existing dashboard navigation that opens Practice for a broad category now selects the Topic field correctly.
- The change is UI/filter semantics only; stored question records are not rewritten.
