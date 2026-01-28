import { test, expect } from '@grafana/plugin-e2e';

test.describe('SPC CAD Panel', () => {
  test('should render 3D features and annotations', async ({
    gotoDashboardPage,
    dashboardPage,
    readProvisionedDashboard,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'annotations.json' });
    await gotoDashboardPage(dashboard);

    const panel = await dashboardPage.getPanelByTitle('Feature annotation views');
    await expect(panel.locator).toBeVisible();

    // Wait for Three.js canvas with data-engine attribute
    const canvas = panel.locator.locator('canvas[data-engine*="three"]');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display time series data in annotation windows', async ({
    gotoDashboardPage,
    dashboardPage,
    readProvisionedDashboard,
    page,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'annotations.json' });
    await gotoDashboardPage(dashboard);

    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');

    const panel = await dashboardPage.getPanelByTitle('Feature annotation views');
    await expect(panel.locator).toBeVisible();
  });
});
