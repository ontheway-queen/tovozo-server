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
    getSingleTaskActivity(id, job_post_details_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_activities as jta")
                .withSchema(this.DBO_SCHEMA)
                .select("jta.id", "jta.job_application_id", "jta.job_post_details_id", "jta.start_time", "jta.end_time", "jta.approved_at", "ja.status as application_status", "ja.job_seeker_id")
                .leftJoin("job_applications as ja", "ja.job_post_details_id", "jta.job_post_details_id")
                .modify((qb) => {
                if (id) {
                    qb.where("jta.id", id);
                }
                else if (job_post_details_id) {
                    qb.where("jta.job_post_details_id", job_post_details_id);
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
                .update(payload);
        });
    }
}
exports.default = JobTaskActivitiesModel;
