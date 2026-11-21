import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', testMatch: 'catalogo.spec.ts', fullyParallel: false, workers: 1,
  timeout: 30000, expect: { timeout: 8000 },
  reporter: 'list',
  use: { baseURL: 'http://localhost:8100', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm start', url: 'http://localhost:8100', reuseExistingServer: !process.env['CI'], timeout: 120000 }
});
