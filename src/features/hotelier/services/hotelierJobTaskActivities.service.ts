import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { JOB_APPLICATION_STATUS } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";

export default class HotelierJobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public approveJobTaskActivity = async (req: Request) => {
		const id = req.params.id;
		return await this.db.transaction(async (trx) => {
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);

			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity(
					Number(id),
					null
				);
			if (
				taskActivity.application_status !== JOB_APPLICATION_STATUS.ENDED
			) {
				throw new CustomError(
					`You cannot perform this action because the application is not ended yet.`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}

			const application = await jobApplicationModel.getMyJobApplication({
				job_application_id: taskActivity.job_application_id,
				job_seeker_id: taskActivity.job_seeker_id,
			});

			if (!application) {
				throw new CustomError(
					`Job application not found or does not belong to you.`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await jobApplicationModel.updateMyJobApplicationStatus(
				taskActivity.job_application_id,
				taskActivity.job_seeker_id,
				JOB_APPLICATION_STATUS.COMPLETED
			);

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{ approved_at: new Date().toISOString() }
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
			};
		});
	};
}
