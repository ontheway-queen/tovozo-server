import knex from "knex";
import config from "./config";

const createDbCon = (): knex.Knex<any, unknown[]> => {
  let connection;
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
    console.error("Error connecting database:", error);
  }
  return connection as knex.Knex<any, unknown[]>;
};

export const db = createDbCon();
