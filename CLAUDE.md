# Week 7 - School Management CLI

## Overview

This repo contains homework submissions for Week 7 of the HackYourFuture Core Program. Each trainee has their own folder under `trainees/` (e.g. `trainees/halyna/`, `trainees/muna/`) containing their implementation of a **School Management CLI application** built with Node.js. The `trainees/` folder is gitignored so the repo can be reused across cohorts.

## Assignment Summary

Trainees build a command-line application that manages **trainees** and **courses**. The app runs in a REPL loop, accepting text commands and printing results. See `COMMAND_SPEC.md` for the full specification.

### Supported Commands

**Trainee commands:** `TRAINEE ADD`, `UPDATE`, `DELETE`, `GET`, `GETALL`
**Course commands:** `COURSE ADD`, `UPDATE`, `DELETE`, `GET`, `GETALL`, `JOIN`, `LEAVE`
**Bonus:** `TRAINEE SEARCH`, `EXPORT HTML`

### Key Business Rules

- IDs are random numbers between 0 and 99999
- Courses have a max of 20 participants
- Trainees can join at most 5 courses
- `TRAINEE GETALL` sorts by last name
- `COURSE GETALL` sorts by start date and shows a `FULL` label when at capacity
- Dates use ISO 8601 format (`yyyy-MM-dd`)

## Tech Stack (shared template)

- Node.js with ESM (`"type": "module"`)
- `prompt-sync` for CLI input
- `chalk` for colored output
- `vitest` for testing
- `prettier` for formatting

## Starter Template

The starter template is at https://github.com/HackYourFuture/school-manager-template. When reviewing, fetch the template from that repo to compare against the trainee's code. Key details:

- **All function bodies are empty stubs** with `// TODO` comments — students implement all logic from scratch.
- **No runtime dependencies included** — only `prettier` and `vitest` as devDependencies. Students must add `prompt-sync` and `chalk` to `package.json` themselves.
- **`src/index.js`** only imports `parseCommand` and prints "Hello world" — no REPL loop, no prompt-sync, no chalk.
- **`src/command-parser.js`** exports `parseCommand(userInput)` as an empty stub.
- **`src/traineeCommands.js`** has stubs: `addTrainee`, `updateTrainee`, `deleteTrainee`, `fetchTrainee`, `fetchAllTrainees`, and exports `handleTraineeCommand(subcommand, args)`.
- **`src/courseCommands.js`** has stubs: `addCourse`, `updateCourse`, `deleteCourse`, `joinCourse`, `leaveCourse`, `getCourse`, `getAllCourses`, and exports `handleCourseCommand(subcommand, args)`.
- **`src/storage.js`** defines file paths `'./data/trainees.json'` and `'./data/courses.json'` (lowercase) and exports stubs: `loadTraineeData`, `saveTraineeData`, `loadCourseData`, `saveCourseData`.
- **`data/Courses.json`** has a capital "C" filename (mismatch with the lowercase path in `storage.js`) and contains a typo: `"startDate": "20226-02-01"`. Both of these are template issues — do NOT blame trainees for inheriting them.
- **`data/trainees.json`** has 2 sample trainees (John Doe, Jane Smith).
- **`tests/example.test.js`** has a single placeholder test (`1 + 2 = 3`).

When reviewing, compare the trainee's code against these stubs to understand what they added vs. what was provided. Any functions, helpers, or architectural patterns not in the template are the trainee's own work (or potentially AI-generated).

## Project Structure (per trainee)

```
<project-root>/
├── src/
│   ├── index.js            # Entry point, REPL loop
│   ├── command-parser.js   # Parses raw input into command parts
│   ├── traineeCommands.js  # Trainee CRUD logic
│   ├── courseCommands.js    # Course CRUD + join/leave logic
│   └── storage.js          # Data persistence (JSON files)
├── tests/                  # Vitest test files
├── data/                   # JSON data files (trainees.json, Courses.json)
├── package.json
├── .prettierrc
└── .gitignore
```

## Code Review Guidelines

When reviewing a trainee's submission, evaluate against these criteria:

### Correctness
- Does each command produce the exact output specified in `COMMAND_SPEC.md`?
- Are all error messages matching the spec exactly (wording, casing, punctuation)?
- Are business rules enforced (max 20 participants, max 5 courses per trainee, duplicate join prevention)?
- Does `TRAINEE GETALL` sort by last name? Does `COURSE GETALL` sort by start date?
- Are IDs generated as random numbers between 0 and 99999?

### Code Quality
- Are functions small and focused (single responsibility)?
- Is the code split sensibly across files?
- Are variable and function names clear and descriptive?
- Is there unnecessary code duplication that should be extracted?
- Is `prettier` formatting applied consistently?

### Error Handling
- Are missing parameters caught and reported with the correct error message?
- Are invalid IDs (nonexistent trainee/course) handled?
- Is date validation implemented for course dates?

### Data Persistence
- Is data stored and loaded correctly from JSON files?
- Does the app survive restart (data persists between sessions)?

### Git Practices
- Were branches and pull requests used (at least 3 PRs required)?
- Are commit messages meaningful?
- Was code pushed to `main` only via PR merges?

### Testing
- Are pure functions tested (parsing, validation, join/leave rules)?
- Do tests cover both success and error cases?

### Tone & Audience
- The REVIEW.md will be sent directly to the trainee. Write in second person ("you", "your code") and address them by name.
- Be encouraging — acknowledge what they did well before diving into issues.
- Be specific and actionable: explain *what* to fix, *why* it matters, and *how* to approach it.
- Avoid being patronizing. Treat them as a developer receiving a professional code review.

### Important
- The assignment explicitly forbids AI-generated code. Flag any code that appears suspiciously sophisticated, overly templated, or inconsistent with the trainee's apparent skill level.
- Focus feedback on helping trainees learn. Be specific about what to improve and why.
- Ignore `claude-code-pr-review-setup.md` and `e2e-test-harness-plan.md` if present — these are internal setup documents, not part of any trainee submission.

## Running E2E Tests

When asked to "run the e2e tests for <name>" or "test <name>'s code", do the following:

1. Install the trainee's dependencies: `cd trainees/<name>` (or their nested project subfolder), run `npm install`, then `cd` back to the repo root.
2. Run: `PROJECT_DIR=./trainees/<name> npm run test:e2e`
3. Report the results — how many passed, how many failed, and which commands failed.

The tests use ESM loader hooks to mock `prompt-sync` and `chalk`, so the trainee's code runs unmodified. Seed data with known IDs is injected before each test and restored after.
