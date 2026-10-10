# V15.16 — Open a database directly in Practice or Mock Exam

- Every entry in Database > Loaded Exam Files now has **Practice** and **Mock Exam** actions.
- Practice opens the first question from the selected database's loaded questions.
- Mock Exam opens the mock screen and sets the question count to the number available (up to the app's 100-question limit); the mock starts when the user presses the existing Begin Mock button.
- The selected database scope is applied to practice and mock pools using source file / bank metadata / source-qualified question IDs.
- Includes responsive button layout for mobile.
- This patch does not create questions absent from the loaded JSON files. If a database is not loaded, the app prompts the user to sync or import it.
