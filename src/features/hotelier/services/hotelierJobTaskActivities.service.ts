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
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { IUpdateJobTaskListPayload } from "../utils/types/hotelierJobTaskTypes";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

export default class HotelierJobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public approveJobTaskActivity = async (req: Request) => {
		const id = req.params.id;
		const { user_id } = req.hotelier;
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
				JOB_APPLICATION_STATUS.WaitingForApproval
			) {
				throw new CustomError(
					`You cannot perform this action because the job application is not awaiting approval.`,
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

			await jobApplicationModel.updateMyJobApplicationStatus({
				application_id: taskActivity.job_application_id,
				job_seeker_id: taskActivity.job_seeker_id,
				status: JOB_APPLICATION_STATUS.ASSIGNED,
			});

			const res = await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					start_time: new Date(),
					start_approved_at: new Date(),
				}
			);

			await jobPostModel.updateJobPostDetailsStatus({
				id: application.job_post_details_id,
				status: JOB_POST_DETAILS_STATUS.In_Progress as unknown as IJobPostDetailsStatus,
			});

			await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: taskActivity.job_seeker_id,
				sender_id: user_id,
				sender_type: USER_TYPE.HOTELIER,
				title: this.NotificationMsg.JOB_ASSIGNED.title,
				content: this.NotificationMsg.JOB_ASSIGNED.content({
					id: application.job_post_details_id,
					jobTitle: application.job_post_title,
				}),
				related_id: res[0].id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			io.to(String(taskActivity.job_seeker_id)).emit(
				TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
				{
					user_id: taskActivity.job_seeker_id,
					title: this.NotificationMsg.JOB_ASSIGNED.title,
					content: this.NotificationMsg.JOB_ASSIGNED.content({
						id: application.job_post_details_id,
						jobTitle: application.job_post_title,
					}),
					related_id: res[0].id,
					type: NotificationTypeEnum.JOB_TASK,
					read_status: false,
					created_at: new Date().toISOString(),
				}
			);

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public createJobTaskList = async (req: Request) => {
		const { user_id } = req.hotelier;
		const body = req.body as {
			job_task_activity_id: number;
			tasks: { message: string }[];
		};

		return await this.db.transaction(async (trx) => {
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
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
					JOB_APPLICATION_STATUS.ASSIGNED &&
				!taskActivity.start_time
			) {
				throw new CustomError(
					`You cannot perform this action because the application is not in progress. Your application status is ${taskActivity.application_status}`,
					this.StatusCode.HTTP_FORBIDDEN
				);
			}
			if (taskActivity.end_time) {
				throw new CustomError(
					"You cannot add task. Because It has already been submitted for approval.",
					this.StatusCode.HTTP_BAD_REQUEST
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

			await jobApplicationModel.updateMyJobApplicationStatus({
				application_id: taskActivity.job_application_id,
				job_seeker_id: taskActivity.job_seeker_id,
				status: JOB_APPLICATION_STATUS.IN_PROGRESS,
			});

			const allMessages = taskList
				.map((task, index) => `${index + 1}. ${task.message}`)
				.join("\n");

			await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: taskActivity.job_seeker_id,
				sender_id: user_id,
				sender_type: USER_TYPE.HOTELIER,
				title: this.NotificationMsg.NEW_TASKS_ASSIGNED.title,
				content: allMessages,
				related_id: taskActivity.job_application_id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			io.to(String(taskActivity.job_seeker_id)).emit(
				TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
				{
					user_id: taskActivity.job_seeker_id,
					title: this.NotificationMsg.NEW_TASKS_ASSIGNED.title,
					content: allMessages,
					related_id: res[0].id,
					type: NotificationTypeEnum.JOB_TASK,
					read_status: false,
					created_at: new Date().toISOString(),
				}
			);

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
		const { user_id } = req.hotelier;
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

			const jobPost = await jobPostModel.getSingleJobPostForAdmin(
				application.job_post_details_id
			);

			await jobApplicationModel.updateMyJobApplicationStatus({
				application_id: taskActivity.job_application_id,
				job_seeker_id: taskActivity.job_seeker_id,
				status: JOB_APPLICATION_STATUS.ENDED,
			});

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

			const hourlyRate = Number(jobPost.hourly_rate);
			const jobSeekerPayRate = Number(jobPost.job_seeker_pay);
			const platformFeeRate = Number(jobPost.platform_fee);

			const baseAmount = Number(
				(totalWorkingHours * hourlyRate).toFixed(2)
			);

			// Transaction fee (e.g., 2.9% + 0.30)
			const feePercentage = 0.029;
			const fixedFee = 0.3;
			const transactionFee = Number(
				(baseAmount * feePercentage + fixedFee).toFixed(2)
			);

			// Total amount includes transaction fee
			const totalAmount = Number(
				(baseAmount + transactionFee).toFixed(2)
			);

			const jobSeekerPay = Number(
				(totalWorkingHours * jobSeekerPayRate).toFixed(2)
			);

			const platformFee = Number(
				(totalWorkingHours * platformFeeRate).toFixed(2)
			);

			const paymentPayload = {
				application_id: application.job_application_id,
				total_amount: totalAmount,
				status: PAYMENT_STATUS.UNPAID,
				job_seeker_pay: jobSeekerPay,
				platform_fee: platformFee,
				trx_fee: transactionFee,
				payment_no: `TVZ-PAY-${paymentId}`,
			};

			await paymentModel.initializePayment(paymentPayload);

			const res = await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					end_approved_at: new Date(),
					total_working_hours: totalWorkingHours,
				}
			);

			await jobPostModel.updateJobPostDetailsStatus({
				id: application.job_post_details_id,
				status: JOB_POST_DETAILS_STATUS.WorkFinished as unknown as IJobPostDetailsStatus,
			});

			await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: taskActivity.job_seeker_id,
				sender_id: user_id,
				sender_type: USER_TYPE.HOTELIER,
				title: this.NotificationMsg.TASK_UNDER_REVIEW.title,
				content: this.NotificationMsg.TASK_UNDER_REVIEW.content(
					application.job_post_details_id
				),
				related_id: res[0].id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			io.to(String(taskActivity.job_seeker_id)).emit(
				TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
				{
					user_id: taskActivity.job_seeker_id,
					title: this.NotificationMsg.TASK_UNDER_REVIEW.title,
					content: this.NotificationMsg.TASK_UNDER_REVIEW.content(
						application.job_post_details_id
					),
					related_id: res[0].id,
					type: NotificationTypeEnum.JOB_TASK,
					read_status: false,
					created_at: new Date().toISOString(),
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
