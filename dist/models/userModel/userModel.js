"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class UserModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    //update
    updateProfile(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (where.id) {
                    qb.where("id", where.id);
                }
            });
        });
    }
    checkUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, id, username, type, user_name, phone_number, }) {
            return yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (email) {
                    qb.andWhere("email", email);
                }
                if (username) {
                    qb.andWhere("username", username);
                }
                if (id) {
                    qb.andWhere("id", id);
                }
                if (type) {
                    qb.andWhere("type", type);
                }
                if (user_name) {
                    qb.andWhere("user_name", user_name);
                }
                if (phone_number) {
                    qb.andWhere("phone_number", phone_number);
                }
            })
                .first();
        });
    }
    getSingleCommonAuthUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ schema_name, table_name, user_id, user_name, email, phone_number, }) {
            return yield this.db(table_name)
                .withSchema(schema_name)
                .select("*")
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("user_id", user_id);
                }
                if (user_name) {
                    qb.andWhere("user_name", user_name);
                }
                if (email) {
                    qb.andWhere("email", email);
                }
                if (phone_number) {
                    qb.andWhere("phone_number", phone_number);
                }
            })
                .first();
        });
    }
    //get last  user Id
    getLastUserID() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('admin')
                .withSchema(this.ADMIN_SCHEMA)
                .select('id')
                .orderBy('id', 'desc')
                .limit(1);
            return data.length ? data[0].id : 0;
        });
    }
}
exports.default = UserModel;
