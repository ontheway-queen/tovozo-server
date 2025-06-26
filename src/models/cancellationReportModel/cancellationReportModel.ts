import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import { IGetReportsQuery } from "../../utils/modelTypes/cancellationReport/cancellationReport.types";

class CancellationReportModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// get job post reports list
	public async getJobPostReports(query: IGetReportsQuery) {
		const {
			report_type,
			status,
			limit,
			skip,
			need_total = true,
			search_text,
		} = query;
		const data = await this.db("cancellation_reports as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"cr.report_type",
				"cr.status",
				"u.name as reporter_name",
				"jp.title",
				"jp.details",
				"jp.requirements",
				"jp.hourly_rate",
				"jp.prefer_gender",
				"jp.expire_time"
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.where((qb) => {
				if (search_text) {
					qb.andWhereILike("jp.title", `%${search_text}%`);
				}
				if (report_type) {
					qb.andWhere("cr.report_type", report_type);
				}
				if (status) {
					qb.andWhere("cr.status", status);
				}
			})
			.limit(limit || 100)
			.offset(skip || 0);

		let total;
		if (need_total) {
			const totalQuery = await this.db("cancellation_reports as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as total")
				.leftJoin("user as u", "u.id", "cr.reporter_id")
				.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
				.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
				.where((qb) => {
					if (search_text) {
						qb.andWhereILike("jp.title", `%${search_text}%`);
					}
					if (report_type) {
						qb.andWhere("cr.report_type", report_type);
					}
					if (status) {
						qb.andWhere("cr.status", status);
					}
				})
				.first();
			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}
		return { data, total };
	}

	// JOB APPLICATION REPORTS
	public async getJobApplicationReports(query: IGetReportsQuery) {
		const {
			report_type,
			status,
			limit,
			skip,
			need_total = true,
			search_text,
		} = query;
		const data = await this.db("cancellation_reports as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"u.name as reporter_name",
				"u.phone_number as reporter_phone_number",
				"cr.report_type",
				"cr.status",
				"cr.reason as cancellation_reason",
				"cr.reject_reason",
				this.db.raw(`json_build_object(
                    'id', jp.id,
                    'title', jp.title,
                    'details', jp.details,
                    'requirements', jp.requirements
                ) as job_post`)
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
			.where((qb) => {
				if (search_text) {
					qb.andWhereILike("jp.title", `%${search_text}%`);
				}
				if (report_type) {
					qb.andWhere("cr.report_type", report_type);
				}
				if (status) {
					qb.andWhere("cr.status", status);
				}
			})
			.limit(limit || 100)
			.offset(skip || 0);

		let total;
		if (need_total) {
			const totalQuery = await this.db("cancellation_reports as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as total")
				.leftJoin("user as u", "u.id", "cr.reporter_id")
				.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
				.leftJoin(
					"job_post_details as jpd",
					"jpd.id",
					"ja.job_post_details_id"
				)
				.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
				.where((qb) => {
					if (search_text) {
						qb.andWhereILike("jp.title", `%${search_text}%`);
					}
					if (report_type) {
						qb.andWhere("cr.report_type", report_type);
					}
					if (status) {
						qb.andWhere("cr.status", status);
					}
				})
				.first();
			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}
		return { data, total };
	}

	public async requestForCancellationReport(payload: any) {
		return await this.db("cancellation_reports")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleJobPostReport(
		id: number,
		report_type: "CANCEL_JOB_POST"
	) {
		return await this.db("cancellation_reports as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"cr.report_type",
				"cr.status",
				"u.name as reporter_name",
				"jp.title",
				"jp.details",
				"jp.requirements",
				"jp.hourly_rate",
				"jp.prefer_gender",
				"jp.expire_time"
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.where({ "cr.id": id, "cr.report_type": report_type })
			.first();
	}

	public async getSingleJobApplicationReport(
		id: number,
		report_type: "CANCEL_APPLICATION"
	) {
		return await this.db("cancellation_reports as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"u.name as reporter_name",
				"u.phone_number as reporter_phone_number",
				"cr.report_type",
				"cr.status",
				"cr.reason as cancellation_reason",
				"cr.reject_reason",
				"cr.reporter_id",
				"cr.related_id",
				this.db.raw(`json_build_object(
                    'id', jp.id,
                    'title', jp.title,
                    'details', jp.details,
                    'requirements', jp.requirements
                ) as job_post`)
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
			.where({ "cr.id": id, "cr.report_type": report_type })
			.first();
	}

	public async getSingleReportWithRelatedId(id: number) {
		return await this.db("cancellation_reports")
			.withSchema(this.DBO_SCHEMA)
			.where("related_id", id)
			.first();
	}

	public async updateCancellationReportStatus(id: number, payload: any) {
		return await this.db("cancellation_reports")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update(payload);
	}
}

export default CancellationReportModel;
