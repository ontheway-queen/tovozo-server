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
            const { user_id, title, category_id, city_id, orderBy, orderTo, status, limit, skip, need_total = true, } = params;
            const data = yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jp.organization_id", "jp.title", "j.title as job_category", "jp.hourly_rate", "jp.created_time", "org.name as organization_name", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as u", "u.id", "org.user_id")
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .where((qb) => {
                qb.where("jp.status", status || "Live");
                if (user_id) {
                    qb.andWhere("u.id", user_id);
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
            })
                .orderBy(orderBy || "jp.id", orderTo || "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            let total;
            if (need_total) {
                const totalQuery = yield this.db("job_post as jp")
                    .withSchema(this.DBO_SCHEMA)
                    .count("jpd.id as total")
                    .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                    `${this.HOTELIER}.${this.TABLES.organization}`,
                ])
                    .join("user as u", "u.id", "org.user_id")
                    .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                    .join("jobs as j", "j.id", "jpd.job_id")
                    .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                    .where((qb) => {
                    qb.where("jp.status", status || "Live");
                    if (user_id) {
                        qb.andWhere("u.id", user_id);
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
                })
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : 0;
            }
            return {
                data,
                total,
            };
        });
    }
    getSingleJobPos(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jp.organization_id", "jp.title", "j.title as job_category", "jp.hourly_rate", "jp.created_time", "org.name as organization_name", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as u", "u.id", "org.user_id")
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .where("jpd.id", id)
                .first();
        });
    }
}
exports.default = JobPostModel;
