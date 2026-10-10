# V13.1 — Separate Professional Licensure and Global Question Bank Modes

- Home now routes Professional Licensure to the existing licensure database and all existing training/exam/analytics functions.
- Global Question Banks uses a separate `databaseType: "global"` dataset and supports bank/provider, country, specialty, and year filtering.
- Imported JSON files are tagged according to the active database mode when the JSON does not explicitly provide `databaseType`.
- The Database screen provides separate import prompts for Professional Licensure and Global Question Banks.
- Create Exam supports Professional Licensure, Global Exam (including Question Bank and Specialty), and Teacher/Doctor Exam.
- Global and licensure questions remain logically separated throughout Question Bank, Practice, Mock Exam, Dashboard, and Analytics.
