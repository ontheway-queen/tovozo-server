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
class JobApplicationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobApplication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_applications")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    markJobPostDetailAsApplied(job_post_detail_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .update({ status: "Applied" })
                .where({ id: job_post_detail_id });
        });
    }
    getMyJobApplications(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id: job_seeker_id, orderBy, orderTo, status, limit, skip, need_total = true, } = params;
            const data = yield this.db("job_applications as ja")
                .withSchema(this.DBO_SCHEMA)
                .select("ja.id as job_application_id", "ja.job_post_details_id", "ja.status as job_application_status", "ja.created_at as applied_at", "jpd.id as job_post_details_id", "jpd.status as job_post_details_status", "jpd.job_post_id", "jpd.start_time", "jpd.end_time", "jpd.status as job_post_details_status", "jp.id as job_post_id", "jp.title as job_post_title", "org.id as organization_id", "org.name as organization_name", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name")
                .leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
                .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .where("ja.job_seeker_id", job_seeker_id)
                .modify((qb) => {
                if (status) {
                    qb.andWhere("ja.status", status);
                }
            })
                .orderBy(orderBy || "ja.created_at", orderTo || "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            let total;
            if (need_total) {
                const totalQuery = yield this.db("job_applications as ja")
                    .withSchema(this.DBO_SCHEMA)
                    .count("ja.id as total")
                    .where("ja.job_seeker_id", job_seeker_id)
                    .modify((qb) => {
                    if (status) {
                        qb.andWhere("ja.status", status);
                    }
                })
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : 0;
            }
            return { data, total };
        });
    }
    getMyJobApplication(_a) {
        return __awaiter(this, arguments, void 0, function* ({ job_application_id, job_seeker_id, }) {
            const data = yield this.db("job_applications as ja")
                .withSchema(this.DBO_SCHEMA)
                .select("ja.id as job_application_id", "ja.job_post_details_id", "ja.status as job_application_status", "ja.created_at as applied_at", "jpd.id as job_post_details_id", "jpd.status as job_post_details_status", "jpd.job_post_id", "jpd.start_time", "jpd.end_time", "jpd.status as job_post_details_status", "jp.id as job_post_id", "jp.title as job_post_title", "org.id as organization_id", "org.name as organization_name", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name")
                .leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
                .leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .where({
                "ja.id": job_application_id,
                "ja.job_seeker_id": job_seeker_id,
            })
                .first();
            return data;
        });
    }
    cancelMyJobApplication(application_id, job_seeker_id) {
        return this.db("job_applications")
            .withSchema(this.DBO_SCHEMA)
            .update({ status: constants_1.JOB_POST_DETAILS_STATUS.CANCELLED })
            .where({
            id: application_id,
            job_seeker_id: job_seeker_id,
        });
    }
}
exports.default = JobApplicationModel;
