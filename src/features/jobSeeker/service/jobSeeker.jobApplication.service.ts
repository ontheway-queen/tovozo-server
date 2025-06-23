import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateJobApplicationPayload } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";

export class JobSeekerJobApplication extends AbstractServices {
	constructor() {
		super();
	}

	public createJobApplication = async (req: Request) => {
		const { job_post_details_id } = req.query;
		const { user_id } = req.jobSeeker;

		const payload = {
			job_post_details_id: Number(job_post_details_id),
			job_seeker_id: user_id,
		};

		return await this.db.transaction(async (trx) => {
			const model = this.Model.jobApplicationModel(trx);

			const res = await model.createJobApplication(
				payload as ICreateJobApplicationPayload
			);

			await model.markJobPostDetailAsApplied(Number(job_post_details_id));

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				data: res[0]?.id,
			};
		});
	};
}
