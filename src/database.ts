import { Connection } from "postgresql-client";

export class Database {
  connection: Connection = null;

  constructor() {
    this.connection = new Connection(
      "postgresql://coreyauger:postgres@localhost/insta"
    );
  }

  connect = async () => {
    return await this.connection.connect();
  };

  createTables = async () => {
    console.log("Database createTables");
    // Create the strata table
    await this.connection.query(
      `CREATE TABLE IF NOT EXISTS public.Followers (
                    username VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255),
                    created_on BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
                    followed_on BIGINT,
                    unfollowed_on BIGINT
                    );`
    );
  };

  addUsername = async (username: string) => {
    return await this.connection.query(
      `INSERT INTO public.Followers (username) VALUES($1) ON CONFLICT DO NOTHING;`,
      { params: [username] }
    );
  };

  updateUserId = async (username: string, userId: string) => {
    return await this.connection.query(
      `UPDATE public.Followers SET user_id = $1 WHERE username = $2;`,
      { params: [userId, username] }
    );
  };

  getNextUserToFollow = async () => {
    return await this.connection.query(
      `SELECT * FROM public.Followers WHERE followed_on is NULL and unfollowed_on is NULL LIMIT 1;`
    );
  };

  unfollowUser = async (username: string) => {
    return await this.connection.query(
      `UPDATE public.Followers SET unfollowed_on = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) WHERE username = $1;`,
      { params: [username] }
    );
  };

  followUser = async (username: string) => {
    return await this.connection.query(
      `UPDATE public.Followers SET followed_on = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) WHERE username = $1;`,
      { params: [username] }
    );
  };

  deleteUser = async (username: string) => {
    return await this.connection.query(
      `DELETE FROM public.Followers WHERE username = $1;`,
      { params: [username] }
    );
  }

  getNextUserToUnfollow = async () => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    return await this.connection.query(
      `SELECT * FROM public.Followers WHERE followed_on < $1 AND unfollowed_on is NULL LIMIT 1;`,
      { params: [ Math.round( ((new Date().getTime()) - oneWeekMs) / 1000)] }
    );
  };
}
