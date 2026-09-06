import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4200', channel: 'chrome', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm start -- --host 127.0.0.1', url: 'http://127.0.0.1:4200', reuseExistingServer: !process.env['CI'], timeout: 120000 },
});
