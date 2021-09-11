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

let iters = 0;

test.describe("website user signin feature", () => {
  test.beforeEach(async ({ page }) => {});

  test("harvest the bieber action", async ({ page }) => {
    const db = new Database();
    await db.connect();
    await db.createTables();
    await login(page);
    await sleep(5000);



  for(;;){
      const nextFollowQuery = await db.getNextUserToFollow()
      if(!nextFollowQuery.rows)throw new Error("All out of rows")
      const nextFollow = nextFollowQuery.rows[0]   
      const username = nextFollow[0]
      console.log("follow", username)
      try{
        await page.goto(`https://www.instagram.com/${username}/`);
        try{
          await page.waitForSelector(`h2:has-text("Sorry, this page isn't available.")`, { timeout: 5000 })
          await db.deleteUser(username)
          continue
        }catch(e){
          console.log("Page should be available")
        }

        const fullText = await page.evaluate( (el: any) => el.innerText, await page.waitForSelector(`span:has-text(\" posts\")`))     
        const numPosts = parseInt(fullText.split(" ")[0])
        console.log("numPosts", numPosts)   
        if(numPosts < 50){
          // only follow people with more than 50 posts
          db.unfollowUser(username)
          continue;
        }             
        await page.waitForSelector(`button:has-text(\"Follow\")`);
        await page.click(`button:has-text(\"Follow\")`);
        await sleep(10000);
        await page.reload()

        await db.followUser(username)
        if(iters++ > 2000)break
        console.log("iters", iters)
      }catch(err){
        console.error("**e1", err)
        await sleep(130000);
      }      
    }
  });

  console.log("DONE !!!!")
});
