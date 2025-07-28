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
	): Promise<{ data: any[]; total?: number }> {
		const {
			type,
			need_total = true,
			limit = 100,
			skip = 0,
			searchQuery,
			report_status,
		} = query;
		console.log({ searchQuery });
		const data = await this.db("reports as rp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"rp.id",
				"rp.status as report_status",
				"rp.report_type",
				"rp.reason as report_reason",
				"rp.job_post_details_id",
				"rp.related_id",
				"rp.resolution",

				"j.title as job_title",
				"jsu.id as job_seeker_id",
				"jsu.name as job_seeker_name",
				"org.id as organization_id",
				"org.name as organization_name"
			)
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"rp.job_post_details_id"
			)
			.leftJoin("job_post as jp", "jp.id", "jpd.job_post_id")
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_applications as ja", "ja.id", "rp.related_id")
			.leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.where((qb) => {
				if (type) qb.andWhere("rp.report_type", type);
				if (searchQuery)
					qb.andWhere("j.title", "ilike", `%${searchQuery}%`);
				if (report_status) qb.andWhere("rp.status", report_status);
			});

		const groupedMap = new Map<
			string,
			{
				job_post_details_id: number;
				job_title: string;
				job_seeker_report?: {
					report_id: number;
					report_type: string;
					report_status: string;
					report_reason: string;
					job_seeker_name: string;
					job_seeker_id: number;
					resolution_note: string;
				};
				hotelier_report?: {
					report_id: number;
					report_type: string;
					report_status: string;
					report_reason: string;
					organization_name: string;
					organization_id: number;
					resolution_note: string;
				};
			}
		>();

		for (const row of data) {
			const key = `${row.job_post_details_id}-${row.related_id}`;
			if (!groupedMap.has(key)) {
				groupedMap.set(key, {
					job_post_details_id: row.job_post_details_id,
					job_title: row.job_title,
				});
			}

			const group = groupedMap.get(key)!;

			if (row.report_type === REPORT_TYPE.JobPost) {
				group.job_seeker_report = {
					report_id: row.id,
					report_type: row.report_type,
					report_status: row.report_status,
					report_reason: row.report_reason,
					job_seeker_name: row.job_seeker_name,
					job_seeker_id: row.job_seeker_id,
					resolution_note: row.resolution,
				};
			} else {
				group.hotelier_report = {
					report_id: row.id,
					report_type: row.report_type,
					report_status: row.report_status,
					report_reason: row.report_reason,
					organization_id: row.organization_id,
					organization_name: row.organization_name,
					resolution_note: row.resolution,
				};
			}
		}

		const groupedArray = Array.from(groupedMap.values());

		const paginated = groupedArray.slice(skip || 0, skip + limit || 100);

		return {
			data: paginated,
			total: need_total ? groupedArray.length : undefined,
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
