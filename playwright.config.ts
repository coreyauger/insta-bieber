// playwright.config.ts
import { PlaywrightTestConfig, devices } from "@playwright/test";

const headless = process.env.TEST_HEADLESS !== "false";

const config: PlaywrightTestConfig = {
  reporter: "line",
  projects: [
    {
      name: "Chrome Stable",
      timeout: 99900000,
      use: {
        browserName: "chromium",
        headless,

        // Test against Chrome Stable channel.
        channel: "chrome",
        launchOptions: headless
          ? {}
          : {
              slowMo: 5,
            },
      },
    },
  ],
};
export default config;
