import { defineConfig, devices } from "@playwright/test";

const clientUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5182";
const apiUrl = process.env.PLAYWRIGHT_API_URL || "http://localhost:5082/api";
const socketUrl = apiUrl.replace(/\/api$/, "");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 30_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: clientUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev --prefix server",
      url: "http://localhost:5082/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev --prefix client",
      url: clientUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: apiUrl,
        VITE_SOCKET_URL: socketUrl,
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
