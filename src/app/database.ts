import knex from "knex";
import config from "./config";

let connection: knex.Knex | null = null;

const createDbCon = (): knex.Knex => {
  if (!connection) {
    try {
      connection = knex({
        client: "pg",
        connection: {
          host: config.DB_HOST,
          port: parseInt(config.DB_PORT),
          user: config.DB_USER,
          password: config.DB_PASS,
          database: config.DB_NAME,
          // ssl: {
          //   rejectUnauthorized: false,
          // },
        },
        pool: {
          min: 0,
          max: 100,
        },
      });
    } catch (error) {
      console.error("Error creating database connection:", error);
      throw error;
    }
  }

  return connection;
};

export const db = createDbCon();
