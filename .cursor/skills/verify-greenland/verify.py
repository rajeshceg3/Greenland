#!/usr/bin/env python3
"""Purpose-fit verification for Greenland (Kalaallit travel app).

Runs the repo's own Jest suites and the Playwright user journeys in
real Chrome. Exit 0 and FAILURES=0 mean green.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
CHROME = os.environ.get('CHROME_BIN', '/usr/bin/google-chrome')

checks = []
failures = []


def record(name, ok, detail=''):
    checks.append({'name': name, 'ok': bool(ok), 'detail': detail})
    print(('PASS' if ok else 'FAIL') + ' ' + name + (' :: ' + detail if detail else ''))
    if not ok:
        failures.append(name)


def main():
    npm = shutil.which('npm')
    record('doctor: npm on PATH', npm is not None, npm or 'not found')
    record('doctor: chrome available', os.path.exists(CHROME), CHROME)
    if failures:
        return finish()

    if not os.path.isdir(os.path.join(REPO_ROOT, 'node_modules')):
        ci = subprocess.run([npm, 'ci', '--no-audit', '--no-fund'], cwd=REPO_ROOT,
                            capture_output=True, text=True, timeout=600)
        record('npm ci', ci.returncode == 0, ci.stderr.strip()[-200:])
        if ci.returncode != 0:
            return finish()

    jest = subprocess.run(['npx', 'jest'], cwd=REPO_ROOT, capture_output=True, text=True, timeout=600)
    m = re.search(r'Tests:\s+(\d+) passed, (\d+) total', jest.stdout + jest.stderr)
    record('jest suites green', jest.returncode == 0 and m and m.group(1) == m.group(2),
           ('%s/%s tests' % (m.group(1), m.group(2))) if m else (jest.stdout + jest.stderr).strip()[-200:])

    env = dict(os.environ)
    env['CHROME_PATH'] = CHROME
    pw = subprocess.run(['npx', 'playwright', 'test'], cwd=REPO_ROOT, env=env,
                        capture_output=True, text=True, timeout=900)
    m2 = re.search(r'(\d+) passed', pw.stdout)
    record('playwright journeys green', pw.returncode == 0 and m2,
           ('%s journeys passed' % m2.group(1)) if m2 else (pw.stdout + pw.stderr).strip()[-200:])
    return finish()


def finish():
    evidence_dir = tempfile.mkdtemp(prefix='verify-greenland-')
    with open(os.path.join(evidence_dir, 'evidence.json'), 'w') as f:
        json.dump({'repo': 'Greenland', 'checks': checks, 'failures': failures}, f, indent=2)
    print('EVIDENCE_DIR=' + evidence_dir)
    print('FAILURES=%d' % len(failures))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
