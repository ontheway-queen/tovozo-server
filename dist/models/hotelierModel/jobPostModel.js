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
class JobPostModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobPost(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.job_post)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    createJobPostDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.job_post_details)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getJobPostList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, title, category_id, city_id, limit, skip } = params;
            const data = yield this.db(this.TABLES.job_post)
                .withSchema(this.DBO_SCHEMA)
                .select("jp.id", "jp.organization_id", "jp.title", "j.title as job_category", "jp.hourly_rate", "jp.created_time", "org.name as organization_name", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name")
                .joinRaw(`join ${this.HOTELIER}.${this.TABLES.organization} as org`)
                .join(this.TABLES.user, "u.id", "org.user_id")
                .join(this.TABLES.jobs, "j.id", "jp.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .where((qb) => {
                if (user_id) {
                    qb.andWhere("u.user_id", user_id);
                }
                if (category_id) {
                    qb.andWhere("j.job_id", category_id);
                }
                if (city_id) {
                    qb.andWhere("vwl.city_id", city_id);
                }
                if (title) {
                    qb.andWhereILike("jp.title", `%${title}%`);
                }
            });
        });
    }
}
exports.default = JobPostModel;
