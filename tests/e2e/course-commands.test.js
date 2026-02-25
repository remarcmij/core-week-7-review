import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { runCli, findProjectRoot } from './helpers/cli-runner.js';
import { seedData } from './helpers/seed.js';

const PROJECT_DIR = findProjectRoot(process.env.PROJECT_DIR);

let restore;

beforeEach(() => {
  restore = seedData(PROJECT_DIR);
});

afterEach(() => {
  restore();
});

describe('COURSE ADD', () => {
  test('creates a course with a valid date', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE ADD TypeScript 2026-09-01',
      'QUIT',
    ]);
    expect(stdout).toMatch(/CREATED:\s+\d+\s+TypeScript\s+2026-09-01/);
  });

  test('shows error when missing parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE ADD JavaScript', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Must provide course name and start date');
  });

  test('rejects invalid date format', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE ADD TypeScript 01-09-2026',
      'QUIT',
    ]);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Invalid start date');
  });
});

describe('COURSE GET', () => {
  test('retrieves a known course', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE GET 20001', 'QUIT']);
    expect(stdout).toContain('20001');
    expect(stdout).toContain('JavaScript');
    expect(stdout).toContain('2026-03-01');
  });

  test('shows participants for a course with enrolled trainees', () => {
    // Course 20002 has trainee 10001 (Alice Anderson)
    const { stdout } = runCli(PROJECT_DIR, ['COURSE GET 20002', 'QUIT']);
    expect(stdout).toContain('Alice');
    expect(stdout).toContain('Anderson');
  });

  test('shows error for non-existent course', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE GET 99999', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Course with ID 99999 does not exist');
  });
});

describe('COURSE UPDATE', () => {
  test('updates a known course', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE UPDATE 20001 AdvancedJS 2026-04-01',
      'QUIT',
    ]);
    expect(stdout).toMatch(/UPDATED:\s+20001\s+AdvancedJS\s+2026-04-01/);
  });

  test('shows error for missing parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE UPDATE 20001', 'QUIT']);
    expect(stdout).toContain('ERROR');
  });

  test('shows error for non-existent course', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE UPDATE 99999 Foo 2026-01-01',
      'QUIT',
    ]);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Course with ID 99999 does not exist');
  });
});

describe('COURSE DELETE', () => {
  test('deletes a known course', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE DELETE 20003', 'QUIT']);
    expect(stdout).toContain('DELETED');
    expect(stdout).toContain('20003');
    expect(stdout).toContain('React');
  });

  test('shows error for non-existent course', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE DELETE 99999', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Course with ID 99999 does not exist');
  });
});

describe('COURSE JOIN', () => {
  test('adds a trainee to a course', () => {
    // Trainee 10002 (Bob Baker) joins course 20001 (JavaScript)
    const { stdout } = runCli(PROJECT_DIR, ['COURSE JOIN 20001 10002', 'QUIT']);
    expect(stdout).toContain('Bob');
    expect(stdout).toMatch(/[Jj]oined/);
    expect(stdout).toContain('JavaScript');
  });

  test('prevents duplicate join', () => {
    // Trainee 10001 is already in course 20002
    const { stdout } = runCli(PROJECT_DIR, ['COURSE JOIN 20002 10001', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toMatch(/already joined/i);
  });

  test('shows error for missing parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE JOIN 20001', 'QUIT']);
    expect(stdout).toContain('ERROR');
  });

  test('shows error for non-existent course', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE JOIN 99999 10001', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Course with ID 99999 does not exist');
  });

  test('shows error for non-existent trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE JOIN 20001 99999', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Trainee with ID 99999 does not exist');
  });
});

describe('COURSE LEAVE', () => {
  test('removes a trainee from a course', () => {
    // Trainee 10001 (Alice Anderson) is in course 20002 (Python)
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE LEAVE 20002 10001',
      'QUIT',
    ]);
    expect(stdout).toContain('Alice');
    expect(stdout).toMatch(/[Ll]eft/);
    expect(stdout).toContain('Python');
  });

  test('shows error when trainee not in course', () => {
    // Trainee 10002 is NOT in course 20001
    const { stdout } = runCli(PROJECT_DIR, [
      'COURSE LEAVE 20001 10002',
      'QUIT',
    ]);
    expect(stdout).toContain('ERROR');
    expect(stdout).toMatch(/did not join/i);
  });

  test('shows error for missing parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE LEAVE 20002', 'QUIT']);
    expect(stdout).toContain('ERROR');
  });
});

describe('COURSE GETALL', () => {
  test('lists all courses sorted by start date', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE GETALL', 'QUIT']);

    // Seed dates: React 2026-01-10, JavaScript 2026-03-01, Python 2026-06-15
    const reactIdx = stdout.indexOf('React');
    const jsIdx = stdout.indexOf('JavaScript');
    const pythonIdx = stdout.indexOf('Python');

    expect(reactIdx).toBeGreaterThan(-1);
    expect(jsIdx).toBeGreaterThan(reactIdx);
    expect(pythonIdx).toBeGreaterThan(jsIdx);
  });

  test('shows the correct total count', () => {
    const { stdout } = runCli(PROJECT_DIR, ['COURSE GETALL', 'QUIT']);
    expect(stdout).toMatch(/Total:\s*3/);
  });
});
