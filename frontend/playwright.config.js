import { defineConfig, devices } from '@playwright/test';

// Test nel browser sull'app servita da nginx.
// Nel servizio docker "e2e" BASE_URL vale http://nginx (rete interna compose).
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8080',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
