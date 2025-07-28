import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetSingleTaskActivity,
	IJobTaskActivityPayload,
} from "../../utils/modelTypes/jobTaskActivities/jobTaskActivitiesModel.types";

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

	public async getSingleTaskActivity({
		id,
		job_post_details_id,
		hotelier_id,
	}: {
		id?: number;
		job_post_details_id?: number;
		hotelier_id?: number;
	}): Promise<IGetSingleTaskActivity> {
		return await this.db("job_task_activities as jta")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jta.id",
				"jta.job_application_id",
				"jta.job_post_details_id",
				"jta.start_time",
				"jta.end_time",
				"jta.start_approved_at",
				"jta.end_approved_at",
				"ja.status as application_status",
				"ja.job_seeker_id",
				"u.name as job_seeker_name"
			)
			.leftJoin(
				"job_applications as ja",
				"ja.job_post_details_id",
				"jta.job_post_details_id"
			)
			.join("user as u", "u.id", "ja.job_seeker_id")
			.join("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
			.join("job_post as jp", "jp.id", "jpd.job_post_id")
			.modify((qb) => {
				qb.where("jta.is_deleted", false);
				if (id) {
					qb.andWhere("jta.id", id);
				}
				if (job_post_details_id) {
					qb.andWhere("jta.job_post_details_id", job_post_details_id);
				}
				if (hotelier_id) {
					qb.andWhere("jp.organization_id", hotelier_id);
				}
			})
			.first();
	}

	public async updateJobTaskActivity(id: number, payload: any) {
		return await this.db("job_task_activities")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.update(payload, "id");
	}
}
