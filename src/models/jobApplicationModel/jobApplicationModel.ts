import { IJobSeekerJobApplication } from "../../features/jobSeeker/utils/types/jobSeekerJobApplicationTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICreateJobApplicationPayload,
	IGetMyJobApplicationsParams,
	IJobApplicationStatus,
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

	public async getMyJobApplications(
		params: IGetMyJobApplicationsParams
	): Promise<{ data: IJobSeekerJobApplication[]; total?: number }> {
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
				"ja.status as job_application_status",
				"ja.payment_status",
				"ja.created_at as applied_at",
				"jpd.id as job_post_details_id",
				"jpd.status as job_post_details_status",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.job_post_id",
				"jp.title as job_post_title",
				"jp.details as job_post_details",
				"jp.requirements as job_post_requirements",
				"org.id as organization_id",
				"org.name as organization_name",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.country_name",
				"vwl.state_name",
				"vwl.city_name",
				this.db.raw(`json_build_object(
                    'id', j.id,
                    'title', j.title,
                    'details', j.details,
                    'status', j.status,
                    'is_deleted', j.is_deleted
                ) as category`)
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
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
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
	}): Promise<IJobSeekerJobApplication> {
		const data = await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id as job_application_id",
				"ja.status as job_application_status",
				"ja.payment_status",
				"ja.created_at as applied_at",
				"jpd.id as job_post_details_id",
				"jpd.status as job_post_details_status",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.job_post_id",
				"jp.title as job_post_title",
				"jp.details as job_post_details",
				"jp.requirements as job_post_requirements",
				"org.id as organization_id",
				"org.name as organization_name",
				"vwl.location_id",
				"vwl.location_name",
				"vwl.location_address",
				"vwl.country_name",
				"vwl.state_name",
				"vwl.city_name",
				this.db.raw(`json_build_object(
                    'id', j.id,
                    'title', j.title,
                    'details', j.details,
                    'status', j.status,
                    'is_deleted', j.is_deleted
                ) as category`),
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
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
			.leftJoin(
				"job_task_activities as jta",
				"jta.job_application_id",
				"ja.id"
			)
			.where({
				"ja.id": job_application_id,
				"ja.job_seeker_id": job_seeker_id,
			})
			.first();

		return data;
	}

	public async updateMyJobApplicationStatus(
		application_id: number,
		job_seeker_id: number,
		status: IJobApplicationStatus
	) {
		const [updated] = await this.db("job_applications")
			.withSchema(this.DBO_SCHEMA)
			.update({ status: status })
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
