import { IJobSeekerJobApplication } from "../../features/jobSeeker/utils/types/jobSeekerJobApplicationTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { JOB_APPLICATION_STATUS } from "../../utils/miscellaneous/constants";
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

	public async getApplication(job_post_details_id: number) {}

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
				"jpd.start_time",
				"jpd.end_time",
				"j.title as job_post_title",
				"j.job_seeker_pay",
				"org.id as organization_id",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.longitude",
				"vwl.latitude"
			)
			.leftJoin(
				"job_post_details as jpd",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
			.leftJoin("job_post as jp", "jpd.job_post_id", "jp.id")
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
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

		return { data, total };
	}

	public async getMyJobApplication({
		job_application_id,
		job_seeker_id,
	}: {
		job_application_id?: number | null;
		job_seeker_id: number;
	}): Promise<IJobSeekerJobApplication> {
		return await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id as job_application_id",
				"ja.status as job_application_status",
				"jpd.id as job_post_details_id",
				"jpd.status as job_post_details_status",
				"jpd.start_time",
				"jpd.end_time",
				"jpd.job_post_id",
				"j.title as job_post_title",
				"j.details as job_post_details",
				"j.job_seeker_pay",
				"org.user_id as hotelier_id",
				"org.id as organization_id",
				"org.name as organization_name",
				"org_p.file as organization_photo",
				"vwl.location_address",
				"vwl.city_name",
				"vwl.longitude",
				"vwl.latitude",
				this.db.raw(`json_build_object(
            'id', jta.id,
            'start_time', jta.start_time,
            'end_time', jta.end_time,
            'total_working_hours', jta.total_working_hours,
            'start_approved_at', jta.start_approved_at,
            'end_approved_at', jta.end_approved_at,
            'tasks', task_list_agg.tasks
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
				this.db.raw(`?? as org_p ON org_p.organization_id = org.id`, [
					`${this.HOTELIER}.${this.TABLES.organization_photos}`,
				])
			)
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
			.leftJoin(
				this.db
					.select(
						"jtl.job_task_activity_id",
						this.db
							.raw(`COALESCE(json_agg(DISTINCT jsonb_build_object(
                  'id', jtl.id,
        'message', jtl.message,
        'is_completed', jtl.is_completed,
        'completed_at', jtl.completed_at
      )) FILTER (WHERE jtl.id IS NOT NULL), '[]'::json) as tasks`)
					)
					.from(`${this.DBO_SCHEMA}.job_task_list as jtl`)
					.where("jtl.is_deleted", false)
					.groupBy("jtl.job_task_activity_id")
					.as("task_list_agg"),
				"task_list_agg.job_task_activity_id",
				"jta.id"
			)
			.where("ja.job_seeker_id", job_seeker_id)
			.modify((qb) => {
				if (job_application_id) {
					qb.andWhere("ja.id", job_application_id);
				}
			})
			.first();
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
				status: JOB_APPLICATION_STATUS.CANCELLED,
				cancelled_at: new Date(),
			});
	}
}
