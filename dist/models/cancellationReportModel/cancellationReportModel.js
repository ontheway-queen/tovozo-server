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
class CancellationReportModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get job post reports list
    getJobPostReports(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, report_type, status, limit, skip, need_total = true, search_text, } = query;
            const data = yield this.db("cancellation_reports as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "cr.related_id as related_job_post_details", "cr.report_type", "cr.status", "u.name as reporter_name", this.db.raw(`json_build_object(
                    'title', jp.title,
                    'details', jp.details,
                    'requirements',jp.requirements,
                    'prefer_gender', jp.prefer_gender,
                    'hourly_rate', jp.hourly_rate,
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`), this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as category`), "cr.created_at as reported_at")
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                .leftJoin("jobs as category", "jpd.job_id", "category.id")
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("cr.reporter_id", user_id);
                }
                if (search_text) {
                    qb.andWhereILike("jp.title", `%${search_text}%`);
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
                const totalQuery = yield this.db("cancellation_reports as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as total")
                    .leftJoin("user as u", "u.id", "cr.reporter_id")
                    .leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
                    .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                    .leftJoin("jobs as category", "jpd.job_id", "category.id")
                    .where((qb) => {
                    if (user_id) {
                        qb.andWhere("cr.reporter_id", user_id);
                    }
                    if (search_text) {
                        qb.andWhereILike("jp.title", `%${search_text}%`);
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
    getSingleJobPostReport(id, report_type, related_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_reports as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "cr.related_id as related_job_post_details", "cr.report_type", "cr.status", "u.name as reporter_name", this.db.raw(`json_build_object(
                    'title', jp.title,
                    'details', jp.details,
                    'requirements',jp.requirements,
                    'prefer_gender', jp.prefer_gender,
                    'hourly_rate', jp.hourly_rate,
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`), this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as category`), "cr.created_at as reported_at")
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
    getJobApplicationReports(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, report_type, status, limit, skip, need_total = true, search_text, } = query;
            const data = yield this.db("cancellation_reports as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "u.name as reporter_name", "u.phone_number as reporter_phone_number", "cr.report_type", "cr.status", "cr.reason as cancellation_reason", "cr.reject_reason", this.db.raw(`json_build_object(
                    'id', jp.id,
                    'title', jp.title,
                    'details', jp.details,
                    'requirements', jp.requirements
                ) as job_post`))
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("cr.reporter_id", user_id);
                }
                if (search_text) {
                    qb.andWhereILike("jp.title", `%${search_text}%`);
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
                const totalQuery = yield this.db("cancellation_reports as cr")
                    .withSchema(this.DBO_SCHEMA)
                    .count("cr.id as total")
                    .leftJoin("user as u", "u.id", "cr.reporter_id")
                    .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                    .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                    .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                    .where((qb) => {
                    if (user_id) {
                        qb.andWhere("cr.reporter_id", user_id);
                    }
                    if (search_text) {
                        qb.andWhereILike("jp.title", `%${search_text}%`);
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
    getSingleJobApplicationReport(id, report_type, related_id, reporter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_reports as cr")
                .withSchema(this.DBO_SCHEMA)
                .select("cr.id", "u.name as reporter_name", "u.phone_number as reporter_phone_number", "cr.report_type", "cr.status", "cr.reason as cancellation_reason", "cr.reject_reason", "cr.reporter_id", "cr.related_id", this.db.raw(`json_build_object(
				    'id', jp.id,
				    'title', jp.title,
				    'details', jp.details,
				    'requirements', jp.requirements
				) as job_post`))
                .leftJoin("user as u", "u.id", "cr.reporter_id")
                .leftJoin("job_applications as ja", "cr.related_id", "ja.id")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
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
    requestForCancellationReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_reports")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleReportWithRelatedId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_reports")
                .withSchema(this.DBO_SCHEMA)
                .where("related_id", id)
                .first();
        });
    }
    updateCancellationReportStatus(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_reports")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .update(payload);
        });
    }
}
exports.default = CancellationReportModel;
