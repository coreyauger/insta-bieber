import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Database } from "../src/database";

const config = dotenv.config();
const { username, password } = process.env;

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function scrollOnElement(page, selector) {
  await page.$eval(selector, (element) => {
    element.scrollIntoView();
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

  test("harvest the bieber action", async ({ page }) => {
    const db = new Database();
    await db.connect();
    await db.createTables();
    await login(page);
    await sleep(5000);
    await page.goto("https://www.instagram.com/justinbieber/");
    await page.waitForSelector("a[href='/justinbieber/followers/']");
    await page.click("a[href='/justinbieber/followers/']");
    for (let i = 2; ; i++) {
      console.log("wait for selector");
      const selector = `img[data-testid='user-avatar'] >> nth=${i}`;
      await page.waitForSelector(selector);
      const imgElement = await page.$(selector);
      const username = (await imgElement.getAttribute("alt")).replace(
        "'s profile picture",
        ""
      );
      await scrollOnElement(page, selector);
      console.log(`**username[${i}]`, username);
      // TODO: store the username in postgress
      await sleep(500);
    }
  });
});
