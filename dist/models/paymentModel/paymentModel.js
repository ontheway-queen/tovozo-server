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
class PaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getLastPaymentId() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .select("payment_id")
                .orderBy("id", "desc")
                .first();
            return (_a = result === null || result === void 0 ? void 0 : result.id) !== null && _a !== void 0 ? _a : null;
        });
    }
    createPayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    // For Hotelier
    getPaymentsForHotelier(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelier_id, skip = 0, limit = 10, search = "" } = params;
            const baseQuery = this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.payment_id", "p.application_id", "job_seeker.name as job_seeker_name", "jp.id as job_post_id", "jp.title as job_title", "p.payment_type", "p.status", "p.paid_at", "p.trx_id")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .joinRaw(`
			LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
		`)
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .whereRaw("org.user_id = ?", [hotelier_id]);
            if (search) {
                baseQuery.andWhere("jp.title", "ilike", `%${search}%`);
            }
            const countQuery = baseQuery
                .clone()
                .clearSelect()
                .count("p.id as count")
                .first();
            const dataQuery = baseQuery.offset(skip).limit(limit);
            const [data, countResult] = yield Promise.all([dataQuery, countQuery]);
            return {
                data,
                total: Number((countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0),
            };
        });
    }
    // For Job Seeker
    getPaymentsForJobSeeker(job_seeker_id_1) {
        return __awaiter(this, arguments, void 0, function* (job_seeker_id, skip = 0, limit = 10, search = "") {
            const baseQuery = this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.payment_id", "p.application_id", "org.name as organization_name", "jp.id as job_post_id", "jp.title as job_title", "p.job_seeker_pay", "p.status", "p.paid_at", "p.trx_id")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .joinRaw(`
      LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
    `)
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .where("job_seeker.id", job_seeker_id);
            if (search) {
                baseQuery.andWhere("jp.title", "ilike", `%${search}%`);
            }
            const countQuery = baseQuery
                .clone()
                .clearSelect()
                .count("p.id as count")
                .first();
            const dataQuery = baseQuery.offset(skip).limit(limit);
            const [data, countResult] = yield Promise.all([dataQuery, countQuery]);
            return {
                data,
                total: Number((countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0),
            };
        });
    }
}
exports.default = PaymentModel;
