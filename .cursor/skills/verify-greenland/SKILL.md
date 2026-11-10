---
name: verify-greenland
description: Verifies Greenland (Kalaallit travel app) - the repo's own Jest suites and Playwright user journeys in real Chrome - with machine-readable evidence.
---

# Verify Greenland

## Launch

```bash
python3 .cursor/skills/verify-greenland/verify.py
```

Exit 0 and `FAILURES=0` mean green. The Playwright config serves the
app itself (`npx http-server` on 4197) and uses the system Chrome via
`CHROME_PATH`, which the runner sets from `CHROME_BIN`.

## Doctor

Gates on `npm` and a Chrome/Chromium binary. Runs `npm ci` when
node_modules is absent.

## Drive

1. `npx jest` - the unit and integration suites.
2. `npx playwright test` - the four user journeys (landing/navigation,
   marker panel, explore modal, insight mode) in real Chrome.

## Evidence

Each run writes a fresh `EVIDENCE_DIR` with `evidence.json`.
`FAILURES=n` is the last line; the exit code mirrors it.

## Maintenance

The suites are the app's own; when specs are added this wrapper picks
them up automatically.
