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
class JobTaskListModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create job task list
    createJobTaskList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_list")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, ["id", "message"]);
        });
    }
    // get job task list
    getJobTaskList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_list as jtl")
                .select("jtl.id", "jtl.job_task_activity_id", "jtl.message", "jtl.is_completed", "jtl.completed_at", "js.id as job_seeker_id", "js.name as job_seeker_name", "jtl.created_at", "org.user_id as hotelier_id")
                .withSchema(this.DBO_SCHEMA)
                .join("job_task_activities as jta", "jta.id", "jtl.job_task_activity_id")
                .join("job_applications as ja", "ja.id", "jta.job_application_id")
                .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
                .joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as js", "js.id", "ja.job_seeker_id")
                .where((qb) => {
                qb.where("jtl.is_deleted", false);
                if (query.id) {
                    qb.andWhere("jtl.id", query.id);
                }
                if (query.job_task_activity_id) {
                    qb.andWhere("jtl.job_task_activity_id", query.job_task_activity_id);
                }
            });
        });
    }
    updateJobTaskList(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_list")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .andWhere("is_deleted", false)
                .update(payload, ["id", "is_completed"]);
        });
    }
    deleteJobTaskList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_task_list")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .andWhere("is_deleted", false)
                .update({ is_deleted: true });
        });
    }
}
exports.default = JobTaskListModel;
