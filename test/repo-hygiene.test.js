// Repository hygiene checks: the docs and CI shape a reader relies on, asserted
// from the files on disk so a regression fails the suite instead of the scorer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

test('CODEOWNERS assigns every file to @mrodgersjs-web', () => {
  const owners = read('.github/CODEOWNERS');
  assert.match(owners, /^\*\s+@mrodgersjs-web\s*$/m);
});

test('copilot instructions are bounded and name a test command', () => {
  const doc = read('.github/copilot-instructions.md');
  assert.ok(doc.length > 0, 'copilot-instructions.md must not be empty');
  assert.ok(doc.length <= 8000, `copilot-instructions.md is ${doc.length} bytes, limit 8000`);
  assert.match(doc, /npm test|pytest|smoke/, 'must name a test command');
});

test('README carries the CI badge, the site footer, and a self-clone', () => {
  const readme = read('README.md');
  assert.ok(
    readme.includes('github/actions/workflow/status'),
    'README must carry a GitHub Actions workflow status badge',
  );
  assert.ok(
    readme.includes('Built by Mike Rodgers') && readme.includes('rodgersintelligence.com'),
    'README must carry the rodgersintelligence.com footer',
  );
  assert.match(readme, /npm test|pytest|smoke|node --test/, 'README must name a test command');
  for (const line of readme.split('\n')) {
    if (line.includes('git clone')) {
      assert.ok(
        line.includes('mrodgersjs-web/proof-gate-action'),
        `clone example must clone this repo: ${line.trim()}`,
      );
    }
  }
});

test('every workflow job sets timeout-minutes and never continues on error', () => {
  const dir = join(ROOT, '.github', 'workflows');
  const files = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  assert.ok(files.length > 0, 'at least one workflow must exist');
  for (const file of files) {
    const text = readFileSync(join(dir, file), 'utf8');
    assert.ok(
      !/continue-on-error:\s*true/.test(text),
      `${file} must not use continue-on-error: true`,
    );
    const lines = text.split('\n');
    let inJobs = false;
    let currentJob = null;
    let jobHasTimeout = false;
    const jobs = [];
    for (const line of lines) {
      if (/^jobs:\s*$/.test(line)) { inJobs = true; continue; }
      if (!inJobs) continue;
      const jobMatch = /^  ([A-Za-z0-9_-]+):\s*$/.exec(line);
      if (jobMatch) {
        if (currentJob) jobs.push({ name: currentJob, hasTimeout: jobHasTimeout });
        currentJob = jobMatch[1];
        jobHasTimeout = false;
        continue;
      }
      if (/^[A-Za-z]/.test(line)) {
        if (currentJob) jobs.push({ name: currentJob, hasTimeout: jobHasTimeout });
        currentJob = null;
        inJobs = false;
        continue;
      }
      if (currentJob && /^\s+timeout-minutes:\s*\d+/.test(line)) jobHasTimeout = true;
    }
    if (currentJob) jobs.push({ name: currentJob, hasTimeout: jobHasTimeout });
    assert.ok(jobs.length > 0, `${file} must declare jobs`);
    for (const job of jobs) {
      assert.ok(job.hasTimeout, `${file} job "${job.name}" must set timeout-minutes`);
    }
  }
});
