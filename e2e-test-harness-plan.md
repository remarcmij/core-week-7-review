# Plan: E2E Test Harness for School Management CLI

## Context

Trainees build a CLI app using `prompt-sync` for input. We need automated tests that run the CLI as a subprocess, feed commands, and validate output. The problem: `prompt-sync` reads from `/dev/tty` directly (not `process.stdin`), so piping input doesn't work.

**Solution:** Use Node.js ESM loader hooks (`--import` flag) to intercept the `import promptSync from 'prompt-sync'` statement and replace it with a mock that reads from `process.stdin` synchronously. No trainee code modification needed.

## Alternatives to prompt-sync (for future consideration)

If the template switched away from `prompt-sync`, the entire loader hack would be unnecessary:

| Package | Reads from | Pipe-friendly | Async required | npm install |
|---------|-----------|--------------|----------------|-------------|
| `prompt-sync` | `/dev/tty` | No | No | Yes |
| `readline-sync` | `/dev/tty` | No | No | Yes |
| **`readline/promises`** | `process.stdin` | **Yes** | Yes (`await`) | **No (built-in)** |
| `readline` (callbacks) | `process.stdin` | **Yes** | No | **No (built-in)** |

**`readline/promises`** (built-in since Node 17) is the best alternative. It's zero-dependency, pipe-friendly, and teaches modern async/await. The REPL would look like:

```javascript
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
const rl = readline.createInterface({ input: stdin, output: stdout });

while (true) {
  const input = await rl.question('> ');
  if (input.toLowerCase() === 'quit') break;
  // process command...
}
rl.close();
```

With this, testing is trivial: `echo "TRAINEE ADD John Doe" | node src/index.js`.

## File structure

```
tests/
└── e2e/
    ├── vitest.config.js          # Extended timeouts for subprocess tests
    ├── helpers/
    │   ├── register.js           # --import entry: calls module.register()
    │   ├── loader.js             # ESM loader hooks: intercept 'prompt-sync'
    │   ├── cli-runner.js         # Spawn CLI, pipe commands, capture output
    │   └── seed.js               # Backup data, write fixtures, restore
    ├── fixtures/
    │   ├── trainees.json         # 4 trainees with known IDs (10001-10004)
    │   └── courses.json          # 3 courses with known IDs (20001-20003)
    ├── trainee-commands.test.js  # TRAINEE ADD/GET/UPDATE/DELETE/GETALL tests
    └── course-commands.test.js   # COURSE ADD/GET/UPDATE/DELETE/JOIN/LEAVE/GETALL tests
```

## How it works

```
vitest → runCli(projectDir, ['TRAINEE GET 10001', 'QUIT'])
           ↓
         execFileSync('node', ['--import', 'register.js', 'src/index.js'])
           with stdin piped, cwd = trainee project, NO_COLOR=1
           ↓
         register.js calls module.register('./loader.js')
           ↓
         trainee's index.js does: import promptSync from 'prompt-sync'
           ↓
         loader.js intercepts → returns mock that reads from stdin via fs.readSync(0, ...)
           ↓
         REPL reads commands from pipe, prints output to stdout
           ↓
         stdin exhausted → mock returns 'QUIT' → CLI exits gracefully
           ↓
         execFileSync returns captured stdout → test asserts on output
```

## Implementation details

### 1. `tests/e2e/helpers/register.js`
Two lines: imports `module.register` and registers `./loader.js`.

### 2. `tests/e2e/helpers/loader.js`
Exports `resolve` and `load` hooks:
- `resolve`: intercepts specifier `'prompt-sync'` → returns `{ url: 'mock:prompt-sync' }`
- `load`: for `'mock:prompt-sync'` → returns inline ESM source code of the mock

The mock default-exports a factory function matching prompt-sync's API:
- Factory returns a `prompt(message)` function
- `prompt` writes the message to stdout, reads one line from stdin fd 0 using `fs.readSync`
- On EOF, returns `'QUIT'` (not `null`) to avoid crashes in trainees who call `.trim()` on the result

### 3. `tests/e2e/helpers/cli-runner.js`
- `runCli(projectDir, commands, options)` — joins commands with `\n`, spawns CLI via `execFileSync` with `input`, returns `{ stdout, stderr, exitCode, lines }`
- `findProjectRoot(dir)` — locates `src/index.js` (some trainees nest their project in a subfolder)
- Uses `pathToFileURL` for the `--import` path (must be absolute since cwd is the trainee's dir)
- Sets `NO_COLOR=1`, `FORCE_COLOR=0`, `NODE_NO_WARNINGS=1`
- 10-second timeout per CLI invocation

### 4. `tests/e2e/helpers/seed.js`
- `seedData(projectDir)` — backs up `data/` to `data.bak/`, writes fixtures to both `courses.json` and `Courses.json` (template has filename mismatch), returns a `restore()` function
- Called in `beforeEach` / `afterEach`

### 5. Fixtures
**trainees.json**: Alice Anderson (10001), Bob Baker (10002), Charlie Chen (10003), Diana Davis (10004)
**courses.json**: JavaScript (20001, 2026-03-01), Python (20002, 2026-06-15, participant: 10001), React (20003, 2026-01-10)

Pre-enrolling trainee 10001 in course 20002 enables testing LEAVE and duplicate-join without needing prior JOIN.

### 6. Test files
Tests seed data in `beforeEach`, run CLI with batch commands, assert on output. Key test cases:

**Trainee commands:**
- ADD: verify `CREATED: <number> John Doe` format; error on missing params
- GET: verify known trainee by ID; error on non-existent ID
- UPDATE: verify `UPDATED:` output; error on missing params and bad ID
- DELETE: verify `DELETED:` output; error on bad ID
- GETALL: verify all 4 trainees listed, sorted by last name (Anderson < Baker < Chen < Davis)

**Course commands:**
- ADD: verify creation with valid date; error on invalid date format; error on missing params
- GET/UPDATE/DELETE: similar to trainee variants
- JOIN: verify join message; error on duplicate join (10001 already in 20002); error on bad IDs
- LEAVE: verify leave message (10001 leaving 20002); error when not enrolled
- GETALL: verify sorted by start date (React 01-10 < JavaScript 03-01 < Python 06-15)

Assertions are **lenient on formatting** — check for key content (IDs, names, CREATED/ERROR keywords) rather than exact strings. This accommodates minor formatting differences between trainees.

## Usage

```bash
# Test a specific trainee
PROJECT_DIR=./trainees/mustafa npx vitest run tests/e2e/

# With the vitest config for extended timeouts
PROJECT_DIR=./trainees/halyna npx vitest run --config tests/e2e/vitest.config.js tests/e2e/
```

## Verification

1. Create `register.js` + `loader.js`, test with a minimal script that does `import promptSync from 'prompt-sync'` to verify the mock loads
2. Build `cli-runner.js`, test against one trainee with a single command (`TRAINEE GETALL`)
3. Build `seed.js`, verify backup/restore cycle preserves original data
4. Write all test cases, run against multiple trainees to validate portability
