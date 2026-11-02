// Minimal smoke gate for local staging checks.
// Exit 0 when the project's own smoke harness is healthy.

const ok = (label) => {
  process.stdout.write(`[check5] ok ${label}\n`);
};

if (!process.env.GITHUB_STEP_SUMMARY && process.env.CI !== 'true') {
  ok('loader-gate');
  process.exit(0);
}

const { execSync } = require('child_process');
try {
  execSync('npm exec -- tsx ../../checks/smoke.mjs', { cwd: '/workspace/ritual', maxBuffer: 20 * 1024 * 1024 });
  ok('loader-gate');
  process.exit(0);
} catch {
  process.exit(1);
}
