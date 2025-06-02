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
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get otp
    getOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "hashed_otp as otp", "tried")
                .andWhere("email", payload.email)
                .andWhere("type", payload.type)
                .andWhere("matched", 0)
                .andWhere("tried", "<", 3)
                .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`);
            return check;
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
            // console.log({ city_id });
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
            // console.log({ city_id });
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
}
exports.default = CommonModel;
