# E2E Testing with @grafana/plugin-e2e

This directory contains end-to-end tests for the SPC CAD Grafana panel using `@grafana/plugin-e2e` and Playwright.

## Overview

The tests use `@grafana/plugin-e2e` which extends Playwright with Grafana-specific fixtures, models, and matchers. This allows us to test the panel across multiple Grafana versions reliably.

## What is @grafana/plugin-e2e?

`@grafana/plugin-e2e` is Grafana's official end-to-end testing framework for plugins. It:

- Extends Playwright with Grafana-specific fixtures and models
- Provides expect matchers tailored for Grafana plugins
- Handles UI differences between Grafana versions automatically
- Ensures your plugin works across multiple Grafana environments
- Supports testing from Grafana 8.5.0 onwards

## Prerequisites

- Node.js 24 (as specified in package.json)
- Yarn package manager
- Docker and Docker Compose (for running Grafana locally)

## Running Tests Locally

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build the Plugin

```bash
yarn build
```

### 3. Start Grafana (with default latest version)

```bash
yarn server
# or
docker compose up -d
```

### 4. Run E2E Tests

```bash
# Run all tests
yarn e2e

# Run tests in UI mode
yarn e2e:ui
# or
yarn dlx playwright test --ui

# Run tests in headed mode (see browser)
yarn dlx playwright test --headed

# Run specific test file
yarn dlx playwright test tests/e2e/panel.spec.ts

# Run tests with specific browser
yarn dlx playwright test --project=chromium
```

## Testing Against Specific Grafana Versions

You can test against specific Grafana versions using the `GRAFANA_VERSION` environment variable:

### Grafana 11
```bash
GRAFANA_VERSION=11.5.0 docker compose up -d
yarn e2e
```

### Grafana 12
```bash
GRAFANA_VERSION=12.1.0 docker compose up -d
yarn e2e
```

## Test Structure

Tests are organized in `tests/e2e/` directory:

- `panel.spec.ts` - Main panel functionality tests
  - Panel rendering
  - CAD model display
  - Feature annotations
  - Panel editing
  - Time series data display

## Key Test Fixtures

The `@grafana/plugin-e2e` provides useful fixtures:

- `gotoDashboardPage` - Navigate to a dashboard
- `dashboardPage` - Dashboard page model
- `readProvisionedDashboard` - Read provisioned dashboards
- `gotoExploreConfigPage` - Navigate to explore page
- `explorePage` - Explore page model
- `page` - Playwright page object

## Viewing Test Results

After running tests:

```bash
# Open HTML report
yarn dlx playwright show-report

# View specific test trace
yarn dlx playwright show-trace playwright-report/data/<test-id>.zip
```

## CI/CD

Tests run automatically when code changes:
- Pull requests to `main` and `develop` branches
- Push to `main` and `develop` branches

The CI workflow tests against:
1. Multiple Grafana versions using `grafana/plugin-actions/e2e-version`
2. Specific major versions: 11.5.0, 12.1.0

Tests are triggered by code changes, not on a schedule, since testing the same plugin code against the same Grafana versions repeatedly provides no value.

## Writing New Tests

Example test structure:

```typescript
import { test, expect } from '@grafana/plugin-e2e';

test.describe('Feature Name', () => {
  test('should do something', async ({
    gotoDashboardPage,
    dashboardPage,
    readProvisionedDashboard,
  }) => {
    const dashboard = await readProvisionedDashboard({
      fileName: 'your-dashboard.json'
    });
    await gotoDashboardPage(dashboard);

    const panel = await dashboardPage.getPanelByTitle('Panel Title');
    await expect(panel.locator).toBeVisible();
  });
});
```

## Debugging Tests

### Debug Mode
```bash
# Debug specific test
yarn dlx playwright test --debug

# Debug specific file
yarn dlx playwright test tests/e2e/panel.spec.ts --debug
```

### Headed Mode
```bash
# Run with browser visible
yarn dlx playwright test --headed

# Run with slow motion
yarn dlx playwright test --headed --slow-mo=500
```

### Screenshots and Videos

Tests automatically capture:
- Screenshots on failure
- Videos when tests fail
- Traces on first retry

These are stored in `playwright-report/` directory.

## Troubleshooting

### Tests fail to connect to Grafana
- Ensure Grafana is running: `docker compose ps`
- Check Grafana is accessible: `curl http://localhost:3000`
- Wait for Grafana to be ready before running tests

### Panel not rendering in tests
- Check if plugin is built: `ls dist/`
- Verify plugin is loaded in Grafana logs: `docker compose logs grafana`
- Ensure dashboards are provisioned correctly

### Authentication issues
- The auth project runs first and creates `playwright/.auth/admin.json`
- If auth fails, try: `rm -rf playwright/.auth && yarn e2e`

## Resources

- [Grafana Plugin E2E Documentation](https://grafana.com/developers/plugin-tools/e2e-test-a-plugin/)
- [Playwright Documentation](https://playwright.dev)
- [Plugin E2E GitHub](https://github.com/grafana/plugin-tools/tree/main/packages/plugin-e2e)
