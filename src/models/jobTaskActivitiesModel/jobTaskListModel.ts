import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetJobTaskList,
	IJobTaskListPayload,
	IJobTaskListQuery,
	IUpdateJobTaskListPayload,
} from "../../utils/modelTypes/jobTaskActivities/jobTaskListModel.types";

class JobTaskListModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// create job task list
	public async createJobTaskList(payload: IJobTaskListPayload[]) {
		return await this.db("job_task_list")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, ["id", "message"]);
	}

	// get job task list
	public async getJobTaskList(
		query: IJobTaskListQuery
	): Promise<IGetJobTaskList[]> {
		return await this.db("job_task_list as jtl")
			.select(
				"jtl.id",
				"jtl.message",
				"jtl.is_completed",
				"jtl.completed_at",
				"js.id as job_seeker_id",
				"js.name as job_seeker_name",
				"jtl.created_at",
				"org.user_id as hotelier_id"
			)
			.withSchema(this.DBO_SCHEMA)
			.join(
				"job_task_activities as jta",
				"jta.id",
				"jtl.job_task_activity_id"
			)
			.join("job_applications as ja", "ja.id", "jta.job_application_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.join("user as js", "js.id", "ja.job_seeker_id")
			.where((qb) => {
				qb.where("jtl.is_deleted", false);
				if (query.id) {
					qb.andWhere("jtl.id", query.id);
				}
				if (query.job_task_activity_id) {
					qb.andWhere(
						"jtl.job_task_activity_id",
						query.job_task_activity_id
					);
				}
			});
	}

	public async updateJobTaskList(
		id: number,
		payload: IUpdateJobTaskListPayload
	) {
		return await this.db("job_task_list")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.andWhere("is_deleted", false)
			.update(payload);
	}

	public async deleteJobTaskList(id: number) {
		return await this.db("job_task_list")
			.withSchema(this.DBO_SCHEMA)
			.where("id", id)
			.andWhere("is_deleted", false)
			.update({ is_deleted: true });
	}
}

export default JobTaskListModel;
