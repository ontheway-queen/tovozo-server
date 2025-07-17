import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import { JOB_APPLICATION_STATUS } from "../../../utils/miscellaneous/constants";
import { NotificationTypeEnum } from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { IUpdateJobTaskListPayload } from "../utils/types/hotelierJobTaskTypes";

export default class HotelierJobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public approveJobTaskActivity = async (req: Request) => {
		const id = req.params.id;
		return await this.db.transaction(async (trx) => {
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);

			const taskActivity = await jobTaskActivitiesModel.getSingleTaskActivity({
				id: Number(id),
			});
			if (taskActivity.application_status !== JOB_APPLICATION_STATUS.ENDED) {
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

			await jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
				approved_at: new Date().toISOString(),
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
			};
		});
	};

	public createJobTaskList = async (req: Request) => {
		const body = req.body as {
			job_task_activity_id: number;
			message: string;
		};

		return await this.db.transaction(async (trx) => {
			const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
			const jobTaskListModel = this.Model.jobTaskListModel(trx);
			const { user_id } = req.hotelier;

			const taskActivity = await jobTaskActivitiesModel.getSingleTaskActivity({
				id: body.job_task_activity_id,
				hotelier_id: user_id,
			});

			if (!taskActivity) {
				throw new CustomError(
					"Task activity not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const res = await jobTaskListModel.createJobTaskList(body);

			if (!res.length) {
				throw new CustomError(
					"Failed to create job task list",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: taskActivity.job_seeker_id,
				content: `A new task has been created for you.`,
				related_id: taskActivity.job_application_id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			io.emit("create:job-task-list", {
				id: res[0].id,
				job_task_activity_id: body.job_task_activity_id,
				message: body.message,
				is_completed: false,
				completed_at: null,
				created_at: new Date().toISOString(),
				job_seeker_id: taskActivity.job_seeker_id,
				job_seeker_name: taskActivity.job_seeker_name,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public updateJobTaskList = async (req: Request) => {
		const id = Number(req.params.id);
		const body = req.body as {
			message: string;
		};

		return await this.db.transaction(async (trx) => {
			const jobTaskListModel = this.Model.jobTaskListModel(trx);

			const taskList = await jobTaskListModel.getJobTaskList({ id });

			if (!taskList.length) {
				throw new CustomError(
					"Job task list not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const payload: IUpdateJobTaskListPayload = {
				message: body.message,
			};

			await jobTaskListModel.updateJobTaskList(id, payload);

			io.emit("update:job-task-list", {
				id,
				message: body.message,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public deleteJobTaskList = async (req: Request) => {
		const id = Number(req.params.id);

		return await this.db.transaction(async (trx) => {
			const jobTaskListModel = this.Model.jobTaskListModel(trx);

			const taskList = await jobTaskListModel.getJobTaskList({ id });

			if (!taskList.length) {
				throw new CustomError(
					"Job task list not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await jobTaskListModel.deleteJobTaskList(id);

			io.emit("delete:job-task-list", id);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};
}
