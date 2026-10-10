# Yemen Medical Licensure Question Intelligence V11.7

## Expanded Medical Section Library

The application now includes a comprehensive English medical curriculum hierarchy.

### Major Sections
- Internal Medicine
- Surgery
- Obstetrics & Gynecology
- Pediatrics
- Community & Public Health
- Psychiatry & Behavioral Medicine
- Dermatology
- Ophthalmology
- ENT / Otorhinolaryngology
- Emergency & Critical Care
- Infectious Diseases
- Pharmacology & Therapeutics
- Pathology
- Microbiology
- Radiology & Imaging
- Anatomy & Basic Sciences
- Forensic Medicine & Ethics
- Rehabilitation & Pain Medicine
- Nutrition
- Other Medical Sciences

Each major section contains predefined sub-specialties. Existing question counts are shown for each sub-specialty; zero-count entries remain visible as placeholders and can be populated automatically when matching JSON exams are imported.

### Navigation / behavior
- Major Section -> Sub-specialty -> Practice
- Existing database questions are matched to sections automatically using subject aliases.
- Empty sub-specialties remain visible and show `0 questions`.
- Tapping an empty area gives a clear message instead of opening a blank practice screen.
- Imported JSON metadata continues to populate profession, specialty, year, date and governorate filters.

## Performance
No external libraries were added. The existing lightweight Android WebView-compatible architecture is preserved.
