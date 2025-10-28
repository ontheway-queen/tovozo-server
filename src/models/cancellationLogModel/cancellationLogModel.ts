import { IJobCancellationReport } from "../../features/hotelier/utils/types/hotelierJobCancellationReportTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { CANCELLATION_REPORT_STATUS } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICancellationReportRes,
	ICancellationReportResponse,
	ICancellationReportStatus,
	ICancellationReportType,
	IGetCancellationLogAdminQuery,
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

		const baseQuery = this.db("cancellation_logs as cr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cr.id",
				"cr.related_id as related_job_post_details",
				"cr.report_type",
				"cr.status",
				"u.name as reporter_name",
				"j.id as job_id",
				"j.title",
				"j.details",
				"j.status as job_status",
				"cr.created_at as reported_at",
				this.db.raw(
					`json_build_object(
          'start_time', jpd.start_time,
          'end_time', jpd.end_time
        ) as job_post_details`
				)
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
			.where((qb) => {
				if (user_id) qb.andWhere("cr.reporter_id", user_id);
				if (report_type) qb.andWhere("cr.report_type", report_type);
				if (status) qb.andWhere("cr.status", status);
				if (searchQuery) qb.andWhereILike("j.title", `%${searchQuery}%`);
			})
			.limit(limit || 100)
			.offset(skip || 0);

		const data = await baseQuery;

		let total: number | undefined;
		if (need_total) {
			const totalResult = await this.db("cancellation_logs as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as total")
				.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
				.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
				.leftJoin("jobs as j", "jpd.job_id", "j.id")
				.where((qb) => {
					if (user_id) qb.andWhere("cr.reporter_id", user_id);
					if (report_type) qb.andWhere("cr.report_type", report_type);
					if (status) qb.andWhere("cr.status", status);
					if (searchQuery) qb.andWhereILike("j.title", `%${searchQuery}%`);
				})
				.first();

			total = totalResult?.total ? Number(totalResult.total) : 0;
		}

		return { data, total };
	}

	public async getSingleJobPostCancellationLog({
		id,
		report_type,
		related_id,
	}: {
		id: number | null;
		report_type: ICancellationReportType;
		related_id?: number;
	}): Promise<ICancellationReportRes> {
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
				"cr.related_id",
				"cr.related_id as related_job_post_details",
				this.db.raw(`json_build_object(
                    'start_time', jpd.start_time,
                    'end_time', jpd.end_time
                ) as job_post_details`),
				this.db.raw(`json_build_object(
                    'id', category.id,
                    'title', category.title,
                    'details', category.details,
                    'status', category.status,
                    'is_deleted', category.is_deleted
                    ) as job_post`),
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
				"j.title",
				"j.details",
				"j.hourly_rate",
				"j.job_seeker_pay",
				"j.platform_fee"
			)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.where((qb) => {
				if (user_id) {
					qb.andWhere("cr.reporter_id", user_id);
				}
				if (searchQuery) {
					qb.andWhereILike("j.title", `%${searchQuery}%`);
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
				.leftJoin("jobs as j", "j.id", "jpd.job_id")
				.where((qb) => {
					if (user_id) {
						qb.andWhere("cr.reporter_id", user_id);
					}
					if (searchQuery) {
						qb.andWhereILike("j.title", `%${searchQuery}%`);
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

	public async getSingleJobApplicationCancellationLog({
		id,
		report_type,
		related_id,
		reporter_id,
	}: {
		id?: number | null;
		report_type: ICancellationReportType;
		related_id?: number | null;
		reporter_id?: number;
	}): Promise<ICancellationReportRes> {
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
				    'title', j.title,
				    'details', j.details
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
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
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

	public async requestForCancellationLog(payload: {
		report_type: string;
		reason: string;
		reporter_id: number;
		related_id: number;
	}) {
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

	// Get cancellation logs for admin
	public async getCancellationLogsForAdmin(
		query: IGetCancellationLogAdminQuery
	): Promise<{ data: IJobCancellationReport[]; total?: number }> {
		const {
			status,
			limit = 100,
			skip = 0,
			need_total = true,
			name,
			report_type,
		} = query;

		const jobPostQuery = this.db
			.select(
				"cr.id",
				"j.title",
				"u.name as reporter_name",
				"cr.report_type",
				"cr.status"
			)
			.from("cancellation_logs as cr")
			.withSchema(this.DBO_SCHEMA)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.where("cr.report_type", "CANCEL_JOB_POST");

		const jobApplicationQuery = this.db
			.select(
				"cr.id",
				"j.title",
				"u.name as reporter_name",
				"cr.report_type",
				"cr.status"
			)
			.from("cancellation_logs as cr")
			.withSchema(this.DBO_SCHEMA)
			.leftJoin("user as u", "u.id", "cr.reporter_id")
			.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
			.leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
			.where("cr.report_type", "CANCEL_APPLICATION");
		console.log({ jobPostQuery, jobApplicationQuery });
		const applyFilters = (qb: any) => {
			if (status) qb.andWhere("cr.status", status);
			if (report_type) qb.andWhere("cr.report_type", report_type);
			if (name) {
				qb.andWhere((subQb: any) => {
					subQb
						.whereILike("j.title", `%${name}%`)
						.orWhereILike("u.name", `%${name}%`);
				});
			}
		};

		applyFilters(jobPostQuery);
		applyFilters(jobApplicationQuery);

		const unioned = this.db
			.from((qb: any) => {
				qb.unionAll([jobPostQuery, jobApplicationQuery], true).as("combined");
			})
			.select("*")
			.limit(limit)
			.offset(skip);

		const data = await unioned;

		let total: number | undefined = undefined;

		if (need_total) {
			const jobPostTotal = this.db("cancellation_logs as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as count")
				.leftJoin("user as u", "u.id", "cr.reporter_id")
				.leftJoin("job_post_details as jpd", "cr.related_id", "jpd.id")
				.leftJoin("jobs as j", "jpd.job_id", "j.id")
				.where("cr.report_type", "CANCEL_JOB_POST");

			const jobAppTotal = this.db("cancellation_logs as cr")
				.withSchema(this.DBO_SCHEMA)
				.count("cr.id as count")
				.leftJoin("user as u", "u.id", "cr.reporter_id")
				.leftJoin("job_applications as ja", "cr.related_id", "ja.id")
				.leftJoin("job_post_details as jpd", "ja.job_post_details_id", "jpd.id")
				.leftJoin("jobs as j", "jpd.job_id", "j.id")
				.where("cr.report_type", "CANCEL_APPLICATION");

			applyFilters(jobPostTotal);
			applyFilters(jobAppTotal);

			const [jobPostCount, jobAppCount] = await Promise.all([
				jobPostTotal.first(),
				jobAppTotal.first(),
			]);

			total =
				Number(jobPostCount?.count || 0) + Number(jobAppCount?.count || 0);
		}

		return { data, total };
	}
}

export default CancellationLogModel;
