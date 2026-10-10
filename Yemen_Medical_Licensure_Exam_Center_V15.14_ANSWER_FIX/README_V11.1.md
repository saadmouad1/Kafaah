# Yemen Medical Licensure Question Intelligence V11.1

## Clinical Section Hierarchy
The app now organizes the question bank into major clinical sections first, then nested subspecialties:

- باطنة — Internal Medicine
- جراحة — Surgery
- نسائية وتوليد — Obstetrics & Gynecology
- أطفال — Pediatrics
- طب مجتمع وصحة عامة — Community & Public Health
- نفسية — Psychiatry
- جلدية — Dermatology
- عيون — Ophthalmology
- أنف وأذن وحنجرة — ENT
- طوارئ وعناية مركزة — Emergency & Critical Care
- أمراض معدية — Infectious Diseases
- أدوية وعلم الأدوية — Pharmacology
- أخرى — Other Medical Sciences

Composite subjects are automatically classified into the most clinically appropriate major section, while preserving the original `subject` value in the database.

Practice and Mock Exam now support selecting a major section first, followed by its subspecialties.

## Compatibility
- Same V10.8/V11 lightweight JavaScript architecture.
- No external libraries.
- Android WebView/TrebEdit friendly.
- JSON database and local storage preserved.
