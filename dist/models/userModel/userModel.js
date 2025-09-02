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
    createUserMaintenanceDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.maintenance_designation)
                .withSchema(this.HOTELIER)
                .insert(payload);
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
    checkUser(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id, username, type, phone_number } = params;
            return yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where("is_deleted", false)
                .modify((qb) => {
                if (id)
                    qb.andWhere("id", id);
                if (type)
                    qb.andWhere("type", type);
                if (email)
                    qb.andWhere("email", email);
                if (username)
                    qb.andWhere("username", username);
                if (phone_number)
                    qb.andWhere("phone_number", phone_number);
            });
        });
    }
    getSingleCommonAuthUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ schema_name, table_name, user_id, user_name, email, phone_number, }) {
            return this.db(table_name)
                .withSchema(schema_name)
                .select("*")
                .modify((qb) => {
                if (user_id) {
                    qb.where("user_id", user_id);
                }
                if (user_name)
                    qb.where("username", user_name);
                if (email)
                    qb.where("email", email);
                if (phone_number)
                    qb.where("phone_number", phone_number);
            })
                .first();
        });
    }
    //get last  user Id
    getLastUserID() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .max("id as max")
                .first();
            return (_a = result === null || result === void 0 ? void 0 : result.max) !== null && _a !== void 0 ? _a : 0;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .update({ is_deleted: true })
                .where({ id });
        });
    }
}
exports.default = UserModel;
