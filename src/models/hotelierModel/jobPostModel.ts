import {
	IHoiteleirJob,
	IHoiteleirJobList,
} from "../../features/hotelier/utils/types/hotelierJobPostTypes";
import {
	IJobSeekerJob,
	IJobSeekerJobList,
} from "../../features/jobSeeker/utils/types/jobSeekerJobPostTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { JOB_POST_DETAILS_STATUS } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetJobPostListParams,
	IJobPost,
	IJobPostDetails,
	IJobPostDetailsPayload,
	IJobPostDetailsStatus,
	IJobPostPayload,
} from "../../utils/modelTypes/hotelier/jobPostModelTYpes";

class JobPostModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createJobPost(payload: IJobPostPayload) {
		return await this.db(this.TABLES.job_post)
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async createJobPostDetails(
		payload: IJobPostDetailsPayload | IJobPostDetailsPayload[]
	) {
		return await this.db(this.TABLES.job_post_details)
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	// for jobseeker
	public async getJobPostList(
		params: IGetJobPostListParams
	): Promise<IJobSeekerJobList> {
		const {
			user_id,
			title,
			category_id,
			city_id,
			orderBy,
			orderTo,
			status,
			limit,
			skip,
			need_total = true,
		} = params;
		console.log({ category_id });
		const dataQuery = this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jp.id as job_post_id",
				"jpd.start_time",
				"jpd.end_time",
				"jp.prefer_gender as gender",
				"jpd.status",
				"jp.organization_id",
				"jp.title as job_title",
				"jp.details as job_details",
				"jp.requirements as job_requirements",
				"jp.prefer_gender",
				"j.id as job_category_id",
				"j.title as job_category",
				"jp.hourly_rate",
				"jp.created_time",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name",
				"vwl.longitude",
				"vwl.latitude"
			)
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin(
				this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
					`${this.HOTELIER}.${this.TABLES.organization_photos}`,
				])
			)
			.where((qb) => {
				if (category_id) qb.andWhere("j.id", category_id);
				if (city_id) qb.andWhere("vwl.city_id", city_id);
				if (title) qb.andWhereILike("jp.title", `%${title}%`);
				if (status) qb.andWhere("jpd.status", status);
			});

		// Exclude job_post_id the job seeker already applied for
		if (user_id) {
			const that = this;
			dataQuery.whereNotExists(function () {
				this.select("*")
					.from(`${that.DBO_SCHEMA}.job_applications as ja`)
					.whereRaw("ja.job_post_id = jp.id")
					.andWhere("ja.job_seeker_id", user_id);
			});
		}

		dataQuery
			.orderBy(orderBy || "jp.id", orderTo || "desc")
			.limit(limit || 100)
			.offset(skip || 0);

		const data = await dataQuery;

		let total = 0;
		if (need_total) {
			const totalQuery = this.db("job_post as jp")
				.withSchema(this.DBO_SCHEMA)
				.count("jpd.id as total")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])
				.join("user as u", "u.id", "org.user_id")
				.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
				.join("jobs as j", "j.id", "jpd.job_id")
				.leftJoin(
					"vw_location as vwl",
					"vwl.location_id",
					"org.location_id"
				)
				.where((qb) => {
					if (category_id) qb.andWhere("j.id", category_id);
					if (city_id) qb.andWhere("vwl.city_id", city_id);
					if (title) qb.andWhereILike("jp.title", `%${title}%`);
					if (status) qb.andWhere("jpd.status", status);
				});

			if (user_id) {
				const that = this;
				totalQuery.whereNotExists(function () {
					this.select("*")
						.from(`${that.DBO_SCHEMA}.job_applications as ja`)
						.whereRaw("ja.job_post_id = jp.id")
						.andWhere("ja.job_seeker_id", user_id);
				});
			}

			const totalResult = await totalQuery.first();
			total = totalResult?.total ? Number(totalResult.total) : 0;
		}

		return {
			total,
			data,
		};
	}

	// for jobseeker
	public async getSingleJobPost(id: number): Promise<IJobSeekerJob> {
		return await this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jp.id as job_post_id",
				"jpd.start_time",
				"jpd.end_time",
				"jp.prefer_gender as gender",
				"jpd.status",
				"jp.organization_id",
				"jp.title as job_title",
				"jp.details as job_details",
				"jp.requirements as job_requirements",
				"jp.prefer_gender",
				"j.title as job_category",
				"jp.hourly_rate",
				"jp.created_time",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name",
				"vwl.longitude",
				"vwl.latitude",
				"vwl.longitude",
				"vwl.latitude"
			)
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])

			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin(
				this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
					`${this.HOTELIER}.${this.TABLES.organization_photos}`,
				])
			)
			.where("jpd.id", id)
			.first();
	}

	// hotelier job post with job seeker details
	public async getHotelierJobPostList(
		params: IGetJobPostListParams
	): Promise<IHoiteleirJobList> {
		const {
			organization_id,
			user_id,
			title,
			category_id,
			city_id,
			orderBy,
			orderTo,
			status,
			limit,
			skip,
			need_total = true,
		} = params;
		const data = await this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jpd.status as job_post_details_status",
				"jpd.start_time",
				"jpd.end_time",
				"jp.organization_id",
				"jp.title",
				this.db.raw(`json_build_object(
                    'id', j.id,
                    'title', j.title,
                    'details', j.details,
                    'status', j.status
                ) as job_category`),
				"jp.hourly_rate",
				"jp.created_time",
				"jp.prefer_gender",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name",
				"vwl.longitude",
				"vwl.latitude",
				this.db.raw(
					`COUNT(*) OVER (PARTITION BY jpd.job_post_id) AS vacancy`
				),
				this.db.raw(`json_build_object(
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
                ) as job_seeker_details`),
				this.db.raw(`json_build_object(
                    'id', jta.id,
                    'start_time', jta.start_time,
                    'end_time', jta.end_time,
                    'total_working_hours', jta.total_working_hours,
                    'approved_at', jta.approved_at
                ) as job_task_activity`)
			)
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin(
				"job_applications as ja",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("user as js", "js.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
				`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
			])
			.leftJoin(
				"vw_location as js_vwl",
				"js_vwl.location_id",
				"jsu.location_id"
			)
			.leftJoin(
				"job_task_activities as jta",
				"jta.job_application_id",
				"ja.id"
			)
			.leftJoin(
				this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
					`${this.HOTELIER}.${this.TABLES.organization_photos}`,
				])
			)
			.where((qb) => {
				if (organization_id) {
					qb.andWhere("jp.organization_id", organization_id);
				}
				if (user_id) {
					qb.andWhere("u.id", user_id);
				}
				if (category_id) {
					qb.andWhere("j.id", category_id);
				}
				if (city_id) {
					qb.andWhere("vwl.city_id", city_id);
				}
				if (title) {
					qb.andWhereILike("jp.title", `%${title}%`);
				}
				if (status) {
					qb.andWhere("jpd.status", status);
				}
			})
			.orderByRaw(
				`CASE 
                    WHEN jpd.start_time <= NOW() AND jpd.end_time >= NOW() THEN 0
                    WHEN jpd.start_time > NOW() THEN 1                            
                    WHEN jpd.end_time < NOW() THEN 2                                
                    ELSE 3
                END,
                jpd.start_time ASC`
			)
			.limit(limit || 100)
			.offset(skip || 0);

		let total;
		if (need_total) {
			const totalQuery = await this.db("job_post as jp")
				.withSchema(this.DBO_SCHEMA)
				.count("jpd.id as total")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])
				.join("user as u", "u.id", "org.user_id")
				.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
				.join("jobs as j", "j.id", "jpd.job_id")
				.leftJoin(
					"vw_location as vwl",
					"vwl.location_id",
					"org.location_id"
				)
				.leftJoin(
					"job_applications as ja",
					"ja.job_post_details_id",
					"jpd.id"
				)
				.leftJoin("user as js", "js.id", "ja.job_seeker_id")
				.joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
					`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
				])
				.leftJoin(
					"vw_location as js_vwl",
					"js_vwl.location_id",
					"jsu.location_id"
				)
				.where((qb) => {
					if (organization_id) {
						qb.andWhere("jp.organization_id", organization_id);
					}
					if (user_id) {
						qb.andWhere("u.id", user_id);
					}
					if (category_id) {
						qb.andWhere("j.id", category_id);
					}
					if (city_id) {
						qb.andWhere("vwl.city_id", city_id);
					}
					if (title) {
						qb.andWhereILike("jp.title", `%${title}%`);
					}
					if (status) {
						qb.andWhere("jpd.status", status);
					}
				})
				.first();
			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}

		return {
			data,
			total,
		};
	}

	// get single job post with job seeker details for hotelier
	public async getSingleJobPostWithJobSeekerDetails(
		id: number
	): Promise<IHoiteleirJob> {
		return await this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jpd.job_post_id",
				"jpd.status as job_post_details_status",
				"jpd.start_time",
				"jpd.end_time",
				"jp.organization_id",
				"jp.title",
				this.db.raw(`json_build_object(
                    'id', j.id,
                    'title', j.title,
                    'details', j.details,
                    'status', j.status
                ) as job_category`),
				"jp.hourly_rate",
				"jp.title as job_title",
				"jp.details as job_details",
				"jp.requirements as job_requirements",
				"jp.prefer_gender",
				"jp.created_time",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name",
				"vwl.longitude",
				"vwl.latitude",
				this.db.raw(`(
                    SELECT COUNT(*) 
                    FROM dbo.job_post_details 
                    WHERE job_post_id = jpd.job_post_id
                ) AS vacancy`),
				this.db.raw(`json_build_object(
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
                ) as job_seeker_details`),
				this.db.raw(`json_build_object(
                    'id', jta.id,
                    'start_time', jta.start_time,
                    'end_time', jta.end_time,
                    'total_working_hours', jta.total_working_hours,
                    'approved_at', jta.approved_at
                ) as job_task_activity`)
			)
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin(
				"job_applications as ja",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("user as js", "js.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? as jsu ON jsu.user_id = js.id`, [
				`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
			])
			.leftJoin(
				"vw_location as js_vwl",
				"js_vwl.location_id",
				"jsu.location_id"
			)
			.leftJoin(
				"job_task_activities as jta",
				"jta.job_application_id",
				"ja.id"
			)
			.leftJoin(
				this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
					`${this.HOTELIER}.${this.TABLES.organization_photos}`,
				])
			)
			.where("jpd.id", id)
			.first();
	}

	// update job post
	public async updateJobPost(id: number, payload: IJobPost) {
		return await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.update(payload)
			.where("id", id);
	}

	// update job post details
	public async updateJobPostDetails(id: number, payload: IJobPostDetails) {
		return await this.db("job_post_details")
			.withSchema(this.DBO_SCHEMA)
			.update(payload)
			.where("id", id);
	}

	// cancel job post
	public async cancelJobPost(id: number) {
		return await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.update({ status: JOB_POST_DETAILS_STATUS.Cancelled })
			.where("id", id);
	}

	public async updateJobPostDetailsStatus(
		id: number,
		status: IJobPostDetailsStatus
	) {
		return await this.db("job_post_details")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update({ status });
	}
}

export default JobPostModel;
