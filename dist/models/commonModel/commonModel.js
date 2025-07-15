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
const database_1 = require("../../app/database");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get otp
    getOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "hashed_otp", "tried")
                .andWhere("email", payload.email)
                .andWhere("type", payload.type)
                .andWhere("matched", 0)
                .andWhere("tried", "<", 3)
                .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`)
                .orderBy("id", "desc");
        });
    }
    // insert OTP
    insertOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // update otp
    updateOTP(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    insertLastNo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.last_no)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateLastNo(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.last_no)
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
    getLastId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ type, }) {
            return yield this.db(this.TABLES.last_no)
                .withSchema(this.DBO_SCHEMA)
                .select("id", "last_id")
                .where("type", type)
                .first();
        });
    }
    //get all country
    getAllCountry(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("countries")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "name", "iso2", "iso3", "phonecode", "currency", "currency_name", "numeric_code")
                .where((qb) => {
                if (payload.id) {
                    qb.where("id", payload.id);
                }
                if (payload.name) {
                    qb.andWhereILike("name", `%${payload.name}%`);
                }
                if (payload.iso2) {
                    qb.andWhere("iso2", payload.iso2);
                }
                if (payload.iso3) {
                    qb.andWhere("iso3", payload.iso3);
                }
            })
                .orderBy("name", "asc");
        });
    }
    //get all city
    getAllCity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country_id, city_id, limit, skip, state_id, name, }) {
            return yield this.db("cities")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "name")
                .where((qb) => {
                if (country_id) {
                    qb.where({ country_id });
                }
                if (name) {
                    qb.andWhere("name", "ilike", `%${name}%`);
                }
                if (city_id) {
                    qb.andWhere("id", city_id);
                }
                if (state_id) {
                    qb.andWhere("state_id", state_id);
                }
            })
                .orderBy("id", "asc")
                .limit(limit || 100)
                .offset(skip || 0);
        });
    }
    // get all states
    getAllStates(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country_id, state_id, limit, skip, name, }) {
            return yield this.db("states")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "name")
                .where((qb) => {
                if (country_id) {
                    qb.where({ country_id });
                }
                if (name) {
                    qb.andWhere("name", "ilike", `%${name}%`);
                }
                if (state_id) {
                    qb.andWhere("state_id", state_id);
                }
            })
                .orderBy("id", "asc")
                .limit(limit || 100)
                .offset(skip || 0);
        });
    }
    createLocation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("location")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateLocation(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("location")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (query.location_id) {
                    qb.andWhere("id", query.location_id);
                }
            });
        });
    }
    createNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.notification)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getNotification(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit = 100, skip = 0, id, user_id, need_total = true } = params;
            const data = yield this.db(`${this.TABLES.notification} as n`)
                .withSchema(this.DBO_SCHEMA)
                .select("n.id", "n.user_id", "n.content", "n.created_at", "n.related_id", "n.type", "u.type as user_type", this.db.raw(`
        CASE
          WHEN ns.user_id IS NOT NULL THEN true
          ELSE false
        END AS is_read
      `))
                .leftJoin("user as u", "u.id", "n.user_id")
                .leftJoin(`${this.TABLES.notification_seen} as ns`, function () {
                this.on("ns.notification_id", "n.id").andOn("ns.user_id", database_1.db.raw("?", [user_id]));
            })
                .leftJoin(`${this.TABLES.notification_delete} as nd`, function () {
                this.on("nd.notification_id", "n.id").andOn("nd.user_id", database_1.db.raw("?", [user_id]));
            })
                .whereNull("nd.notification_id")
                .andWhere((qb) => {
                if (user_id)
                    qb.andWhere("n.user_id", user_id);
                if (id)
                    qb.andWhere("n.id", id);
            })
                .orderBy("n.created_at", "desc")
                .limit(Number(limit))
                .offset(Number(skip));
            let total;
            if (need_total) {
                const totalQuery = yield this.db(`${this.TABLES.notification} as n`)
                    .withSchema(this.DBO_SCHEMA)
                    .count("n.id as total")
                    .leftJoin(`${this.TABLES.notification_seen} as ns`, function () {
                    this.on("ns.notification_id", "n.id").andOn("ns.user_id", database_1.db.raw("?", [user_id]));
                })
                    .leftJoin(`${this.TABLES.notification_delete} as nd`, function () {
                    this.on("nd.notification_id", "n.id").andOn("nd.user_id", database_1.db.raw("?", [user_id]));
                })
                    .whereNull("nd.notification_id")
                    .andWhere((qb) => {
                    if (id)
                        qb.andWhere("n.id", id);
                    if (user_id)
                        qb.andWhere("n.user_id", user_id);
                })
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : 0;
            }
            return {
                data,
                total,
            };
        });
    }
    deleteNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.notification_delete)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    readNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.notification_seen)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getAllNationality(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, limit = 100, skip = 0 } = params;
            const data = yield this.db(this.TABLES.nationality)
                .withSchema(this.DBO_SCHEMA)
                .select("id", "name", "created_at")
                .where((qb) => {
                qb.where("status", true);
                if (name) {
                    qb.whereILike("name", `%${name}%`);
                }
            })
                .orderBy("name", "asc")
                .limit(limit)
                .offset(skip);
            const total = yield this.db(this.TABLES.nationality)
                .withSchema(this.DBO_SCHEMA)
                .count("id as total")
                .where((qb) => {
                qb.where("status", true);
                if (name) {
                    qb.whereILike("name", `%${name}%`);
                }
            })
                .first();
            return {
                data,
                total: total === null || total === void 0 ? void 0 : total.total,
            };
        });
    }
}
exports.default = CommonModel;
