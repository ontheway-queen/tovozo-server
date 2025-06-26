import { TDB } from "../../features/public/utils/types/publicCommon.types";
import CustomError from "../../utils/lib/customError";
import {
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
} from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICreateJobApplicationPayload,
	IGetMyJobApplicationsParams,
} from "../../utils/modelTypes/jobApplication/jobApplicationModel.types";

export default class JobApplicationModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createJobApplication(payload: ICreateJobApplicationPayload) {
		return await this.db("job_applications")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async markJobPostDetailAsApplied(job_post_detail_id: number) {
		return await this.db("job_post_details")
			.withSchema(this.DBO_SCHEMA)
			.update({ status: "Applied" })
			.where({ id: job_post_detail_id });
	}

	public async getMyJobApplications(params: IGetMyJobApplicationsParams) {
		const {
			user_id: job_seeker_id,
			orderBy,
			orderTo,
			status,
			limit,
			skip,
			need_total = true,
		} = params;
		const data = await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id as job_application_id",
				"ja.job_post_details_id",
				"ja.status as job_application_status",
				"ja.created_at as applied_at",
				"jpd.id as job_post_details_id",
				"jpd.status as job_post_details_status",
				"jpd.job_post_id",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.status as job_post_details_status",
				"jp.id as job_post_id",
				"jp.title as job_post_title",
				"org.id as organization_id",
				"org.name as organization_name",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name"
			)
			.leftJoin(
				"job_post_details as jpd",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			// .join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.where("ja.job_seeker_id", job_seeker_id)
			.modify((qb) => {
				if (status) {
					qb.andWhere("ja.status", status);
				}
			})
			.orderBy(orderBy || "ja.created_at", orderTo || "desc")
			.limit(limit || 100)
			.offset(skip || 0);

		let total;
		if (need_total) {
			const totalQuery = await this.db("job_applications as ja")
				.withSchema(this.DBO_SCHEMA)
				.count("ja.id as total")
				.where("ja.job_seeker_id", job_seeker_id)
				.modify((qb) => {
					if (status) {
						qb.andWhere("ja.status", status);
					}
				})
				.first();

			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}
		console.log({ data });
		return { data, total };
	}

	public async getMyJobApplication({
		job_application_id,
		job_seeker_id,
	}: {
		job_application_id: number;
		job_seeker_id: number;
	}) {
		const data = await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id as job_application_id",
				"ja.job_post_details_id",
				"ja.status as job_application_status",
				"ja.created_at as applied_at",
				"jpd.id as job_post_details_id",
				"jpd.status as job_post_details_status",
				"jpd.job_post_id",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.status as job_post_details_status",
				"jp.id as job_post_id",
				"jp.title as job_post_title",
				"org.id as organization_id",
				"org.name as organization_name",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.state_name",
				"vwl.country_name"
			)
			.leftJoin(
				"job_post_details as jpd",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			// .join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.where({
				"ja.id": job_application_id,
				"ja.job_seeker_id": job_seeker_id,
			})
			.first();

		return data;
	}

	public async cancelMyJobApplication(
		application_id: number,
		job_seeker_id: number
	) {
		console.log({ application_id, job_seeker_id });
		const [updated] = await this.db("job_applications")
			.withSchema(this.DBO_SCHEMA)
			.update({ status: JOB_APPLICATION_STATUS.CANCELLED })
			.where({
				id: application_id,
				job_seeker_id: job_seeker_id,
			})
			.returning("*");

		return updated ?? null;
	}

	// cancel all job application if hotelier cancel the job.
	public async cancelApplication(job_post_id: number) {
		console.log("job_post_id", job_post_id);
		return await this.db("job_applications")
			.withSchema(this.DBO_SCHEMA)
			.where("job_post_id", job_post_id)
			.update({
				status: "CANCELLED",
				cancelled_at: new Date(),
			});
	}
}
