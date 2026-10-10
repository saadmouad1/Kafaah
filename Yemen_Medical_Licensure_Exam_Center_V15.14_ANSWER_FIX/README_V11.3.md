# Yemen Medical Licensure Question Intelligence — V11.3

## New: Profession + Exam Library

The app now supports filtering the complete question bank by:
- Medical Profession: General Medicine & Surgery, Dentistry, Pharmacy, Medical Laboratories, Nursing, Diploma / Allied Health
- Specialty
- Exam Year
- Exact Exam Date
- Governorate

## Adding a new exam
Use the Settings → Import Exam JSON flow, or add the JSON file under `data/exams/` and register it in `data/database-manifest.json`.

Recommended JSON structure:
```json
{
  "examMetadata": {
    "medicalProfession": "Human Medicine",
    "specialty": "General Medicine & Surgery",
    "governorate": "Sana'a",
    "year": "2026",
    "month": "January",
    "exactDate": "2026-01-15",
    "exam": "Yemen Medical Licensure Examination"
  },
  "questions": [
    {
      "id": "2026-01-15-HumanMedicine-1",
      "questionNumber": 1,
      "originalQuestion": "...",
      "originalOptions": {"A":"...","B":"...","C":"...","D":"..."},
      "correctAnswer": "A",
      "explanation": "...",
      "whyA": "...",
      "whyNotB": "...",
      "whyNotC": "...",
      "whyNotD": "...",
      "subject": "Cardiology",
      "topic": "...",
      "title": "..."
    }
  ]
}
```

Exam-level metadata is automatically copied to questions when a question-level field is missing.
