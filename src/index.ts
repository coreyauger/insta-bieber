import Instagram from "instagram-web-api";
import dotenv from "dotenv";

const config =dotenv.config();
console.log("config", config)
const { username, password } = process.env;

const client = new Instagram({ username, password });

function sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

const massUnfollow = async (userId: string): Promise<number> => {
    let unfollowCount = 0;
    const pageSize = 100
    console.log("mass unfollow for", userId)
    let cursor = 0;
    let count = 100000;
    while(count > 0){
        console.log("---")
        const followers = await client.getFollowings({ userId: userId})
        count = followers.count
        console.log("***followers", followers)
        const data = followers.data
        cursor = cursor + data.length;        
        for(let x=0; x<data.length; x++){
            const u = data[x]
            unfollowCount++;
            try{
                const status = await client.unfollow({ userId: u.id })
                console.log("x", {status, u})
                await sleep(20000)
            }catch(e){
                console.error("rate limit", e)
                await sleep(240000)
            }        
            console.log(".")        
        }        
    }
    return unfollowCount;
}


(async () => {
  
console.log("username:",username)
    const user = await client.login();
    console.log("user", user)
  //const profile = await client.getProfile();
  //console.log("profile: ",profile);
  //const coreyauger = await client.getUserByUsername({ username: 'coreyauger' })
  //console.log("coreyauger", coreyauger)

  const unfollowed = await massUnfollow(user.userId)
  console.log("unfollowed", unfollowed)
  /*
  const lovebombs = await client.getPhotosByHashtag({ hashtag: "lovebomb" });
  lovebombs.hashtag.edge_hashtag_to_media.edges.map(async (post: any) => {
    console.log(post);
    console.log(post.node.owner);
    const media = await client.getMediaByShortcode({
      shortcode: post.node.shortcode,
    });

    console.log("**", media);
        
    const owner = await client.getUserByUsername({
      username: media.owner.username,
    });

    console.log("~~", owner);    
  });
  */
})();