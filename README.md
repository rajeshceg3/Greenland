# Greenland

## Overview
Kalaallit is a serene, map-first travel application for Greenland.

## Testing Strategy

This repository employs a comprehensive testing strategy involving:

1.  **Unit Tests (Jest):** Verify state management and data integrity.
2.  **Integration Tests (Jest + JSDOM):** Verify interaction between logic modules and UI.
3.  **End-to-End Tests (Playwright):** Verify full user journeys in a real browser environment.
4.  **Static Analysis:** ESLint (to be configured).

### Running Tests

**Unit & Integration Tests:**
```bash
npm test
```

**End-to-End Tests:**
```bash
# Install browsers first (one time)
npx playwright install

# Run E2E tests
npx playwright test
```

### Coverage
We enforce >80% code coverage on core logic.
To see coverage report, run `npm test`.

### CI/CD
GitHub Actions workflow is configured in `.github/workflows/ci.yml` to run all tests on Push and PR.
