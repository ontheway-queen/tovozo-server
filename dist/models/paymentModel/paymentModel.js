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
                .select("payment_no")
                .orderBy("id", "desc")
                .first();
            return (_a = result === null || result === void 0 ? void 0 : result.payment_no) !== null && _a !== void 0 ? _a : null;
        });
    }
    initializePayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    // Payment For Hotelier
    getPaymentsForHotelier(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelier_id, skip = 0, limit = 10, search = "" } = params;
            const baseQuery = this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.payment_no", "p.application_id", "p.total_amount", "job_seeker.id as job_seeker_id", "job_seeker.name as job_seeker_name", "j.title as job_title", "p.payment_type", "p.status", "p.paid_at", "p.trx_id")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .joinRaw(`
			LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
		`)
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .whereRaw("org.user_id = ?", [hotelier_id]);
            if (search) {
                baseQuery.andWhere("j.title", "ilike", `%${search}%`);
            }
            if (params.status) {
                baseQuery.andWhere("p.status", params.status);
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
    getSinglePaymentForHotelier(id, hotelier_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db
                .withSchema(this.DBO_SCHEMA)
                .from("payment as p")
                .select("p.id", "p.payment_no", "p.application_id", "p.total_amount", "job_seeker.id as job_seeker_id", "job_seeker.name as job_seeker_name", "j.title as job_title", "p.payment_type", "p.status", "p.paid_at", "p.trx_id")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .where("p.id", id)
                .modify((qb) => {
                if (hotelier_id) {
                    qb.andWhere("org.user_id", hotelier_id);
                }
            })
                .first();
        });
    }
    // For Hotelier
    verifyCheckoutSessionAndUpdatePayment(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where({ id })
                .update(payload, "id");
        });
    }
    // Payment For Job Seeker
    getPaymentsForJobSeeker(_a) {
        return __awaiter(this, arguments, void 0, function* ({ job_seeker_id, skip, limit, search, status, }) {
            const baseQuery = this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.payment_no", "p.application_id", "org.name as organization_name", "jp.id as job_post_id", "jp.title as job_title", "p.job_seeker_pay", "p.status", "p.paid_at", "p.trx_id")
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
            if (status) {
                baseQuery.andWhere("p.status", status);
            }
            const countQuery = baseQuery
                .clone()
                .clearSelect()
                .count("p.id as count")
                .first();
            const dataQuery = baseQuery
                .offset(skip)
                .limit(limit);
            const [data, countResult] = yield Promise.all([dataQuery, countQuery]);
            return {
                data,
                total: Number((countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0),
            };
        });
    }
    getSinglePaymentForJobSeeker(id, job_seeker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db
                .withSchema(this.DBO_SCHEMA)
                .from("payment as p")
                .select("p.id", "p.payment_no", "p.application_id", "org.name as organization_name", "jp.id as job_post_id", "jp.title as job_title", "p.job_seeker_pay", "p.status", "p.paid_at", "p.trx_id")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .where("p.id", id)
                .modify((qb) => {
                if (job_seeker_id) {
                    qb.andWhere("job_seeker.id", job_seeker_id);
                }
            })
                .first();
        });
    }
    // Payment for Admin
    getAllPaymentsForAdmin(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { limit, skip, search, status } = params;
            const data = yield this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.application_id", "jp.title as job_title", "job_seeker.id as job_seeker_id", "job_seeker.name as job_seeker_name", "org.id as paid_by_id", "org.name as paid_by", "p.total_amount", "p.job_seeker_pay", "p.platform_fee", "p.status", "p.payment_no", "p.trx_id", "p.paid_at")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? AS org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .where((qb) => {
                if (search) {
                    qb.where("jp.title", "ilike", `%${search}%`);
                }
                if (status) {
                    qb.andWhere("p.status", status);
                }
            })
                .orderBy("p.id", "desc")
                .offset(skip)
                .limit(limit);
            const totalResult = yield this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .where((qb) => {
                if (search) {
                    qb.where("jp.title", "ilike", `%${search}%`);
                }
                if (status) {
                    qb.andWhere("p.status", status);
                }
            })
                .count("* as count")
                .first();
            const total = Number((_a = totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) !== null && _a !== void 0 ? _a : 0);
            return { data, total };
        });
    }
    getSinglePaymentForAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment as p")
                .withSchema(this.DBO_SCHEMA)
                .select("p.id", "p.application_id", "jp.title as job_title", "job_seeker.id as job_seeker_id", "job_seeker.name as job_seeker_name", "org.id as paid_by_id", "org.name as paid_by", "p.total_amount", "p.job_seeker_pay", "p.platform_fee", "p.status", "p.payment_no", "p.trx_id", "p.paid_at")
                .leftJoin("job_applications as ja", "ja.id", "p.application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? AS org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .where("p.id", id)
                .first();
        });
    }
    // Update payment
    updatePayment(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // create payment ledger
    createPaymentLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSinglePayment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where({ id })
                .first();
        });
    }
    // Ledger
    getAllPaymentLedgerForHotelier(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { user_id, limit, skip, search } = params;
            const data = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "trx_type", "amount", "details", "ledger_date", "voucher_no")
                .where("user_id", user_id)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .orderBy("id", "desc")
                .offset(skip)
                .limit(limit);
            const totalResult = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .count("* as count")
                .where("user_id", user_id)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .first();
            const total = Number((_a = totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) !== null && _a !== void 0 ? _a : 0);
            return { data, total };
        });
    }
    getAllPaymentLedgerForJobSeeker(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { job_seeker_id, limit, skip, search } = params;
            const data = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "trx_type", "amount", "details", "ledger_date", "voucher_no")
                .where("user_id", job_seeker_id)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .orderBy("id", "desc")
                .offset(skip)
                .limit(limit);
            const totalResult = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .count("* as count")
                .where("user_id", job_seeker_id)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .first();
            const total = Number((_a = totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) !== null && _a !== void 0 ? _a : 0);
            return { data, total };
        });
    }
    getAllPaymentLedgerForAdmin(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { limit, skip, search, type } = params;
            const data = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "trx_type", "amount", "details", "ledger_date", "voucher_no")
                .where("user_type", type)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .orderBy("id", "desc")
                .offset(skip)
                .limit(limit);
            const totalResult = yield this.db("payment_ledger")
                .withSchema(this.DBO_SCHEMA)
                .count("* as count")
                .where("user_type", type)
                .andWhere((qb) => {
                if (search) {
                    qb.where("details", "ilike", `%${search}%`);
                }
            })
                .first();
            const total = Number((_a = totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) !== null && _a !== void 0 ? _a : 0);
            return { data, total };
        });
    }
}
exports.default = PaymentModel;
