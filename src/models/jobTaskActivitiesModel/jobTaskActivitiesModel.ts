import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import { IJobTaskActivityPayload } from "../../utils/modelTypes/jobTaskActivities/jobTaskActivitiesModel.types";

export default class JobTaskActivitiesModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// job seeker
	public async createJobTaskActivity(payload: IJobTaskActivityPayload) {
		return await this.db("job_task_activities")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleTaskActivity(
		id?: number | null,
		job_post_details_id?: number | null
	) {
		return await this.db("job_task_activities as jta")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jta.id",
				"jta.job_application_id",
				"jta.job_post_details_id",
				"jta.start_time",
				"jta.end_time",
				"jta.approved_at",
				"ja.status as application_status",
				"ja.job_seeker_id"
			)
			.leftJoin(
				"job_applications as ja",
				"ja.job_post_details_id",
				"jta.job_post_details_id"
			)
			.modify((qb) => {
				if (id) {
					qb.where("jta.id", id);
				} else if (job_post_details_id) {
					qb.where("jta.job_post_details_id", job_post_details_id);
				}
			})
			.first();
	}

	public async updateJobTaskActivity(id: number, payload: any) {
		return await this.db("job_task_activities")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update(payload);
	}
}
