# DeutschSprint A1 — Lektion 01 exercises

Route: `/deutschsprint/a1/lektion-01/uebungen` (not a public link until deployed).

The six stages mirror the printed book pages 06–08: five matching questions, four missing letters, five sound patterns, three name spellings, a personal-name exercise without a score, and the five-question Mini-Test. The answers and explanations are stored in `src/data/deutschsprintExercises.js`, separately from the React UI.

The objective exercises give immediate feedback and allow a correction or a group reset. Mini-Test answers are revealed only upon submitting all five questions; 4–5 points meet the book's progression threshold. A failed answer links to the relevant permanent audio practice route. The learner can repeat the test without changing their exercise answers.

Exercise and test answers are held in the browser tab's session storage, including when returning from an audio review page. The optional name and its spelling are kept in component memory only and never saved or sent to the database. No speech recognition or spoken-pronunciation assessment is claimed.

Run `npm run check:deutschsprint` to validate the published question order, expected answers, spelling normalization, unique IDs, review routes and scoring boundaries. `npm run build` checks that the route is compiled. After deployment, verify the six stages, feedback, incomplete-test submission guard, both pass/fail results, test retry, review-link return and personal-name privacy on desktop and mobile.
