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
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class JobSeekerModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobSeeker(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .insert(payload);
        });
    }
    updateJobSeeker(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .update(payload)
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            });
        });
    }
    getJobSeeker(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            })
                .first();
        });
    }
    getAllJobSeekerList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, name, status, from_date, to_date, limit = 100, skip = 0, sortBy, application_status, } = params;
            const data = yield this.db("vw_full_job_seeker_profile")
                .withSchema(this.JOB_SEEKER)
                .select("user_id", "email", "name", "photo", "account_status", "user_created_at")
                .distinct("user_id")
                .joinRaw(`LEFT JOIN ?? as ja ON ja.job_seeker_id = vw_full_job_seeker_profile.user_id`, [`${this.DBO_SCHEMA}.${this.TABLES.job_applications}`])
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("user_id", user_id);
                }
                if (name) {
                    qb.andWhereILike("name", `%${name}%`).orWhere("email", name);
                }
                if (status) {
                    qb.andWhere("account_status", status);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween("user_created_at", [from_date, to_date]);
                }
                if (application_status &&
                    application_status === constants_1.JOB_APPLICATION_STATUS.COMPLETED) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where("ja.status", constants_1.JOB_APPLICATION_STATUS.COMPLETED)
                            .orWhereNull("ja.job_seeker_id");
                    });
                }
            })
                .limit(Number(limit))
                .orderBy("user_created_at", sortBy === "asc" ? "asc" : "desc")
                .offset(Number(skip));
            const total = yield this.db("vw_full_job_seeker_profile")
                .withSchema(this.JOB_SEEKER)
                .countDistinct("user_id as total")
                .joinRaw(`LEFT JOIN ?? as ja ON ja.job_seeker_id = vw_full_job_seeker_profile.user_id`, [`${this.DBO_SCHEMA}.${this.TABLES.job_applications}`])
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("user_id", user_id);
                }
                if (name) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("name", `%${name}%`)
                            .orWhere("email", name);
                    });
                }
                if (status) {
                    qb.andWhere("account_status", status);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween("user_created_at", [from_date, to_date]);
                }
                if (application_status &&
                    application_status === constants_1.JOB_APPLICATION_STATUS.COMPLETED) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where("ja.status", constants_1.JOB_APPLICATION_STATUS.COMPLETED)
                            .orWhereNull("ja.job_seeker_id");
                    });
                }
            })
                .first();
            return {
                data,
                total: Number(total === null || total === void 0 ? void 0 : total.total),
            };
        });
    }
    // get single job seeker details
    getJobSeekerDetails(where) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch main profile
            const profile = yield this.db("vw_full_job_seeker_profile")
                .withSchema(this.JOB_SEEKER)
                .select("user_id", "email", "name", "phone_number", "photo", "user_status", "user_type", "user_created_at", "date_of_birth", "gender", "work_permit", "id_copy", "account_status", "city", "state", "country", "is_completed", "completed_at", "final_completed", "final_completed_at", "home_location_id", "home_location_name", "home_address", "home_postal_code", "home_status", "is_home_address", this.db.raw(`
        (SELECT COALESCE(SUM(pl.amount), 0)
         FROM dbo.payment_ledger pl
         WHERE pl.user_id = vw_full_job_seeker_profile.user_id
           AND pl.trx_type = 'In') as total_earnings
      `), this.db.raw(`
        (SELECT COALESCE(SUM(pl.amount), 0)
         FROM dbo.payment_ledger pl
         WHERE pl.user_id = vw_full_job_seeker_profile.user_id
           AND pl.trx_type = 'In'
           AND DATE(pl.created_at) = CURRENT_DATE) as today_earnings
      `), this.db.raw(`
        (SELECT COALESCE(SUM(pr.amount), 0)
         FROM dbo.payout pr
         WHERE pr.job_seeker_id = vw_full_job_seeker_profile.user_id
           AND pr.status = 'Approved') as total_payout
      `), this.db.raw(`
        (SELECT 
           COALESCE(SUM(pl.amount), 0) - 
           COALESCE((SELECT SUM(pr.amount) 
                     FROM dbo.payout pr 
                     WHERE pr.job_seeker_id = vw_full_job_seeker_profile.user_id 
                       AND pr.status = 'Approved'), 0)
         FROM dbo.payment_ledger pl
         WHERE pl.user_id = vw_full_job_seeker_profile.user_id
           AND pl.trx_type = 'In'
        ) as available_balance
      `))
                .where("user_id", where.user_id)
                .first();
            // Fetch applied jobs
            const appliedJobs = yield this.db("job_applications as ja")
                .withSchema(this.DBO_SCHEMA)
                .select("ja.id", "ja.job_post_details_id", "ja.status as application_status", "j.title", "j.details")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("jobs as j", "jpd.job_id", "j.id")
                .where("ja.job_seeker_id", where.user_id);
            // Fetch bank details
            const bankDetails = yield this.db("bank_details")
                .withSchema(this.JOB_SEEKER)
                .select("id", "account_name", "account_number", "bank_code", "created_at", "updated_at")
                .where("job_seeker_id", where.user_id);
            return Object.assign(Object.assign({}, profile), { applied_jobs: appliedJobs !== null && appliedJobs !== void 0 ? appliedJobs : [], bank_details: bankDetails !== null && bankDetails !== void 0 ? bankDetails : [] });
        });
    }
    deleteJobSeeker(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            })
                .del();
        });
    }
    getJobSeekerLocation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = query;
            return yield this.db("job_seeker as js")
                .withSchema(this.JOB_SEEKER)
                .select("js.user_id", "u.type", "u.name", "u.device_id", "js.location_id", "l.latitude", "l.longitude")
                .joinRaw(`LEFT JOIN ?? as l ON l.id = js.location_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.location}`,
            ])
                .joinRaw(`INNER JOIN ?? as u ON u.id = js.user_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .whereNotNull("js.location_id")
                .andWhere("u.type", constants_1.USER_TYPE.JOB_SEEKER)
                .modify((qb) => {
                if (name) {
                    qb.andWhereILike("u.name", `%${name}%`);
                }
            });
        });
    }
}
exports.default = JobSeekerModel;
