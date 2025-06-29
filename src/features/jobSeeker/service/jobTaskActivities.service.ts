import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { JOB_APPLICATION_STATUS } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";

export default class JobTaskActivitiesService extends AbstractServices {
	private model = this.Model.jobTaskActivitiesModel();
	constructor() {
		super();
	}

	public createJobTaskActivities = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { job_application_id, job_post_details_id } = req.body;

		return await this.db.transaction(async (trx) => {
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);

			const myApplication = await jobApplicationModel.getMyJobApplication(
				{
					job_application_id,
					job_seeker_id: user_id,
				}
			);

			if (
				myApplication.job_application_status !==
				JOB_APPLICATION_STATUS.PENDING
			) {
				throw new CustomError(
					`Job application must be in 'PENDING' status to perform this action.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const startTime = new Date(myApplication.start_time);
			const now = new Date();
			if (now < startTime) {
				throw new CustomError(
					`You cannot start the task before the scheduled start time.`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}

			const exitingTaskActivities =
				await jobTaskActivitiesModel.getSingleTaskActivity(
					job_post_details_id
				);
			if (exitingTaskActivities) {
				throw new CustomError(
					`A task activity already exists for this job.`,
					this.StatusCode.HTTP_CONFLICT
				);
			}

			const payload = {
				job_application_id,
				job_post_details_id,
				start_time: new Date().toISOString(),
			};

			await jobApplicationModel.updateMyJobApplicationStatus(
				job_application_id,
				user_id,
				JOB_APPLICATION_STATUS.IN_PROGRESS
			);
			const res = await jobTaskActivitiesModel.createJobTaskActivity(
				payload
			);
			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				data: res[0]?.id,
			};
		});
	};
}
