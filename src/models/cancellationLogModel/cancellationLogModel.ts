import { IJobCancellationReport } from "../../features/hotelier/utils/types/hotelierJobCancellationReportTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { CANCELLATION_REPORT_STATUS } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICancellationReportRes,
	ICancellationReportResponse,
	ICancellationReportStatus,
	ICancellationReportType,
	IGetReportsQuery,
} from "../../utils/modelTypes/cancellationReport/cancellationReport.types";

class CancellationLogModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// get job post reports list
	public async getJobPostCancellationLogs(
		query: IGetReportsQuery
	): Promise<{ data: IJobCancellationReport[]; total?: number }> {
		const {
			user_id,
			report_type,
			status,
			limit,
			skip,
			need_total = true,
			searchQuery,
		} = query;
		const data = await this.db("cancellation_logs as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"cr.related_id as related_job_post_details",
				"cr.report_type",
				"cr.status",
				"u.name as reporter_name",
				this.db.raw(`json_build_object(
                    'title', jp.title,
                    'details', jp.details,
                    'requirements',jp.requirements,
                    'prefer_gender', jp.prefer_gender,
                    'hourly_rate', jp.hourly_rate,
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`),
				this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as category`),
				"cr.created_at as reported_at"
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.leftJoin("jobs as category", "jpd.job_id", "category.id")
			.where((qb) => {
				if (user_id) {
					qb.andWhere("cr.reporter_id", user_id);
				}
				if (searchQuery) {
					qb.andWhereILike("jp.title", `%${searchQuery}%`);
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
			const totalQuery = await this.db("cancellation_logs as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as total")
				.leftJoin("user as u", "u.id", "cr.reporter_id")
				.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
				.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
				.leftJoin("jobs as category", "jpd.job_id", "category.id")
				.where((qb) => {
					if (user_id) {
						qb.andWhere("cr.reporter_id", user_id);
					}
					if (searchQuery) {
						qb.andWhereILike("jp.title", `%${searchQuery}%`);
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

	public async getSingleJobPostCancellationLog(
		id: number | null,
		report_type: ICancellationReportType,
		related_id?: number
	): Promise<ICancellationReportRes> {
		return await this.db("cancellation_logs as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"cr.related_id as related_job_post_details",
				"cr.report_type",
				"cr.status",
				"u.name as reporter_name",
				this.db.raw(`json_build_object(
                    'title', jp.title,
                    'details', jp.details,
                    'requirements',jp.requirements,
                    'prefer_gender', jp.prefer_gender,
                    'hourly_rate', jp.hourly_rate,
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`),
				this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as category`),
				"cr.created_at as reported_at"
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.leftJoin("jobs as category", "jpd.job_id", "category.id")
			.where("cr.report_type", report_type)
			.modify((qb) => {
				if (id) {
					qb.andWhere("cr.id", id);
				}
				if (related_id) {
					qb.andWhere("cr.related_id", related_id);
				}
			})
			.first();
	}

	// JOB APPLICATION REPORTS
	public async getJobApplicationCancellationLogs(
		query: IGetReportsQuery
	): Promise<ICancellationReportResponse> {
		const {
			user_id,
			report_type,
			status,
			limit,
			skip,
			need_total = true,
			searchQuery,
		} = query;
		const data = await this.db("cancellation_logs as cr")
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
				if (user_id) {
					qb.andWhere("cr.reporter_id", user_id);
				}
				if (searchQuery) {
					qb.andWhereILike("jp.title", `%${searchQuery}%`);
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
			const totalQuery = await this.db("cancellation_logs as cr")
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
					if (user_id) {
						qb.andWhere("cr.reporter_id", user_id);
					}
					if (searchQuery) {
						qb.andWhereILike("jp.title", `%${searchQuery}%`);
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

	public async getSingleJobApplicationCancellationLog(
		id: number | null,
		report_type: ICancellationReportType,
		related_id?: number | null,
		reporter_id?: number
	): Promise<ICancellationReportRes> {
		return await this.db("cancellation_logs as cr")
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
			.where("cr.report_type", report_type)
			.modify((qb) => {
				if (id) {
					qb.andWhere("cr.id", id);
				}
				if (related_id) {
					qb.andWhere("cr.related_id", related_id);
				}
				if (reporter_id) {
					qb.andWhere("cr.reporter_id", reporter_id);
				}
			})
			.first();
	}

	public async requestForCancellationLog(payload: any) {
		return await this.db("cancellation_logs")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleCancellationLogWithRelatedId(id: number) {
		return await this.db("cancellation_logs")
			.withSchema(this.DBO_SCHEMA)
			.where("related_id", id)
			.andWhere("status", CANCELLATION_REPORT_STATUS.PENDING)
			.first();
	}

	public async updateCancellationLogStatus(
		id: number,
		payload: { status: ICancellationReportStatus }
	) {
		return await this.db("cancellation_logs")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update(payload);
	}
}

export default CancellationLogModel;
