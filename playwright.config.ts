import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e/browser',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
//   webServer: {
//     command: 'npm run dev',
//     port: 3000,
//     reuseExistingServer: !process.env.CI,
//   },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    }
  ]
};

export default config; 