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
class CancellationLogModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get job post reports list
    getJobPostCancellationLogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, report_type, status, limit, skip, need_total = true, searchQuery, } = query;
            const baseQuery = this.db("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "cr.related_id as related_job_post_details", "cr.report_type", "cr.status", "u.name as reporter_name", "j.id as job_id", "j.title", "j.details", "j.status as job_status", "cr.created_at as reported_at", this.db.raw(`json_build_object(
          'start_time', jpd.start_time,
          'end_time', jpd.end_time
        ) as job_post_details`))
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                .leftJoin("jobs as j", "jpd.job_id", "j.id")
                .where((qb) => {
                if (user_id)
                    qb.andWhere("cr.reporter_id", user_id);
                if (report_type)
                    qb.andWhere("cr.report_type", report_type);
                if (status)
                    qb.andWhere("cr.status", status);
                if (searchQuery)
                    qb.andWhereILike("j.title", `%${searchQuery}%`);
            })
                .limit(limit || 100)
                .offset(skip || 0);
            const data = yield baseQuery;
            let total;
            if (need_total) {
                const totalResult = yield this.db("cancellation_logs as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as total")
                    .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                    .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                    .leftJoin("jobs as j", "jpd.job_id", "j.id")
                    .where((qb) => {
                    if (user_id)
                        qb.andWhere("cr.reporter_id", user_id);
                    if (report_type)
                        qb.andWhere("cr.report_type", report_type);
                    if (status)
                        qb.andWhere("cr.status", status);
                    if (searchQuery)
                        qb.andWhereILike("j.title", `%${searchQuery}%`);
                })
                    .first();
                total = (totalResult === null || totalResult === void 0 ? void 0 : totalResult.total) ? Number(totalResult.total) : 0;
            }
            return { data, total };
        });
    }
    getSingleJobPostCancellationLog(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, report_type, related_id, }) {
            return yield this.db("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "u.name as reporter_name", "u.phone_number as reporter_phone_number", "cr.report_type", "cr.status", "cr.reason as cancellation_reason", "cr.reject_reason", "cr.related_id", "cr.related_id as related_job_post_details", this.db.raw(`json_build_object(
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`), this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as job_post`), "cr.created_at as reported_at")
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                .leftJoin("jobs as category", "jpd.job_id", "category.id")
                .where("cr.report_type", report_type)
                .modify((qb) => {
                if (id) {
                    qb.andWhere("cr.id", id);
                }
                if (related_id) {
                    qb.andWhere("cr.related_id", related_id);
                }
            })
                .first();
        });
    }
    // JOB APPLICATION REPORTS
    getJobApplicationCancellationLogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, report_type, status, limit, skip, need_total = true, searchQuery, } = query;
            const data = yield this.db("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "u.name as reporter_name", "u.phone_number as reporter_phone_number", "cr.report_type", "cr.status", "cr.reason as cancellation_reason", "cr.reject_reason", "j.title", "j.details", "j.hourly_rate", "j.job_seeker_pay", "j.platform_fee")
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("cr.reporter_id", user_id);
                }
                if (searchQuery) {
                    qb.andWhereILike("j.title", `%${searchQuery}%`);
                }
                if (report_type) {
                    qb.andWhere("cr.report_type", report_type);
                }
                if (status) {
                    qb.andWhere("cr.status", status);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0);
            let total;
            if (need_total) {
                const totalQuery = yield this.db("cancellation_logs as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as total")
                    .leftJoin("user as u", "u.id", "cr.reporter_id")
                    .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                    .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                    .leftJoin("jobs as j", "j.id", "jpd.job_id")
                    .where((qb) => {
                    if (user_id) {
                        qb.andWhere("cr.reporter_id", user_id);
                    }
                    if (searchQuery) {
                        qb.andWhereILike("j.title", `%${searchQuery}%`);
                    }
                    if (report_type) {
                        qb.andWhere("cr.report_type", report_type);
                    }
                    if (status) {
                        qb.andWhere("cr.status", status);
                    }
                })
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : 0;
            }
            return { data, total };
        });
    }
    getSingleJobApplicationCancellationLog(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, report_type, related_id, reporter_id, }) {
            return yield this.db("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "u.name as reporter_name", "u.phone_number as reporter_phone_number", "cr.report_type", "cr.status", "cr.reason as cancellation_reason", "cr.reject_reason", "cr.reporter_id", "cr.related_id", this.db.raw(`json_build_object(
				    'id', jp.id,
				    'title', j.title,
				    'details', j.details
				) as job_post`))
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .where("cr.report_type", report_type)
                .modify((qb) => {
                if (id) {
                    qb.andWhere("cr.id", id);
                }
                if (related_id) {
                    qb.andWhere("cr.related_id", related_id);
                }
                if (reporter_id) {
                    qb.andWhere("cr.reporter_id", reporter_id);
                }
            })
                .first();
        });
    }
    requestForCancellationLog(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_logs")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleCancellationLogWithRelatedId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_logs")
                .withSchema(this.DBO_SCHEMA)
                .where("related_id", id)
                .andWhere("status", constants_1.CANCELLATION_REPORT_STATUS.PENDING)
                .first();
        });
    }
    updateCancellationLogStatus(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_logs")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .update(payload);
        });
    }
    // Get cancellation logs for admin
    getCancellationLogsForAdmin(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, limit = 100, skip = 0, need_total = true, name, report_type, from_date, to_date, } = query;
            const jobPostQuery = this.db
                .select("cr.id", "j.title", "u.name as reporter_name", "cr.report_type", "cr.status")
                .from("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .where("cr.report_type", "CANCEL_JOB_POST");
            const jobApplicationQuery = this.db
                .select("cr.id", "j.title", "u.name as reporter_name", "cr.report_type", "cr.status")
                .from("cancellation_logs as cr")
                .withSchema(this.DBO_SCHEMA)
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                .leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
                .leftJoin("jobs as j", "jpd.job_id", "j.id")
                .where("cr.report_type", "CANCEL_APPLICATION");
            console.log({ jobPostQuery, jobApplicationQuery });
            const applyFilters = (qb) => {
                if (status)
                    qb.andWhere("cr.status", status);
                if (report_type)
                    qb.andWhere("cr.report_type", report_type);
                if (name) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("j.title", `%${name}%`)
                            .orWhereILike("u.name", `%${name}%`);
                    });
                }
                if (from_date) {
                    qb.andWhere("cr.created_at", ">=", from_date);
                }
                if (to_date) {
                    qb.andWhere("cr.created_at", "<=", to_date);
                }
            };
            applyFilters(jobPostQuery);
            applyFilters(jobApplicationQuery);
            const unioned = this.db
                .from((qb) => {
                qb.unionAll([jobPostQuery, jobApplicationQuery], true).as("combined");
            })
                .select("*")
                .limit(limit)
                .offset(skip);
            const data = yield unioned;
            let total = undefined;
            if (need_total) {
                const jobPostTotal = this.db("cancellation_logs as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as count")
                    .leftJoin("user as u", "u.id", "cr.reporter_id")
                    .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                    .leftJoin("jobs as j", "jpd.job_id", "j.id")
                    .where("cr.report_type", "CANCEL_JOB_POST");
                const jobAppTotal = this.db("cancellation_logs as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as count")
                    .leftJoin("user as u", "u.id", "cr.reporter_id")
                    .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                    .leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
                    .leftJoin("jobs as j", "jpd.job_id", "j.id")
                    .where("cr.report_type", "CANCEL_APPLICATION");
                applyFilters(jobPostTotal);
                applyFilters(jobAppTotal);
                const [jobPostCount, jobAppCount] = yield Promise.all([
                    jobPostTotal.first(),
                    jobAppTotal.first(),
                ]);
                total =
                    Number((jobPostCount === null || jobPostCount === void 0 ? void 0 : jobPostCount.count) || 0) + Number((jobAppCount === null || jobAppCount === void 0 ? void 0 : jobAppCount.count) || 0);
            }
            return { data, total };
        });
    }
}
exports.default = CancellationLogModel;
