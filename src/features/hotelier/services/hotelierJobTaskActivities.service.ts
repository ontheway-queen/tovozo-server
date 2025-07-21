import dayjs from "dayjs";
import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import {
	HotelierFixedCharge,
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
	JobSeekerFixedCharge,
	PAYMENT_STATUS,
	PlatformFee,
} from "../../../utils/miscellaneous/constants";
import { NotificationTypeEnum } from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { IUpdateJobTaskListPayload } from "../utils/types/hotelierJobTaskTypes";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

export default class HotelierJobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public approveJobTaskActivity = async (req: Request) => {
		const id = req.params.id;
		return await this.db.transaction(async (trx) => {
			const jobPostModel = this.Model.jobPostModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);

			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity({
					id: Number(id),
				});
			console.log({ taskActivity });
			if (
				taskActivity.application_status !==
				JOB_APPLICATION_STATUS.PENDING
			) {
				throw new CustomError(
					`You cannot perform this action because the application is still in progress.`,
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
				JOB_APPLICATION_STATUS.IN_PROGRESS
			);

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					start_time: new Date(),
					start_approved_at: new Date().toISOString(),
				}
			);

			await jobPostModel.updateJobPostDetailsStatus(
				application.job_post_details_id,
				JOB_POST_DETAILS_STATUS.In_Progress
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public createJobTaskList = async (req: Request) => {
		const body = req.body as {
			job_task_activity_id: number;
			tasks: { message: string }[];
		};

		return await this.db.transaction(async (trx) => {
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);
			const jobTaskListModel = this.Model.jobTaskListModel(trx);
			const { user_id } = req.hotelier;

			// Validate task activity
			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity({
					id: body.job_task_activity_id,
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
					`You cannot perform this action because the application is not in progress. Your application status is ${taskActivity.application_status}`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}
			// Build insert payload
			const taskList = body.tasks.map((task) => ({
				job_task_activity_id: body.job_task_activity_id,
				message: task.message,
			}));

			const res = await jobTaskListModel.createJobTaskList(taskList);
			if (!res.length) {
				throw new CustomError(
					"Failed to create job task list",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: taskActivity.job_seeker_id,
				content: `New tasks have been assigned to you.`,
				related_id: taskActivity.job_application_id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			const allMessages = taskList
				.map((task, index) => `${index + 1}. ${task.message}`)
				.join("\n");

			io.emit("create:job-task-list", {
				id: res[0].id,
				job_task_activity_id: body.job_task_activity_id,
				message: allMessages,
				is_completed: false,
				completed_at: null,
				created_at: new Date().toISOString(),
				job_seeker_id: taskActivity.job_seeker_id,
				job_seeker_name: taskActivity.job_seeker_name,
			});
			console.log(4);
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
					"Job task not found. Please create task to proceed.",
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
					"Job task not found. Please create task to proceed.",
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

	public approveEndJobTaskActivity = async (req: Request) => {
		const id = req.params.id;
		return await this.db.transaction(async (trx) => {
			const paymentModel = this.Model.paymnentModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);
			const taskActivity =
				await jobTaskActivitiesModel.getSingleTaskActivity({
					id: Number(id),
				});
			if (
				taskActivity.application_status !==
				JOB_APPLICATION_STATUS.IN_PROGRESS
			) {
				throw new CustomError(
					`You cannot perform this action because the application is still in progress.`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}
			console.log({ taskActivity });

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
			console.log({ application });
			await jobApplicationModel.updateMyJobApplicationStatus(
				taskActivity.job_application_id,
				taskActivity.job_seeker_id,
				JOB_APPLICATION_STATUS.ENDED
			);

			const startTime = dayjs(taskActivity.start_time).valueOf();
			const endTime = dayjs(new Date()).valueOf();

			const totalMinutes = Math.floor(
				(endTime - startTime) / (1000 * 60)
			);
			const hours = Math.floor(totalMinutes / 60);
			const minutes = totalMinutes % 60;

			const totalWorkingHours = Number(
				`${hours}.${minutes < 10 ? "0" + minutes : minutes}`
			);

			const lastPaymentId = await paymentModel.getLastPaymentId();
			const payId = lastPaymentId && lastPaymentId?.split("-")[2];
			const paymentId = Number(payId) + 1;

			const paymentPayload = {
				application_id: application.job_application_id,
				total_amount: Number(
					(totalWorkingHours * Number(HotelierFixedCharge)).toFixed(2)
				),
				status: PAYMENT_STATUS.UNPAID,
				job_seeker_pay: Number(
					(totalWorkingHours * JobSeekerFixedCharge).toFixed(2)
				),
				platform_fee: Number(
					(totalWorkingHours * PlatformFee).toFixed(2)
				),
				payment_no: `TVZ-PAY-${paymentId}`,
			};

			console.log({ paymentPayload });

			await paymentModel.initializePayment(paymentPayload);

			await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					end_approved_at: new Date(),
					total_working_hours: totalWorkingHours,
				}
			);

			await jobPostModel.updateJobPostDetailsStatus(
				application.job_post_details_id,
				JOB_POST_DETAILS_STATUS.WorkFinished as unknown as IJobPostDetailsStatus
			);

			// await jobPostModel.updateJobPostDetailsStatus(
			// 	application.job_post_details_id,
			// 	JOB_POST_DETAILS_STATUS.In_Progress
			// );

			io.to(String(taskActivity.job_seeker_id)).emit(
				"approve-end-job-task",
				{
					id,
					start_time: taskActivity.start_time,
					end_time: taskActivity.end_time,
					total_working_hours: totalWorkingHours,
					end_approved_at: new Date(),
				}
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};
}
