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
class JobPostModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobPost(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.job_post)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, ["id", "expire_time"]);
        });
    }
    createJobPostDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.job_post_details)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    // for jobseeker
    getJobPostListForJobSeeker(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, user_id, search, category_id, city_id, limit, skip, need_total = true, } = params;
            const DBO_SCHEMA = this.DBO_SCHEMA;
            const baseQuery = this.db("job_post as jp")
                .withSchema(DBO_SCHEMA)
                .select("jp.id", "jpd.id as job_post_detail_id", "jpd.start_time", "jpd.end_time", "jpd.status", "jp.organization_id", "j.title as job_title", "j.details as job_details", "j.job_seeker_pay", "jp.created_time", "org.name as organization_name", "org_p.file as organization_photo", "vwl.location_address", "vwl.city_name", "vwl.longitude", "vwl.latitude")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .leftJoin(this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
                `${this.HOTELIER}.${this.TABLES.organization_photos}`,
            ]))
                .where((qb) => {
                if (category_id)
                    qb.andWhere("j.id", category_id);
                if (city_id)
                    qb.andWhere("vwl.city_id", city_id);
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .whereILike("j.title", `%${search}%`)
                            .orWhereILike("org.name", `%${search}%`);
                    });
                }
                if (from_date)
                    qb.andWhere("jpd.start_time", ">=", from_date);
                if (to_date)
                    qb.andWhere("jpd.start_time", "<=", to_date);
            })
                .andWhere("jpd.status", "Pending")
                .orderBy("jp.created_time", "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            if (user_id) {
                baseQuery.whereNotExists(function () {
                    this.select("*")
                        .from(`${DBO_SCHEMA}.job_applications as ja`)
                        .whereRaw("ja.job_post_id = jp.id")
                        .andWhere("ja.job_seeker_id", user_id);
                });
            }
            const data = yield baseQuery;
            let total = 0;
            if (need_total) {
                const totalQuery = this.db("job_post as jp")
                    .withSchema(this.DBO_SCHEMA)
                    .countDistinct("jp.id as total")
                    .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                    `${this.HOTELIER}.${this.TABLES.organization}`,
                ])
                    .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                    .join("jobs as j", "j.id", "jpd.job_id")
                    .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                    .leftJoin(this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [`${this.HOTELIER}.${this.TABLES.organization_photos}`]))
                    .where((qb) => {
                    if (category_id)
                        qb.andWhere("j.id", category_id);
                    if (city_id)
                        qb.andWhere("vwl.city_id", city_id);
                    if (search) {
                        qb.andWhere((subQb) => {
                            subQb
                                .whereILike("j.title", `%${search}%`)
                                .orWhereILike("org.name", `%${search}%`);
                        });
                    }
                    if (from_date)
                        qb.andWhere("jpd.start_time", ">=", from_date);
                    if (to_date)
                        qb.andWhere("jpd.start_time", "<=", to_date);
                })
                    .andWhere("jpd.status", "Pending");
                if (user_id) {
                    totalQuery.whereNotExists(function () {
                        this.select("*")
                            .from(`${DBO_SCHEMA}.job_applications as ja`)
                            .whereRaw("ja.job_post_id = jp.id")
                            .andWhere("ja.job_seeker_id", user_id);
                    });
                }
                const totalResult = yield totalQuery.first();
                total = (totalResult === null || totalResult === void 0 ? void 0 : totalResult.total) ? Number(totalResult.total) : 0;
            }
            return {
                total,
                data,
            };
        });
    }
    // for jobseeker
    getSingleJobPostForJobSeeker(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`object`, id);
            return yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jp.id as job_post_id", "jpd.start_time", "jpd.end_time", "jpd.status", "jp.organization_id", "j.title as job_title", "j.details as job_details", "j.job_seeker_pay", "jp.created_time", "u.id as hotelier_id", "org.name as organization_name", "org_p.file as organization_photo", "vwl.location_address", "vwl.city_name", "vwl.longitude", "vwl.latitude")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as u", "u.id", "org.user_id")
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .leftJoin(this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
                `${this.HOTELIER}.${this.TABLES.organization_photos}`,
            ]))
                .where("jpd.id", id)
                .first();
        });
    }
    // hotelier job post with job seeker details
    getJobPostListForHotelier(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { organization_id, user_id, title, category_id, city_id, status, limit, skip, need_total = true, } = params;
            const data = yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jpd.status as job_post_details_status", "jpd.start_time", "jpd.end_time", "u.id as hotelier_id", "jp.organization_id", "j.title", "j.hourly_rate", "jp.created_time", this.db.raw(`COUNT(*) OVER (PARTITION BY jpd.job_post_id) AS vacancy`), this.db.raw(`
				CASE
					WHEN ja.job_seeker_id IS NULL AND js.name IS NULL AND js_vwl.longitude IS NULL AND js_vwl.latitude IS NULL THEN NULL
					ELSE json_build_object(
						'job_seeker_id', ja.job_seeker_id,
						'job_seeker_name', js.name,
						'longitude', js_vwl.longitude,
						'latitude', js_vwl.latitude
					)
				END AS job_seeker_details
			`))
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as u", "u.id", "org.user_id")
                .leftJoin("job_applications as ja", "ja.job_post_details_id", "jpd.id")
                .leftJoin("user as js", "js.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
                `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
            ])
                .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "jsu.location_id")
                .where((qb) => {
                if (organization_id)
                    qb.andWhere("jp.organization_id", organization_id);
                if (user_id)
                    qb.andWhere("u.id", user_id);
                if (category_id)
                    qb.andWhere("j.id", category_id);
                if (city_id)
                    qb.andWhere("js_vwl.city_id", city_id);
                if (title)
                    qb.andWhereILike("j.title", `%${title}%`);
                if (status)
                    qb.andWhere("jpd.status", status);
            })
                .whereNot("jpd.status", "Expired")
                .orderByRaw(`
        CASE
          WHEN DATE(jpd.start_time) = CURRENT_DATE AND jpd.end_time >= NOW() THEN 0 
          WHEN jpd.start_time > NOW() THEN 1                                        
          ELSE 2                                                                    
        END,
        jpd.start_time ASC
      `)
                .limit(limit || 100)
                .offset(skip || 0);
            let total;
            if (need_total) {
                const totalQuery = yield this.db("job_post as jp")
                    .withSchema(this.DBO_SCHEMA)
                    .count("jpd.id as total")
                    .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                    .join("jobs as j", "j.id", "jpd.job_id")
                    .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                    `${this.HOTELIER}.${this.TABLES.organization}`,
                ])
                    .join("user as u", "u.id", "org.user_id")
                    .where((qb) => {
                    if (organization_id)
                        qb.andWhere("jp.organization_id", organization_id);
                    if (user_id)
                        qb.andWhere("u.id", user_id);
                    if (category_id)
                        qb.andWhere("j.id", category_id);
                    if (status)
                        qb.andWhere("jpd.status", status);
                    if (title)
                        qb.andWhereILike("j.title", `%${title}%`);
                    if (city_id)
                        qb.andWhere("js_vwl.city_id", city_id);
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
    // get single job post with job seeker details for hotelier
    getSingleJobPostForHotelier(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "j.id as job_id", "jpd.job_post_id", "jpd.status as job_post_details_status", "j.title", "j.details as job_details", "jpd.start_time", "jpd.end_time", "j.hourly_rate", this.db.raw(`(
				SELECT COUNT(*) 
				FROM dbo.job_post_details 
				WHERE job_post_id = jpd.job_post_id
			) AS vacancy`), this.db.raw(`
				CASE
					WHEN ja.id IS NULL AND js.id IS NULL AND js_vwl.longitude IS NULL AND js_vwl.latitude IS NULL THEN NULL
					ELSE json_build_object(
						'application_id', ja.id,
						'application_status', ja.status,
						'job_seeker_id', ja.job_seeker_id,
						'job_seeker_name', js.name,
            'location_address', js_vwl.location_address,
            'city', js_vwl.city_name,
						'longitude', js_vwl.longitude,
						'latitude', js_vwl.latitude,
            'stripe_acc_id', jsu.stripe_acc_id,
            'payment_id', pay.id
					)
				END as job_seeker_details
			`), this.db.raw(`
				CASE 
					WHEN jta.id IS NULL THEN NULL
					ELSE json_build_object(
						'id', jta.id,
						'start_time', jta.start_time,
						'end_time', jta.end_time,
						'total_working_hours', jta.total_working_hours,
						'start_approved_at', jta.start_approved_at,
						'end_approved_at', jta.end_approved_at,
						'tasks', task_list_agg.tasks
					)
				END as job_task_activity
			`))
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("job_applications as ja", "ja.job_post_details_id", "jpd.id")
                .leftJoin("payment as pay", "pay.application_id", "ja.id")
                .leftJoin("user as js", "js.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
                `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
            ])
                .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "jsu.location_id")
                .leftJoin("job_task_activities as jta", "jta.job_application_id", "ja.id")
                .leftJoin(this.db
                .select("jtl.job_task_activity_id", this.db
                .raw(`COALESCE(json_agg(DISTINCT jsonb_build_object(
						'id', jtl.id,
						'message', jtl.message,
						'is_completed', jtl.is_completed,
						'completed_at', jtl.completed_at
					)) FILTER (WHERE jtl.id IS NOT NULL), '[]'::json) as tasks`))
                .from(`${this.DBO_SCHEMA}.job_task_list as jtl`)
                .where("jtl.is_deleted", false)
                .groupBy("jtl.job_task_activity_id")
                .as("task_list_agg"), "task_list_agg.job_task_activity_id", "jta.id")
                .where("jpd.id", id)
                .first();
        });
    }
    // update job post
    updateJobPost(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
    // update job post details
    updateJobPostDetails(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
    // cancel job post
    cancelJobPost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .update({ status: constants_1.JOB_POST_DETAILS_STATUS.Cancelled })
                .where("id", id);
        });
    }
    updateJobPostDetailsStatus(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, status, }) {
            return yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .where("id", id)
                .update({ status });
        });
    }
    // Job List for Admin
    getJobPostListForAdmin(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, search, from_date, to_date } = params;
            const baseQuery = this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jpd.job_post_id", "org.name as organization_name", "org_p.file as organization_photo", "j.title", "jpd.status as job_post_details_status", "jp.created_time", "loc.latitude", "loc.longitude")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .joinRaw(`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`, [`${this.HOTELIER}.${this.TABLES.organization_photos}`])
                .leftJoin("location as loc", "loc.id", "org.location_id")
                .leftJoin("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .leftJoin("jobs as j", "jpd.job_id", "j.id")
                .where(function () {
                if (status) {
                    this.andWhere("jpd.status", status);
                }
                if (search) {
                    this.andWhere((qb) => {
                        qb.whereILike("j.title", `%${search}%`).orWhereILike("org.name", `%${search}%`);
                    });
                }
                if (from_date) {
                    this.andWhere("jp.created_time", ">=", from_date);
                }
                if (to_date) {
                    this.andWhere("jp.created_time", "<=", to_date);
                }
            })
                .orderBy("jp.created_time", "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            const totalQuery = this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .count("jpd.id as total")
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .leftJoin("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .leftJoin("jobs as j", "jpd.job_id", "j.id")
                .where(function () {
                if (status) {
                    this.andWhere("jpd.status", status);
                }
                if (search) {
                    this.andWhere((qb) => {
                        qb.whereILike("j.title", `%${search}%`).orWhereILike("org.name", `%${search}%`);
                    });
                }
                if (from_date) {
                    this.andWhere("jp.created_time", ">=", from_date);
                }
                if (to_date) {
                    this.andWhere("jp.created_time", "<=", to_date);
                }
            })
                .first();
            const [data, totalResult] = yield Promise.all([baseQuery, totalQuery]);
            return {
                data,
                total: Number((totalResult === null || totalResult === void 0 ? void 0 : totalResult.total) || 0),
            };
        });
    }
    getSingleJobPostForAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post as jp")
                .withSchema(this.DBO_SCHEMA)
                .select("jpd.id", "jpd.job_post_id", "jpd.status as job_post_details_status", "jpd.start_time", "jpd.end_time", "jp.organization_id", "j.title", "j.hourly_rate", "j.job_seeker_pay", "j.platform_fee", "j.details as job_details", "org.name as organization_name", "org_p.file as organization_photo", "vwl.location_id", "vwl.location_name", "vwl.location_address", "vwl.city_name", "vwl.state_name", "vwl.country_name", "vwl.longitude", "vwl.latitude", this.db.raw(`(
          SELECT COUNT(*) 
          FROM dbo.job_post_details 
          WHERE job_post_id = jpd.job_post_id
        ) AS vacancy`), this.db.raw(`
          CASE
            WHEN js.id IS NOT NULL THEN json_build_object(
              'application_id', ja.id,
              'application_status', ja.status,
              'job_seeker_id', ja.job_seeker_id,
              'job_seeker_name', js.name,
              'gender', jsu.gender,
              'location_address', js_vwl.location_address,
              'city_name', js_vwl.city_name,
              'state_name', js_vwl.state_name,
              'country_name', js_vwl.country_name,
              'longitude', js_vwl.longitude,
              'latitude', js_vwl.latitude
            )
              ELSE NULL
              END as job_seeker_details`), this.db.raw(`
          CASE 
              WHEN jta.id IS NOT NULL THEN json_build_object(
                  'id', jta.id,
                  'start_time', jta.start_time,
                  'end_time', jta.end_time,
                  'total_working_hours', jta.total_working_hours,
                  'start_approved_at', jta.start_approved_at,
                  'end_approved_at', jta.end_approved_at,
                  'tasks', task_list_agg.tasks
              )
              ELSE NULL
          END as job_task_activity
      `))
                .joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
                `${this.HOTELIER}.${this.TABLES.organization}`,
            ])
                .join("user as u", "u.id", "org.user_id")
                .join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
                .join("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
                .leftJoin("job_applications as ja", "ja.job_post_details_id", "jpd.id")
                .leftJoin("user as js", "js.id", "ja.job_seeker_id")
                .joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
                `${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
            ])
                .leftJoin("vw_location as js_vwl", "js_vwl.location_id", "jsu.location_id")
                .leftJoin("job_task_activities as jta", "jta.job_application_id", "ja.id")
                .leftJoin(this.db
                .select("jtl.job_task_activity_id", this.db
                .raw(`COALESCE(json_agg(DISTINCT jsonb_build_object(
                  'id', jtl.id,
        'message', jtl.message,
        'is_completed', jtl.is_completed,
        'completed_at', jtl.completed_at
      )) FILTER (WHERE jtl.id IS NOT NULL), '[]'::json) as tasks`))
                .from(`${this.DBO_SCHEMA}.job_task_list as jtl`)
                .where("jtl.is_deleted", false)
                .groupBy("jtl.job_task_activity_id")
                .as("task_list_agg"), "task_list_agg.job_task_activity_id", "jta.id")
                .leftJoin(this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
                `${this.HOTELIER}.${this.TABLES.organization_photos}`,
            ]))
                .where("jpd.id", id)
                .first();
        });
    }
    // Get all Job post using job post id
    getAllJobsUsingJobPostId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, status, }) {
            return yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .select("id")
                .where("job_post_id", id)
                .andWhere((qb) => {
                if (status) {
                    qb.andWhere("status", status);
                }
            });
        });
    }
}
exports.default = JobPostModel;
