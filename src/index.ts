import Instagram from "instagram-web-api";
import dotenv from "dotenv";

const config =dotenv.config();
console.log("config", config)
const { username, password } = process.env;

const client = new Instagram({ username, password });

(async () => {
  
console.log("username:",username)
    const user = await client.login();
    console.log("user", user)
  const profile = await client.getProfile();
  console.log("profile: ",profile);
  const coreyauger = await client.getUserByUsername({ username: 'coreyauger' })
  console.log("coreyauger", coreyauger)

  const followers = await client.getFollowers({ userId: user.userId })
  console.log("followers", followers)
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