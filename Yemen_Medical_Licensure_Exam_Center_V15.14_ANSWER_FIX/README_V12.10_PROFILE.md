# V12.10 — Personal Profile & Global Exam Context

Added **Settings → My Profile (ملفي الشخصي)**.

## Profile fields
- Specialty (including General Medicine & Surgery when available)
- Profession / medical track
- Exam country: Yemen, Saudi Arabia, plus custom countries
- Governorate / region: Sana'a, Aden, Taiz, Amran, Ibb, Hajjah, plus custom regions
- Exam year
- Exact exam date

## Global behavior
The selected profile is persisted in localStorage and automatically scopes:
- Practice
- Mock Exam / Smart Adaptive Exam
- Question Bank
- Intelligence / Analytics
- Mistakes
- Saved Questions
- Question Frequency
- Dashboard statistics

Existing exam records without a country are treated as **Yemen** for backward compatibility. New JSON templates include a `country` field.
