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
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


const login = async (page) => {
  await page.goto("https://www.instagram.com/accounts/login/");
  await page.waitForSelector("input[name=username]");
  await page.fill("input[name=username]", username);
  await page.fill("input[name=password]", password);
  await page.click("button[type=submit]");
};

let iters = 0;


const tryFollow = async (page, db): Promise<boolean> => {
  const nextFollowQuery = await db.getNextUserToFollow()
  if(!nextFollowQuery.rows)throw new Error("All out of rows")
  const nextFollow = nextFollowQuery.rows[0]   
  const username = nextFollow[0]
  console.log("follow", username)
  try{
    await page.goto(`https://www.instagram.com/${username}/`);
    try{
      await page.waitForSelector(`h2:has-text("Error")`, { timeout: 1000 })
      console.log("Going to sleep!!!")
      await sleep(130000);
      return true;
    }catch(e){}
    try{
      await page.waitForSelector(`h2:has-text("Sorry, this page isn't available.")`, { timeout: 1000 })
      await db.deleteUser(username)
      return true
    }catch(e){
      console.log("Page should be available", username)
    }        
    try{
      const fullText = await page.evaluate( (el: any) => el.innerText, await page.waitForSelector(`span:text-matches(" post\\s*", "i")`, { timeout: 2500 }))     
      const maybeNum = fullText.split(" ")[0].replace(",","")
      if(!isNumber(maybeNum)){
        console.log("something wrong.. waiting and then skip", username)
        await sleep(10000)
        return true;
      }
      const numPosts = parseInt(maybeNum)
      console.log("numPosts", numPosts)   
      if(Number.isNaN(numPosts) || numPosts < 15){
        // only follow people with more than 15 posts
        db.unfollowUser(username)
        return true;
      }             
    }catch(e){
      console.log("found problem", e)
      return true;
    }
    await page.waitForSelector(`button:has-text(\"Follow\")`);
    await page.click(`button:has-text(\"Follow\")`);
    await sleep(10000);
    //await page.reload()

    await db.followUser(username)
    if(iters++ > 1000)return false
    console.log("iters", iters)
  }catch(err){
    console.error("**e1", err)
    console.log("Doing the big wait for API refresh.")
    await sleep(130000);
  }  
  return true;    
}



const tryUnFollow = async (page, db): Promise<boolean> => {
  const nextFollowQuery = await db.getNextUserToUnfollow()
  if(!nextFollowQuery.rows){
    console.log("Nobody in the unfollow state")
    return true;
  }
  const nextFollow = nextFollowQuery.rows[0]   
  const username = nextFollow[0]
  console.log("unfollow", username)
  try{
    await page.goto(`https://www.instagram.com/${username}/`);
    try{
      await page.waitForSelector(`h2:has-text("Error")`, { timeout: 1000 })
      console.log("Going to sleep!!!")
      await sleep(130000);
      return true;
    }catch(e){}
    try{
      await page.waitForSelector(`h2:has-text("Sorry, this page isn't available.")`, { timeout: 1000 })
      await db.deleteUser(username)
      return true
    }catch(e){
      console.log("Page should be available", username)
    } 
    try{
      await page.waitForSelector('button:has-text("Requested")', { timeout: 1000 });            
      console.warn("**** Can't unfollow (going to skip for now)", username)
      return true
    }catch(e){}
    try{
      await page.waitForSelector(`button:has-text(\"Follow\")`, { timeout: 1000 });
      console.warn("**** UN1", username)
      await db.unfollowUser(username)    
      return true
    }catch(e){
    }
    
    await page.waitForSelector('css=[aria-label="Following"]');          
    await page.click('css=[aria-label="Following"]');          
    await page.waitForSelector(`button:has-text(\"Unfollow\")`);
    await page.click(`button:has-text(\"Unfollow\")`);
    try{
      await page.waitForSelector("h3:has-text(\"Try again later\")", { timeout: 3000 })
      console.log("API error .. going to do a big wait (1h)", new Date())
      await sleep(60*60*1000);
      return true
    }catch(e){}
    console.log("**** UN2", username)
    await db.unfollowUser(username)    
  }catch(err){
    console.error("**e1", err)
    console.log("Doing the big wait for API refresh.", new Date())
    await sleep(130000);
  }  
  return true;    
}

const timeout = 240 * 1000

test.describe("website user signin feature", () => {
  test.beforeEach(async ({ page }) => {});

  test("harvest the bieber action", async ({ page }) => {
    const db = new Database();
    await db.connect();
    await db.createTables();
    await login(page);
    await sleep(5000);



    for(;;){
      console.log("time", new Date())
      await tryFollow(page, db)
      await tryUnFollow(page, db)
      const noise = Math.random() * timeout
      console.log("noise sleep seconds", noise / 1000)
      await sleep(noise)
    }
  });

  console.log("DONE !!!!")
});
