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
class PayoutRequestsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createPayoutRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payout_requests")
                .withSchema(this.JOB_SEEKER)
                .insert(payload, "id");
        });
    }
    // Get All Payout Request for admin
    getAllPayoutRequests(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search, limit = 20, skip = 0, }) {
            const baseQuery = this.db("payout_requests as pr")
                .withSchema(this.JOB_SEEKER)
                .select("pr.id", "pr.job_seeker_id", "jsu.name as job_seeker_name", "jsu.email as job_seeker_email", "pr.amount", "pr.status", "pr.requested_at", "pr.approved_by", "pr.approved_at", "pr.paid_at", "pr.transaction_reference", "pr.note", "pr.is_deleted")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`);
                    });
                }
            })
                .orderBy("pr.requested_at", "desc");
            const countQuery = this.db("payout_requests as pr")
                .withSchema(this.JOB_SEEKER)
                .count("pr.id as count")
                .joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .modify((qb) => {
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("jsu.name", `%${search}%`)
                            .orWhereILike("jsu.email", `%${search}%`);
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
}
exports.default = PayoutRequestsModel;
