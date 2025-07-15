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
class ReportModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    submitReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reports")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleReport(job_post_details_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reports")
                .withSchema(this.DBO_SCHEMA)
                .where((qb) => {
                if (id) {
                    qb.where("id", id);
                }
                else if (job_post_details_id) {
                    qb.where("job_post_details_id", job_post_details_id);
                }
            })
                .first();
        });
    }
    getReportsWithInfo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, type, need_total = true, limit, skip, searchQuery, report_status, } = query;
            console.log({ type });
            const data = yield this.db("reports as rp")
                .withSchema(this.DBO_SCHEMA)
                .select("rp.id", "rp.status as report_status", "rp.report_type", "rp.reason as report_reason", "jp.id as job_post_id", "jp.title", "jp.details", "jp.requirements", "jp.prefer_gender", "jp.hourly_rate", "jp.expire_time", "jpd.id as job_post_details_id", "jpd.start_time", "jpd.end_time", "jpd.status as job_post_details_status", "org.id as organization_id", "org.name as organization_name", "org_p.file as organization_photo", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name", "vwl.longitude", "vwl.latitude", this.db.raw(`json_build_object(
				    'application_id', ja.id,
				    'application_status', ja.status,
				    'job_seeker_id', ja.job_seeker_id,
				    'job_seeker_name', jsu.name,
				    'gender', js.gender,
				    'location_address', js_vwl.location_address,
				    'city_name', js_vwl.city_name,
				    'state_name', js_vwl.state_name,
				    'country_name', js_vwl.country_name,
				    'longitude', js_vwl.longitude,
				    'latitude', js_vwl.latitude
				) as job_seeker_details`), this.db.raw(`json_build_object(
				    'id', jta.id,
				    'start_time', jta.start_time,
				    'end_time', jta.end_time,
				    'total_working_hours', jta.total_working_hours,
				    'approved_at', jta.approved_at
				) as job_task_activity`))
                .leftJoin("job_post_details as jpd", "jpd.id", "rp.job_post_details_id")
                .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .joinRaw(`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`, [`${this.HOTELIER}.${this.TABLES.organization_photos}`])
                .leftJoin("job_applications as ja", "ja.id", "rp.related_id")
                .leftJoin("user as u", function () {
                if (type && type === constants_1.REPORT_TYPE.JobPost) {
                    this.on("u.id", "=", "ja.job_seeker_id");
                }
                else {
                    this.on("u.id", "=", "org.user_id");
                }
            })
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
                `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
            ])
                .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "js.location_id")
                .leftJoin("job_task_activities as jta", "jta.job_application_id", "ja.id")
                .where((qb) => {
                if (user_id) {
                    console.log(user_id);
                    qb.andWhere("u.id", user_id);
                }
                if (type) {
                    qb.andWhere("rp.report_type", type);
                }
                if (searchQuery) {
                    qb.andWhereILike("jp.title", `%${searchQuery}%`);
                }
                if (report_status) {
                    qb.andWhere("rp.status", report_status);
                }
            })
                .limit(Number(limit) || 100)
                .offset(Number(skip) || 0);
            let total;
            if (need_total) {
                const totalQuery = yield this.db("reports as rp")
                    .withSchema(this.DBO_SCHEMA)
                    .count("rp.id as total")
                    .leftJoin("job_post_details as jpd", "jpd.id", "rp.job_post_details_id")
                    .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                    .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                    `${this.HOTELIER}.${this.TABLES.organization}`,
                ])
                    .joinRaw(`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`, [`${this.HOTELIER}.${this.TABLES.organization_photos}`])
                    .leftJoin("job_applications as ja", "ja.id", "rp.related_id")
                    .leftJoin("user as u", function () {
                    if (type && type === constants_1.REPORT_TYPE.JobPost) {
                        this.on("u.id", "=", "ja.job_seeker_id");
                    }
                    else {
                        this.on("u.id", "=", "org.user_id");
                    }
                })
                    .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                    .leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
                    .joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
                    `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
                ])
                    .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "js.location_id")
                    .leftJoin("job_task_activities as jta", "jta.job_application_id", "ja.id")
                    .where((qb) => {
                    if (user_id) {
                        qb.andWhere("u.id", user_id);
                    }
                    if (type) {
                        qb.andWhere("rp.report_type", type);
                    }
                    if (searchQuery) {
                        qb.andWhereILike("jp.title", `%${searchQuery}%`);
                    }
                    if (report_status) {
                        qb.andWhere("rp.status", report_status);
                    }
                })
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : 0;
            }
            return { data, total };
        });
    }
    getSingleReportWithInfo(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reports as rp")
                .withSchema(this.DBO_SCHEMA)
                .select("rp.id", "rp.status as report_status", "rp.report_type", "rp.reason as report_reason", "jp.id as job_post_id", "jp.title", "jp.details", "jp.requirements", "jp.prefer_gender", "jp.hourly_rate", "jp.expire_time", "jpd.id as job_post_details_id", "jpd.start_time", "jpd.end_time", "jpd.status as job_post_details_status", "org.id as organization_id", "org.name as organization_name", "org_p.file as organization_photo", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name", "vwl.longitude", "vwl.latitude", this.db.raw(`json_build_object(
                    'application_id', ja.id,
                    'application_status', ja.status,
                    
                    'job_seeker_id', ja.job_seeker_id,
                    'job_seeker_name', jsu.name,
                    'gender', js.gender,
                    
                    'location_address', js_vwl.location_address,
                    'city_name', js_vwl.city_name,
                    'state_name', js_vwl.state_name,
                    'country_name', js_vwl.country_name,
                    'longitude', js_vwl.longitude,
                    'latitude', js_vwl.latitude
                ) as job_seeker_details`), this.db.raw(`json_build_object(
                    'id', jta.id,
                    'start_time', jta.start_time,
                    'end_time', jta.end_time,
                    'total_working_hours', jta.total_working_hours,
                    'approved_at', jta.approved_at
                ) as job_task_activity`))
                .leftJoin("job_post_details as jpd", "jpd.id", "rp.job_post_details_id")
                .leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .joinRaw(`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`, [`${this.HOTELIER}.${this.TABLES.organization_photos}`])
                .leftJoin("job_applications as ja", "ja.id", "rp.related_id")
                .leftJoin("user as u", function () {
                if (type && type === constants_1.REPORT_TYPE.JobPost) {
                    this.on("u.id", "=", "ja.job_seeker_id");
                }
                else {
                    this.on("u.id", "=", "org.user_id");
                }
            })
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
                `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
            ])
                .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "js.location_id")
                .leftJoin("job_task_activities as jta", "jta.job_application_id", "ja.id")
                .where("rp.id", id)
                .modify((qb) => {
                if (type) {
                    qb.andWhere("rp.report_type", type);
                }
            })
                .first();
        });
    }
    reportMarkAsAcknowledge(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reports")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .update(payload);
        });
    }
}
exports.default = ReportModel;
