"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const config_1 = __importDefault(require("./config"));
let connection = null;
const createDbCon = () => {
    if (!connection) {
        try {
            connection = (0, knex_1.default)({
                client: "pg",
                connection: {
                    host: config_1.default.DB_HOST,
                    port: parseInt(config_1.default.DB_PORT),
                    user: config_1.default.DB_USER,
                    password: config_1.default.DB_PASS,
                    database: config_1.default.DB_NAME,
                    // ssl: {
                    //   rejectUnauthorized: false,
                    // },
                },
                pool: {
                    min: 0,
                    max: 100,
                },
            });
        }
        catch (error) {
            console.error("Error creating database connection:", error);
            throw error;
        }
    }
    return connection;
};
exports.db = createDbCon();
