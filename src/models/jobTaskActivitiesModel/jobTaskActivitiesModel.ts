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

	public async getSingleTaskActivity(id: number) {
		return await this.db("job_task_activities")
			.withSchema(this.DBO_SCHEMA)
			.where({ job_post_details_id: id })
			.first();
	}
}
