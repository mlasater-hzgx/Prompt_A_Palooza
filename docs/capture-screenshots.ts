import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots');

interface ScreenshotConfig {
  name: string;
  path: string;
  wait?: number;
  action?: (page: any) => Promise<void>;
}

const screenshots: ScreenshotConfig[] = [
  // Dashboard
  { name: '01-executive-dashboard', path: '/dashboard', wait: 2000 },

  // Incidents
  { name: '02-incident-list', path: '/incidents', wait: 2000 },
  { name: '03-incident-report-form', path: '/incidents/new', wait: 1500 },

  // Investigations
  { name: '04-investigation-list', path: '/investigations', wait: 2000 },

  // CAPA
  { name: '05-capa-list', path: '/capa', wait: 2000 },
  { name: '06-capa-create', path: '/capa/new', wait: 1500 },

  // Recurrence
  { name: '07-recurrence-links', path: '/recurrence', wait: 2000 },

  // Trends
  { name: '08-trend-analysis', path: '/dashboard/trends', wait: 3000 },

  // OSHA Reports
  { name: '09-osha-reports', path: '/reports/osha', wait: 1500 },

  // Admin pages
  { name: '10-admin-users', path: '/admin/users', wait: 2000 },
  { name: '11-admin-factors', path: '/admin/factors', wait: 1500 },
  { name: '12-admin-projects', path: '/admin/projects', wait: 1500 },
  { name: '13-admin-hours-worked', path: '/admin/hours-worked', wait: 1500 },
  { name: '14-admin-notifications', path: '/admin/notifications', wait: 1500 },
  { name: '15-admin-system-config', path: '/admin/settings', wait: 1500 },
  { name: '16-admin-audit-log', path: '/admin/audit-log', wait: 2000 },
];

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Navigate to app and wait for initial load
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  for (const config of screenshots) {
    console.log(`Capturing: ${config.name} (${config.path})`);
    await page.goto(`${BASE_URL}${config.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(config.wait ?? 1500);

    if (config.action) {
      await config.action(page);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${config.name}.png`),
      fullPage: false,
    });
  }

  // Capture an incident detail page (first incident)
  console.log('Capturing: incident detail page');
  await page.goto(`${BASE_URL}/incidents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const firstRow = page.locator('table tbody tr').first();
  await firstRow.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '03a-incident-detail.png'),
    fullPage: false,
  });

  // Capture investigation detail page (first investigation)
  console.log('Capturing: investigation detail page');
  await page.goto(`${BASE_URL}/investigations`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const firstInvRow = page.locator('table tbody tr').first();
  await firstInvRow.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '04a-investigation-detail.png'),
    fullPage: false,
  });

  // Capture CAPA detail page (first CAPA)
  console.log('Capturing: CAPA detail page');
  await page.goto(`${BASE_URL}/capa`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const firstCapaRow = page.locator('table tbody tr').first();
  await firstCapaRow.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '05a-capa-detail.png'),
    fullPage: false,
  });

  // Capture recurrence clusters tab
  console.log('Capturing: recurrence clusters');
  await page.goto(`${BASE_URL}/recurrence`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const clustersTab = page.locator('button[role="tab"]', { hasText: 'Clusters' });
  await clustersTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '07a-recurrence-clusters.png'),
    fullPage: false,
  });

  // Capture dev user switcher with a different role
  console.log('Capturing: field reporter view');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Click the dev switcher dropdown
  const switcher = page.locator('[class*="MuiSelect"]').first();
  await switcher.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '17-dev-user-switcher.png'),
    fullPage: false,
  });
  // Select a field reporter
  const fieldReporter = page.locator('[role="option"]', { hasText: 'Field Reporter' }).first();
  await fieldReporter.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '18-field-reporter-view.png'),
    fullPage: false,
  });

  await browser.close();
  console.log(`\nDone! ${screenshots.length + 6} screenshots saved to ${SCREENSHOTS_DIR}`);
}

main().catch(console.error);
