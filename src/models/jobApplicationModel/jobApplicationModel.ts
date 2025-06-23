import { TDB } from "../../features/public/utils/types/publicCommon.types";
import CustomError from "../../utils/lib/customError";
import Schema from "../../utils/miscellaneous/schema";
import { ICreateJobApplicationPayload } from "../../utils/modelTypes/jobApplication/jobApplicationModel.types";

export default class JobApplicationModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createJobApplication(payload: ICreateJobApplicationPayload) {
		const { job_post_details_id } = payload;
		const existingJobPostDetails = await this.db("job_post_details")
			.withSchema(this.DBO_SCHEMA)
			.where({
				id: job_post_details_id,
			})
			.first();

		console.log("Existing Job Post Details:", existingJobPostDetails);
		if (
			existingJobPostDetails &&
			existingJobPostDetails.status !== "Pending"
		) {
			throw new CustomError(
				"You cannot apply to this job right now.",
				422
			);
		}

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
}
