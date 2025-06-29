import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { JOB_APPLICATION_STATUS } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";

export default class JobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public startJobTaskActivities = async (req: Request) => {
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
					null,
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

	public endJobTaskActivities = async (req: Request) => {
		const id = req.params.id;
		const { user_id } = req.jobSeeker;

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
				taskActivity.application_status !==
				JOB_APPLICATION_STATUS.IN_PROGRESS
			) {
				throw new CustomError(
					`You cannot perform this action because the application is not in progress.`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}

			const myApplication = await jobApplicationModel.getMyJobApplication(
				{
					job_application_id: taskActivity.job_application_id,
					job_seeker_id: taskActivity.job_seeker_id,
				}
			);

			if (!myApplication) {
				throw new CustomError(
					`Job application not found or does not belong to you.`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await jobApplicationModel.updateMyJobApplicationStatus(
				taskActivity.job_application_id,
				user_id,
				JOB_APPLICATION_STATUS.ENDED
			);

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{ end_time: new Date().toISOString() }
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
			};
		});
	};
}
