# Week 7 - School Management CLI

Mentor repository for reviewing Week 7 homework submissions from the HackYourFuture Core Program. Trainees each build a **School Management CLI** — a Node.js command-line application that manages trainees and courses through a REPL interface.

## Repository Structure

```
week-7/
├── ASSIGNMENT.md      # Assignment brief given to trainees
├── COMMAND_SPEC.md    # Full command specification (syntax, output, errors)
├── CLAUDE.md          # Review criteria and instructions for Claude Code
├── trainees/          # Trainee submissions (gitignored)
│   ├── alice/
│   ├── bob/
│   └── ...
└── README.md
```

## Reviewing a Submission

### 1. Clone the trainee's repo

```sh
cd trainees
git clone <trainee-repo-url> <name>
```

The `trainees/` directory is gitignored so submissions won't be committed to this repo.

### 2. Start Claude Code and prompt a review

Open a terminal in this repo's root directory and run:

```sh
claude
```

Then prompt:

```
review alice's code
```

Claude will find their folder under `trainees/`, use the review criteria in `CLAUDE.md`, and write a `REVIEW.md` in the trainee's folder.

### 3. Read and verify the review

**You are responsible for the final review, not Claude.** Read the generated `REVIEW.md`, verify that the feedback is accurate and fair, and edit as needed before sending it to the trainee.
