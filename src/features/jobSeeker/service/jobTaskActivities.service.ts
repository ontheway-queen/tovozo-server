import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import dayjs from "dayjs";

export default class JobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public startJobTaskActivities = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { job_application_id, job_post_details_id } = req.body;

		return await this.db.transaction(async (trx) => {
			const jobPostModel = this.Model.jobPostModel(trx);
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
				start_time: now,
			};

			await jobTaskActivitiesModel.createJobTaskActivity(payload);
			await jobApplicationModel.updateMyJobApplicationStatus(
				job_application_id,
				user_id,
				JOB_APPLICATION_STATUS.IN_PROGRESS
			);
			await jobPostModel.updateJobPostDetailsStatus(
				myApplication.job_post_details_id,
				JOB_POST_DETAILS_STATUS.In_Progress
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
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
			const jobPostModel = this.Model.jobPostModel(trx);

			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity(
					Number(id),
					null
				);

			if (!taskActivity) {
				throw new CustomError(
					"Task activity not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
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

			const startTime = dayjs(taskActivity.start_time).valueOf();
			const endTime = dayjs(
				taskActivity.end_time ?? new Date()
			).valueOf();

			const totalWorkingHours = Number(
				((endTime - startTime) / (1000 * 60 * 60)).toFixed(2)
			);

			await jobApplicationModel.updateMyJobApplicationStatus(
				taskActivity.job_application_id,
				user_id,
				JOB_APPLICATION_STATUS.ENDED
			);

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					end_time: new Date(),
					total_working_hours: totalWorkingHours,
				}
			);

			await jobPostModel.updateJobPostDetailsStatus(
				myApplication.job_post_details_id,
				JOB_POST_DETAILS_STATUS.WorkFinished as unknown as IJobPostDetailsStatus
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};
}
