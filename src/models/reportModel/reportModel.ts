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

	public async getJobSeekersReports(query: IGetReportsWithInfoQuery) {
		const {
			type,
			need_total = true,
			limit = 100,
			skip = 0,
			searchQuery,
			report_status,
		} = query;

		// Main data query
		const dataQuery = this.db("reports as rp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"rp.id",
				"rp.report_type",
				"rp.reason",
				"rp.status",
				"js.id as reporter_id",
				"js.name as reporter_name",
				"jpd.id as job_post_details_id",
				"j.title as job_title",
				"org.user_id as hotelier_id",
				"org.name as organization_name",
				this.db.raw(
					`json_build_object(
					'resolved_by', rp.resolved_by,
					'resolved_by_name', admin.name,
					'resolved_by_email', admin.email,
					'resolution_note', rp.resolution,
					'resolved_at', rp.resolved_at
				) as resolve_info`
				)
			)
			.join("job_post_details as jpd", "jpd.id", "rp.job_post_details_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.join("job_applications as ja", "ja.job_post_details_id", "jpd.id")
			.join("user as js", "js.id", "ja.job_seeker_id")
			.join("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.leftJoin("user as admin", "rp.resolved_by", "admin.id")
			.modify((qb) => {
				if (type) qb.where("rp.report_type", type);
				if (report_status) qb.where("rp.status", report_status);

				if (searchQuery) {
					qb.andWhere((builder) => {
						builder
							.whereILike("j.title", `%${searchQuery}%`)
							.orWhereILike("org.name", `%${searchQuery}%`)
							.orWhereILike("rp.reason", `%${searchQuery}%`);
					});
				}
			})
			.orderBy("rp.id", "desc")
			.limit(limit)
			.offset(skip);

		const rows = await dataQuery;

		// Total count query
		let total: number | undefined = undefined;
		if (need_total) {
			const totalQuery = this.db("reports as rp")
				.withSchema(this.DBO_SCHEMA)
				.countDistinct("rp.id as total")
				.join(
					"job_post_details as jpd",
					"jpd.id",
					"rp.job_post_details_id"
				)
				.join("jobs as j", "j.id", "jpd.job_id")
				.join(
					"job_applications as ja",
					"ja.job_post_details_id",
					"jpd.id"
				)
				.join("job_post as jp", "jp.id", "ja.job_post_id")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])
				.modify((qb) => {
					if (type) qb.where("rp.report_type", type);
					if (report_status) qb.where("rp.status", report_status);

					if (searchQuery) {
						qb.andWhere((builder) => {
							builder
								.whereILike("j.title", `%${searchQuery}%`)
								.orWhereILike("org.name", `%${searchQuery}%`)
								.orWhereILike("rp.reason", `%${searchQuery}%`);
						});
					}
				});

			const totalRes = await totalQuery.first();
			total = Number(totalRes?.total) || 0;
		}

		return {
			data: rows,
			total,
		};
	}

	public async getHotelierReports(query: IGetReportsWithInfoQuery) {
		const {
			type,
			need_total = true,
			limit = 100,
			skip = 0,
			searchQuery,
			report_status,
		} = query;

		const dataQuery = this.db("reports as rp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"rp.id",
				"rp.report_type",
				"rp.reason",
				"rp.status",
				"jpd.id as job_post_details_id",
				"j.title as job_title",
				"org.id as reporter_id",
				"org.name as reporter_name",
				"js.id as job_seeker_id",
				"js.name as job_seeker_name",
				this.db.raw(
					`json_build_object(
					'resolved_by', rp.resolved_by,
					'resolved_by_name', admin.name,
					'resolved_by_email', admin.email,
					'resolution_note', rp.resolution,
					'resolved_at', rp.resolved_at
				) as resolve_info`
				)
			)
			.join("job_post_details as jpd", "jpd.id", "rp.job_post_details_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.join("job_applications as ja", "ja.job_post_details_id", "jpd.id")
			.join("user as js", "js.id", "ja.job_seeker_id")
			.join("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.leftJoin("user as admin", "rp.resolved_by", "admin.id")
			.modify((qb) => {
				if (type) qb.where("rp.report_type", type);
				if (report_status) qb.where("rp.status", report_status);

				if (searchQuery) {
					qb.andWhere((builder) => {
						builder
							.whereILike("j.title", `%${searchQuery}%`)
							.orWhereILike("org.name", `%${searchQuery}%`)
							.orWhereILike("rp.reason", `%${searchQuery}%`);
					});
				}
			})
			.orderBy("rp.id", "desc")
			.limit(limit)
			.offset(skip);

		const rows = await dataQuery;

		let total: number | undefined = undefined;
		if (need_total) {
			const totalQuery = this.db("reports as rp")
				.withSchema(this.DBO_SCHEMA)
				.countDistinct("rp.id as total")
				.join(
					"job_post_details as jpd",
					"jpd.id",
					"rp.job_post_details_id"
				)
				.join("jobs as j", "j.id", "jpd.job_id")
				.join(
					"job_applications as ja",
					"ja.job_post_details_id",
					"jpd.id"
				)
				.join("job_post as jp", "jp.id", "ja.job_post_id")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])
				.modify((qb) => {
					if (type) qb.where("rp.report_type", type);
					if (report_status) qb.where("rp.status", report_status);

					if (searchQuery) {
						qb.andWhere((builder) => {
							builder
								.whereILike("j.title", `%${searchQuery}%`)
								.orWhereILike("org.name", `%${searchQuery}%`)
								.orWhereILike("rp.reason", `%${searchQuery}%`);
						});
					}
				});

			const totalRes = await totalQuery.first();
			total = Number(totalRes?.total) || 0;
		}

		return {
			data: rows,
			total,
		};
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
