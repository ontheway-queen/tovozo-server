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
class AdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create audit
    createAudit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.audit_trail)
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    // create admin
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("admin")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "user_id");
        });
    }
    // update admin
    updateAdmin(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("admin")
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (query.user_id) {
                    qb.andWhere("user_id", query.user_id);
                }
            });
        });
    }
    //get all admin
    getAllAdmin(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("admin as ua")
                .withSchema(this.ADMIN_SCHEMA)
                .select("ua.user_id", "u.username", "u.name", "u.email", "u.phone_number", "u.photo", "u.status", 
            // "u.socket_id",
            "rl.name as role", "rl.id as role_id", "ua.is_2fa_on")
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
                .where((qb) => {
                if (query.filter) {
                    qb.where((qbc) => {
                        qbc.where("u.username", "ilike", `%${query.filter}%`);
                        qbc.orWhere("u.email", "ilike", `%${query.filter}%`);
                        qbc.orWhere("u.phone_number", "ilike", `%${query.filter}%`);
                    });
                }
                if (query.role) {
                    qb.andWhere("rl.id", query.role);
                }
                if (query.status !== undefined) {
                    qb.andWhere("u.status", query.status);
                }
            })
                .orderBy("ua.user_id", "desc")
                .limit(query.limit ? query.limit : 1000)
                .offset(query.skip ? query.skip : 0);
            let total = [];
            if (is_total) {
                total = yield this.db("admin as ua")
                    .withSchema(this.ADMIN_SCHEMA)
                    .count("u.id as total")
                    .leftJoin("roles as rl", "rl.id", "ua.role_id")
                    .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
                    .where((qb) => {
                    if (query.filter) {
                        qb.where((qbc) => {
                            qbc.where("u.username", "ilike", `%${query.filter}%`);
                            qbc.orWhere("u.email", "ilike", `%${query.filter}%`);
                            qbc.orWhere("u.phone_number", "ilike", `%${query.filter}%`);
                        });
                    }
                    if (query.role) {
                        qb.andWhere("rl.id", query.role);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere("u.status", query.status);
                    }
                });
            }
            return {
                data: data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get single admin
    getSingleAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Payload for getSingleAdmin:", payload);
            return yield this.db("admin as ua")
                .select("ua.*", "u.username", "u.name", "u.email", "u.phone_number", "u.photo", "u.password_hash", "u.status", "u.socket_id", "rl.name as role", "rl.id as role_id")
                .withSchema(this.ADMIN_SCHEMA)
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
                .where((qb) => {
                if (payload.id) {
                    qb.where("ua.user_id", payload.id);
                }
                if (payload.email) {
                    qb.orWhere("u.email", payload.email);
                }
                if (payload.phone_number) {
                    qb.orWhere("u.phone_number", payload.phone_number);
                }
                if (payload.username) {
                    qb.orWhere("u.username", payload.username);
                }
            });
        });
    }
}
exports.default = AdminModel;
