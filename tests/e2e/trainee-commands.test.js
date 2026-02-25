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

describe('TRAINEE ADD', () => {
  test('creates a trainee and shows CREATED message', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE ADD John Doe', 'QUIT']);
    expect(stdout).toMatch(/CREATED:\s+\d+\s+John\s+Doe/);
  });

  test('shows error when missing last name', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE ADD John', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Must provide first and last name');
  });

  test('shows error when missing all parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE ADD', 'QUIT']);
    expect(stdout).toContain('ERROR');
  });
});

describe('TRAINEE GET', () => {
  test('retrieves a known trainee by ID', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GET 10001', 'QUIT']);
    expect(stdout).toContain('10001');
    expect(stdout).toContain('Alice');
    expect(stdout).toContain('Anderson');
  });

  test('shows courses for a trainee enrolled in a course', () => {
    // Trainee 10001 is enrolled in course 20002 (Python)
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GET 10001', 'QUIT']);
    expect(stdout).toContain('Python');
  });

  test('shows "None" for a trainee with no courses', () => {
    // Trainee 10002 is not enrolled in any course
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GET 10002', 'QUIT']);
    expect(stdout).toMatch(/None/i);
  });

  test('shows error for non-existent trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GET 99999', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Trainee with ID 99999 does not exist');
  });
});

describe('TRAINEE UPDATE', () => {
  test('updates a known trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'TRAINEE UPDATE 10001 Alicia Andersen',
      'QUIT',
    ]);
    expect(stdout).toMatch(/UPDATED:\s+10001\s+Alicia\s+Andersen/);
  });

  test('shows error for missing parameters', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE UPDATE 10001', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Must provide ID, first name and last name');
  });

  test('shows error for non-existent trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, [
      'TRAINEE UPDATE 99999 Foo Bar',
      'QUIT',
    ]);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Trainee with ID 99999 does not exist');
  });
});

describe('TRAINEE DELETE', () => {
  test('deletes a known trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE DELETE 10003', 'QUIT']);
    expect(stdout).toMatch(/DELETED:\s+10003\s+Charlie\s+Chen/);
  });

  test('shows error for non-existent trainee', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE DELETE 99999', 'QUIT']);
    expect(stdout).toContain('ERROR');
    expect(stdout).toContain('Trainee with ID 99999 does not exist');
  });
});

describe('TRAINEE GETALL', () => {
  test('lists all trainees sorted by last name', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GETALL', 'QUIT']);

    // Seed data last names: Anderson, Baker, Chen, Davis
    const andersonIdx = stdout.indexOf('Anderson');
    const bakerIdx = stdout.indexOf('Baker');
    const chenIdx = stdout.indexOf('Chen');
    const davisIdx = stdout.indexOf('Davis');

    expect(andersonIdx).toBeGreaterThan(-1);
    expect(bakerIdx).toBeGreaterThan(andersonIdx);
    expect(chenIdx).toBeGreaterThan(bakerIdx);
    expect(davisIdx).toBeGreaterThan(chenIdx);
  });

  test('shows the correct total count', () => {
    const { stdout } = runCli(PROJECT_DIR, ['TRAINEE GETALL', 'QUIT']);
    expect(stdout).toMatch(/Total:\s*4/);
  });
});
