import { TDB } from "../../features/public/utils/types/publicCommon.types";
import {
	REPORT_STATUS,
	REPORT_TYPE,
} from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetReportsWithInfoQuery,
	IGetSingleReport,
	IReport,
	IReportAcknowledge,
	IReportStatus,
	IReportType,
	ISubmitReportPayload,
} from "../../utils/modelTypes/report/reportModel.types";

export default class ReportModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async submitReport(payload: ISubmitReportPayload) {
		return await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleReport(
		job_post_details_id?: number | null,
		id?: number | null
	): Promise<IGetSingleReport> {
		return await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.where((qb) => {
				if (id) {
					qb.where("id", id);
				} else if (job_post_details_id) {
					qb.where("job_post_details_id", job_post_details_id);
				}
			})
			.first();
	}

	public async getReportsWithInfo(
		query: IGetReportsWithInfoQuery
	): Promise<{ data: IReportStatus[]; total?: number }> {
		const {
			user_id,
			type,
			need_total = true,
			limit,
			skip,
			searchQuery,
			report_status,
		} = query;
		console.log({ type });
		const data = await this.db("reports as rp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"rp.id",
				"rp.status as report_status",
				"rp.report_type",
				"rp.reason as report_reason",
				"jp.id as job_post_id",
				"jp.title",
				"jp.details",
				"jp.requirements",
				"jp.prefer_gender",
				"jp.hourly_rate",
				"jp.expire_time",
				"jpd.id as job_post_details_id",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.status as job_post_details_status",
				"org.id as organization_id",
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
				this.db.raw(`json_build_object(
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
				) as job_seeker_details`),
				this.db.raw(`json_build_object(
				    'id', jta.id,
				    'start_time', jta.start_time,
				    'end_time', jta.end_time,
				    'total_working_hours', jta.total_working_hours,
				    'approved_at', jta.approved_at
				) as job_task_activity`)
			)
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"rp.job_post_details_id"
			)
			.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.joinRaw(
				`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`,
				[`${this.HOTELIER}.${this.TABLES.organization_photos}`]
			)
			.leftJoin("job_applications as ja", "ja.id", "rp.related_id")
			.leftJoin("user as u", function () {
				if (type && type === REPORT_TYPE.JobPost) {
					this.on("u.id", "=", "ja.job_seeker_id");
				} else {
					this.on("u.id", "=", "org.user_id");
				}
			})
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
				`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
			])
			.leftJoin(
				"vw_location as js_vwl",
				"js_vwl.location_id",
				"js.location_id"
			)
			.leftJoin(
				"job_task_activities as jta",
				"jta.job_application_id",
				"ja.id"
			)
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
			const totalQuery = await this.db("reports as rp")
				.withSchema(this.DBO_SCHEMA)
				.count("rp.id as total")
				.leftJoin(
					"job_post_details as jpd",
					"jpd.id",
					"rp.job_post_details_id"
				)
				.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])
				.joinRaw(
					`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`,
					[`${this.HOTELIER}.${this.TABLES.organization_photos}`]
				)
				.leftJoin("job_applications as ja", "ja.id", "rp.related_id")
				.leftJoin("user as u", function () {
					if (type && type === REPORT_TYPE.JobPost) {
						this.on("u.id", "=", "ja.job_seeker_id");
					} else {
						this.on("u.id", "=", "org.user_id");
					}
				})
				.leftJoin(
					"vw_location as vwl",
					"vwl.location_id",
					"org.location_id"
				)
				.leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
				.joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
					`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
				])
				.leftJoin(
					"vw_location as js_vwl",
					"js_vwl.location_id",
					"js.location_id"
				)
				.leftJoin(
					"job_task_activities as jta",
					"jta.job_application_id",
					"ja.id"
				)
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
			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}

		return { data, total };
	}

	public async getSingleReportWithInfo(
		id: number,
		type?: IReportType
	): Promise<IReport> {
		return await this.db("reports as rp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"rp.id",
				"rp.status as report_status",
				"rp.report_type",
				"rp.reason as report_reason",
				"jp.id as job_post_id",
				"jp.title",
				"jp.details",
				"jp.requirements",
				"jp.prefer_gender",
				"jp.hourly_rate",
				"jp.expire_time",
				"jpd.id as job_post_details_id",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.status as job_post_details_status",
				"org.id as organization_id",
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
				this.db.raw(`json_build_object(
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
                ) as job_seeker_details`),
				this.db.raw(`json_build_object(
                    'id', jta.id,
                    'start_time', jta.start_time,
                    'end_time', jta.end_time,
                    'total_working_hours', jta.total_working_hours,
                    'approved_at', jta.approved_at
                ) as job_task_activity`)
			)
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"rp.job_post_details_id"
			)
			.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.joinRaw(
				`LEFT JOIN ?? as org_p ON org_p.organization_id = org.id`,
				[`${this.HOTELIER}.${this.TABLES.organization_photos}`]
			)
			.leftJoin("job_applications as ja", "ja.id", "rp.related_id")
			.leftJoin("user as u", function () {
				if (type && type === REPORT_TYPE.JobPost) {
					this.on("u.id", "=", "ja.job_seeker_id");
				} else {
					this.on("u.id", "=", "org.user_id");
				}
			})
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? as js ON js.user_id = jsu.id`, [
				`${this.JOB_SEEKER}.${this.TABLES.job_seeker}`,
			])
			.leftJoin(
				"vw_location as js_vwl",
				"js_vwl.location_id",
				"js.location_id"
			)
			.leftJoin(
				"job_task_activities as jta",
				"jta.job_application_id",
				"ja.id"
			)
			.where("rp.id", id)
			.modify((qb) => {
				if (type) {
					qb.andWhere("rp.report_type", type);
				}
			})
			.first();
	}

	public async reportMarkAsAcknowledge(
		id: number,
		payload: IReportAcknowledge
	) {
		return await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update(payload);
	}
}
