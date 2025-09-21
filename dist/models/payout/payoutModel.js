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
class PayoutModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createPayout(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payout")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    // Get All Payout Request for job seeker
    getPayoutsForJobSeeker(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search, limit = 20, skip = 0, status, user_id, }) {
            const baseQuery = this.db("payout as pr")
                .withSchema(this.DBO_SCHEMA)
                .select("pr.id", "pr.job_seeker_id", "jsu.name as job_seeker_name", "jsu.email as job_seeker_email", "pr.amount", "pr.status", "pr.requested_at", "pr.managed_by", "pr.managed_at", "pr.transaction_reference", "pr.job_seeker_note", "pr.admin_note", "pr.bank_account_name", "pr.bank_account_number", "pr.bank_code", "pr.is_deleted")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .where("pr.job_seeker_id", user_id)
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`)
                            .orWhereILike("pr.bank_account_name", `%${search}%`)
                            .orWhereILike("pr.bank_account_number", `%${search}%`)
                            .orWhereILike("pr.bank_code", `%${search}%`);
                    });
                }
                if (status) {
                    qb.andWhere("pr.status", status);
                }
            })
                .orderBy("pr.requested_at", "desc");
            const countQuery = this.db("payout as pr")
                .withSchema(this.DBO_SCHEMA)
                .count("pr.id as count")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .where("pr.job_seeker_id", user_id)
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`)
                            .orWhereILike("pr.bank_account_name", `%${search}%`)
                            .orWhereILike("pr.bank_account_number", `%${search}%`)
                            .orWhereILike("pr.bank_code", `%${search}%`);
                    });
                }
                if (status) {
                    qb.andWhere("pr.status", status);
                }
            })
                .first();
            const dataQuery = baseQuery.offset(skip).limit(limit);
            const [data, countResult] = yield Promise.all([dataQuery, countQuery]);
            return {
                total: Number((countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0),
                data,
            };
        });
    }
    getSinglePayout(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payout as pr")
                .withSchema(this.DBO_SCHEMA)
                .select("pr.id", "pr.job_seeker_id", "jsu.name as job_seeker_name", "jsu.email as job_seeker_email", "pr.amount", "pr.status", "pr.requested_at", "pr.managed_by as managed_by_id", "ua.name as managed_by_name", "ua.photo as managed_by_photo", "pr.managed_at", "pr.transaction_reference", "pr.job_seeker_note", "pr.admin_note", "pr.bank_account_name", "pr.bank_account_number", "pr.bank_code", "pr.is_deleted")
                .joinRaw(`LEFT JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .joinRaw(`LEFT JOIN ?? as ua ON ua.id = pr.managed_by`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .where("pr.id", where.id)
                .first();
        });
    }
    // Get All Payout Request for admin
    getAllPayoutForAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search, limit = 20, skip = 0, }) {
            const baseQuery = this.db("payout as pr")
                .withSchema(this.DBO_SCHEMA)
                .select("pr.id", "pr.job_seeker_id", "jsu.name as job_seeker_name", "jsu.email as job_seeker_email", "pr.amount", "pr.status", "pr.requested_at", "pr.managed_by", "pr.managed_at", "pr.transaction_reference", "pr.job_seeker_note", "pr.bank_account_name", "pr.bank_account_number", "pr.bank_code", "pr.is_deleted")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`)
                            .orWhereILike("pr.bank_account_name", `%${search}%`)
                            .orWhereILike("pr.bank_account_number", `%${search}%`)
                            .orWhereILike("pr.bank_code", `%${search}%`);
                    });
                }
            })
                .orderBy("pr.requested_at", "desc");
            const countQuery = this.db("payout as pr")
                .withSchema(this.DBO_SCHEMA)
                .count("pr.id as count")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`)
                            .orWhereILike("pr.bank_account_name", `%${search}%`)
                            .orWhereILike("pr.bank_account_number", `%${search}%`)
                            .orWhereILike("pr.bank_code", `%${search}%`);
                    });
                }
            })
                .first();
            const dataQuery = baseQuery.offset(skip).limit(limit);
            const [data, countResult] = yield Promise.all([dataQuery, countQuery]);
            return {
                total: Number((countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0),
                data,
            };
        });
    }
    managePayout(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, payload, }) {
            return yield this.db("payout")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
}
exports.default = PayoutModel;
