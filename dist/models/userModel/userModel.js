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
    checkUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, id, username, type, phone_number, }) {
            return yield this.db(this.TABLES.user)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                qb.where("is_deleted", false).andWhere((qbc) => {
                    if (id) {
                        qbc.andWhere("id", id);
                    }
                    if (type) {
                        qbc.andWhere("type", type).andWhere((subQbc) => {
                            if (email) {
                                subQbc.andWhere("email", email);
                            }
                            if (username) {
                                subQbc.orWhere("username", username);
                            }
                            if (phone_number) {
                                subQbc.orWhere("phone_number", phone_number);
                            }
                        });
                    }
                });
            });
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
                    qb.andWhere("username", user_name);
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
            const data = yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .select("id")
                .orderBy("id", "desc")
                .limit(1);
            return data.length ? data[0].id : 0;
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
    // Add Strie Payout Account
    addStripePayoutAccount(_a) {
        return __awaiter(this, arguments, void 0, function* ({ user_id, stripe_acc_id, }) {
            return yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .update({ stripe_acc_id })
                .where({ id: user_id });
        });
    }
}
exports.default = UserModel;
