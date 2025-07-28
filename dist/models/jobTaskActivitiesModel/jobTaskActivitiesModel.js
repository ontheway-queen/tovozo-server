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
class JobTaskActivitiesModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // job seeker
    createJobTaskActivity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_activities")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleTaskActivity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, job_post_details_id, hotelier_id, }) {
            return yield this.db("job_task_activities as jta")
                .withSchema(this.DBO_SCHEMA)
                .select("jta.id", "jta.job_application_id", "jta.job_post_details_id", "jta.start_time", "jta.end_time", "jta.start_approved_at", "jta.end_approved_at", "ja.status as application_status", "ja.job_seeker_id", "u.name as job_seeker_name")
                .leftJoin("job_applications as ja", "ja.job_post_details_id", "jta.job_post_details_id")
                .join("user as u", "u.id", "ja.job_seeker_id")
                .join("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .join("job_post as jp", "jp.id", "jpd.job_post_id")
                .modify((qb) => {
                qb.where("jta.is_deleted", false);
                if (id) {
                    qb.andWhere("jta.id", id);
                }
                if (job_post_details_id) {
                    qb.andWhere("jta.job_post_details_id", job_post_details_id);
                }
                if (hotelier_id) {
                    qb.andWhere("jp.organization_id", hotelier_id);
                }
            })
                .first();
        });
    }
    updateJobTaskActivity(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_activities")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .update(payload, "id");
        });
    }
}
exports.default = JobTaskActivitiesModel;
