# V15.6 — Practice Subject Filter

Practice filtering is now hierarchical and data-driven:

Major Section → Sub-specialty → Subject → Topic → Governorate → Exam Year → Exam Date

## Changes
- Added a dedicated **Subject** filter to Practice.
- Added a separate **Sub-specialty** filter using the question `specialty` field.
- Subject options are dynamically rebuilt from the currently selected Major Section and Sub-specialty.
- Topic options are dynamically rebuilt from Major Section + Sub-specialty + Subject.
- Starting Practice applies all selected filters together.
- Existing section-card shortcuts remain compatible: clicking a section subject still opens Practice with that Subject selected.
- Works with Professional Licensure, Global Question Banks, and future imported banks because values are read from the unified question database.
