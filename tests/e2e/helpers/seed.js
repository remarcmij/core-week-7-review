import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

/**
 * Seed fixture data into a trainee's data/ directory.
 * Backs up existing files first. Returns a restore function.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @returns {() => void} restore - Call to restore original data files
 */
export function seedData(projectDir) {
  const dataDir = join(projectDir, 'data');
  const backupDir = join(projectDir, 'data.bak');

  // Backup existing data directory
  if (existsSync(dataDir)) {
    rmSync(backupDir, { recursive: true, force: true });
    cpSync(dataDir, backupDir, { recursive: true });
  }

  mkdirSync(dataDir, { recursive: true });

  // Write seed trainees
  const seedTrainees = readFileSync(join(FIXTURES_DIR, 'trainees.json'), 'utf8');
  writeFileSync(join(dataDir, 'trainees.json'), seedTrainees, 'utf8');

  // Write seed courses to both filename variants (template uses capital C)
  const seedCourses = readFileSync(join(FIXTURES_DIR, 'courses.json'), 'utf8');
  writeFileSync(join(dataDir, 'courses.json'), seedCourses, 'utf8');
  writeFileSync(join(dataDir, 'Courses.json'), seedCourses, 'utf8');

  return function restore() {
    rmSync(dataDir, { recursive: true, force: true });
    if (existsSync(backupDir)) {
      cpSync(backupDir, dataDir, { recursive: true });
      rmSync(backupDir, { recursive: true, force: true });
    }
  };
}
