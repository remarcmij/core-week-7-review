import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTER_URL = pathToFileURL(resolve(__dirname, 'register.js')).href;

/**
 * Locate the project root containing src/index.js.
 * Some trainees nest their project in a subfolder.
 */
export function findProjectRoot(dir) {
  const absDir = resolve(dir);
  if (existsSync(join(absDir, 'src', 'index.js'))) {
    return absDir;
  }
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const candidate = join(absDir, entry.name);
      if (existsSync(join(candidate, 'src', 'index.js'))) {
        return candidate;
      }
    }
  }
  throw new Error(`Cannot find src/index.js in ${absDir} or its subdirectories`);
}

/**
 * Run the CLI with a batch of commands and capture output.
 *
 * @param {string} projectDir - Absolute path to project root (contains src/index.js)
 * @param {string[]} commands - Commands to send (QUIT is appended automatically)
 * @param {object} [options]
 * @param {number} [options.timeout=10000] - Timeout in ms
 * @returns {{ stdout: string, stderr: string, exitCode: number|null, lines: string[], timedOut?: boolean }}
 */
export function runCli(projectDir, commands, options = {}) {
  const { timeout = 10000 } = options;
  const stdinData = commands.join('\n') + '\n';

  try {
    const stdout = execFileSync('node', ['--import', REGISTER_URL, 'src/index.js'], {
      cwd: projectDir,
      input: stdinData,
      encoding: 'utf8',
      timeout,
      env: {
        ...process.env,
        NO_COLOR: '1',
        FORCE_COLOR: '0',
        NODE_NO_WARNINGS: '1',
      },
    });

    return {
      stdout,
      stderr: '',
      exitCode: 0,
      lines: parseOutputLines(stdout),
    };
  } catch (err) {
    if (err.killed) {
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || '',
        exitCode: null,
        timedOut: true,
        lines: parseOutputLines(err.stdout || ''),
      };
    }
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status,
      lines: parseOutputLines(err.stdout || ''),
    };
  }
}

/**
 * Parse stdout into clean lines, stripping prompt prefixes and blanks.
 */
function parseOutputLines(stdout) {
  return stdout
    .split('\n')
    .map((line) => line.replace(/^>\s*/, '').trim())
    .filter((line) => line.length > 0);
}
