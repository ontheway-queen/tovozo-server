import { db } from "../../../app/database";
import Models from "../../../models/rootModel";
import {
	JOB_POST_DETAILS_STATUS,
	JOB_POST_STATUS,
} from "../../miscellaneous/constants";

export default class JobPostWorker {
	public async expireJobPostDetails(job: any) {
		const { id } = job.data;
		return await db.transaction(async (trx) => {
			const jobPostModel = new Models().jobPostModel(trx);
			await jobPostModel.updateJobPost(id, {
				status: JOB_POST_STATUS.Expired,
			});
			await jobPostModel.updateJobPost(id, {
				status: JOB_POST_STATUS.Expired,
			});
			const jobs = await jobPostModel.getAllJobsUsingJobPostId({
				id,
				status: "Pending",
			});
			console.log({ jobs });
			if (jobs.length > 0) {
				await Promise.all(
					jobs.map((job) =>
						jobPostModel.updateJobPostDetailsStatus({
							id: job.id,
							status: JOB_POST_DETAILS_STATUS.Expired,
						})
					)
				);
			}
		});
	}
}
