import { db } from "../../../app/database";
import Models from "../../../models/rootModel";
import {
	JOB_POST_DETAILS_STATUS,
	JOB_POST_STATUS,
} from "../../miscellaneous/constants";

export default class JobPostWorker {
	public async expireJobPost(job: any) {
		const { id } = job.data;
		return await db.transaction(async (trx) => {
			const jobPostModel = new Models().jobPostModel(trx);
			const jobPost = await jobPostModel.updateJobPost(id, {
				status: JOB_POST_STATUS.Expired,
			});

			console.log({ jobPost });

			const jobs = await jobPostModel.getAllJobsUsingJobPostId(id);

			if (jobs.length > 0) {
				await Promise.all(
					jobs.map((job) =>
						jobPostModel.updateJobPostDetailsStatus(
							job.id,
							JOB_POST_DETAILS_STATUS.Expired
						)
					)
				);
			}
		});
		const trx = await db.transaction();

		try {
			const model = new Models().jobPostModel(trx);
			await model.updateJobPost(id, { status: "Expired" });
			await trx.commit();
		} catch (err) {
			await trx.rollback();
			console.error(`❌ Failed to expire job post ${id}:`, err);
			throw err;
		}
	}
}
