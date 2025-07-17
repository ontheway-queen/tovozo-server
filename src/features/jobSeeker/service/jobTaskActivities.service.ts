import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import {
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { IUpdateJobTaskListPayload } from "../../hotelier/utils/types/hotelierJobTaskTypes";

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
				await jobTaskActivitiesModel.getSingleTaskActivity({
					job_post_details_id,
				});
			if (exitingTaskActivities) {
				throw new CustomError(
					`A task activity already exists for this job.`,
					this.StatusCode.HTTP_CONFLICT
				);
			}

			const payload = {
				job_application_id,
				job_post_details_id,
			};

			const res = await jobTaskActivitiesModel.createJobTaskActivity(
				payload
			);
			// await jobApplicationModel.updateMyJobApplicationStatus(
			// 	job_application_id,
			// 	user_id,
			// 	JOB_APPLICATION_STATUS.IN_PROGRESS
			// );
			// await jobPostModel.updateJobPostDetailsStatus(
			// 	myApplication.job_post_details_id,
			// 	JOB_POST_DETAILS_STATUS.In_Progress
			// );
			io.emit("start-job-task", {
				id: res[0].id,
				start_time: new Date(),
				end_time: null,
				total_working_hours: null,
				start_approved_at: null,
				end_approved_at: null,
			});
			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public toggleTaskCompletionStatus = async (req: Request) => {
		const id = Number(req.params.id);
		const is_completed = req.query.is_completed;
		const isCompleted = is_completed === "1" ? true : false;

		return await this.db.transaction(async (trx) => {
			const jobTaskListModel = this.Model.jobTaskListModel(trx);

			const taskList = await jobTaskListModel.getJobTaskList({ id });
			if (!taskList.length) {
				throw new CustomError(
					"Job task not found. Please create task to proceed.",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (taskList[0].is_completed === isCompleted) {
				throw new CustomError(
					`Task is already marked as ${
						isCompleted ? "completed" : "incomplete"
					}`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const payload: IUpdateJobTaskListPayload = {
				is_completed: isCompleted,
				completed_at: isCompleted ? new Date().toISOString() : null,
			};

			await jobTaskListModel.updateJobTaskList(id, payload);

			io.emit("update:job-task-list", {
				id,
				message: taskList[0].message,
			});

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
			const jobTaskListModel = this.Model.jobTaskListModel(trx);

			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity({
					id: Number(id),
				});

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

			const taskList = await jobTaskListModel.getJobTaskList({
				job_task_activity_id: Number(id),
			});
			console.log({ taskList });
			const incompleteTasks = taskList.filter(
				(task) => !task.is_completed
			);
			console.log({ incompleteTasks });
			if (incompleteTasks.length > 0) {
				throw new CustomError(
					"There are incomplete tasks that must be finished before proceeding.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const myApplication = await jobApplicationModel.getMyJobApplication(
				{
					job_application_id: taskActivity.job_application_id,
					job_seeker_id: taskActivity.job_seeker_id,
				}
			);
			console.log({ myApplication });
			if (!myApplication) {
				throw new CustomError(
					`Job application not found or does not belong to you.`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					end_time: new Date(),
				}
			);

			io.emit("end-job-task", {
				id,
				start_time: taskActivity.start_time,
				start_approved_at: taskActivity.start_approved_at,
				end_time: new Date(),
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};
}
