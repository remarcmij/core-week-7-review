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
