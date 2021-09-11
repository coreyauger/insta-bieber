import Instagram from "instagram-web-api";
import dotenv from "dotenv";
import { Database } from "./database";
import { exit } from "process";

const config = dotenv.config();
console.log("config", config);
const { username, password } = process.env;

const client = new Instagram({ username, password });

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const massUnfollow = async (userId: string): Promise<number> => {
  let unfollowCount = 0;
  const pageSize = 100;
  console.log("mass unfollow for", userId);
  let cursor = 0;
  let count = 100000;
  while (count > 0) {
    console.log("---");
    const followers = await client.getFollowings({ userId: userId });
    await sleep(20000);
    count = followers.count;
    console.log("***followers", followers);
    const data = followers.data;
    cursor = cursor + data.length;
    for (let x = 0; x < data.length; x++) {
      const u = data[x];
      unfollowCount++;
      try {
        const status = await client.unfollow({ userId: u.id });
        console.log("x", { status, u });
        await sleep(20000);
      } catch (e) {
        console.error("rate limit", e);
        await sleep(240000);
      }
      console.log(".");
    }
  }
  return unfollowCount;
};

(async () => {
  const db = new Database();console
  await db.connect();
  await db.createTables();

  //console.log("username:", username);
  const user = await client.login();
  console.log("user", user);
  for(;;){
    const nextFollowQuery = await db.getNextUserToFollow()
    if(!nextFollowQuery.rows)throw new Error("All out of rows")
    const nextFollow = nextFollowQuery.rows[0]   
    const username = nextFollow[0]
    console.log("follow", username)
    try{
      const follow = await client.getUserByUsername({username})
      db.updateUserId(username, follow.userId)
      await client.follow({userId: follow.userId})
      await db.followUser(username)
    }catch(err){
      console.error("**e1", err)
    }
    console.log("SUCCCESSSS")
    exit(1)
  }
  //const unfollowed = await massUnfollow(user.userId);
 // console.log("unfollowed", unfollowed);
  
})();
