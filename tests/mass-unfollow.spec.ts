import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

const config = dotenv.config();
const { username, password } = process.env;

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const login = async (page) => {
  await page.goto("https://www.instagram.com/accounts/login/");
  await page.waitForSelector("input[name=username]");
  await page.fill("input[name=username]", username);
  await page.fill("input[name=password]", password);
  await page.click("button[type=submit]");
};

test.describe("website user signin feature", () => {
  test.beforeEach(async ({ page }) => {});

  test("unfollow action", async ({ page }) => {
    await login(page);
    await sleep(5000);
    await page.goto("https://www.instagram.com/coreyauger/");
    await page.waitForSelector("a[href='/coreyauger/following/']");
    await page.click("a[href='/coreyauger/following/']");
    for (let i = 1; ; i++) {
      await page.waitForSelector("button:has-text('Following')");
      await page.click("button:has-text('Following')");
      await page.waitForSelector("button:has-text('Unfollow')");
      await page.click("button:has-text('Unfollow')");
      await sleep(2000);
      if (i % 4 === 0) await sleep(130000);
    }
  });
});
