import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173/portfolio/';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: '../../test-results/qa/results.json' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'qa-desktop',
      testMatch: /qa\.(desktop|visual|perf|base|a11y)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'qa-mobile',
      testMatch: /qa\.mobile\.spec\.ts/,
      use: { ...devices['iPhone 12'], viewport: { width: 390, height: 844 } },
    },
  ],
});
