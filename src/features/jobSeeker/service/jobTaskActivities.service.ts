import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	JOB_APPLICATION_STATUS,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { IUpdateJobTaskListPayload } from "../../hotelier/utils/types/hotelierJobTaskTypes";

export default class JobTaskActivitiesService extends AbstractServices {
	constructor() {
		super();
	}

	public startJobTaskActivities = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { job_application_id, job_post_details_id } = req.body;
		return await this.db.transaction(async (trx) => {
			const userModel = this.Model.UserModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);

			const jobSeeker = await userModel.checkUser({
				id: user_id,
				type: TypeUser.JOB_SEEKER,
			});
			if (jobSeeker && jobSeeker.length < 1) {
				throw new CustomError(
					"Job seeker not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const myApplication = await jobApplicationModel.getMyJobApplication(
				{
					job_application_id,
					job_seeker_id: user_id,
				}
			);
			if (!myApplication) {
				throw new CustomError(
					`Job application not found or does not belong to you.`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
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
				start_time: new Date(),
			};
			const res = await jobTaskActivitiesModel.createJobTaskActivity(
				payload
			);

			await jobApplicationModel.updateMyJobApplicationStatus({
				application_id: job_application_id,
				job_seeker_id: user_id,
				status: JOB_APPLICATION_STATUS.WaitingForApproval,
			});

			const isHotelierExists = await userModel.checkUser({
				id: myApplication.hotelier_id,
			});
			if (isHotelierExists && isHotelierExists.length < 1) {
				throw new CustomError(
					"Organization not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await this.insertNotification(trx, TypeUser.HOTELIER, {
				user_id: myApplication.hotelier_id,
				sender_id: user_id,
				sender_type: USER_TYPE.JOB_SEEKER,
				title: this.NotificationMsg.TASK_SUBMITTED_FOR_FINAL_APPROVAL
					.title,
				content:
					this.NotificationMsg.TASK_SUBMITTED_FOR_FINAL_APPROVAL.content(
						{
							id: myApplication.job_post_details_id,
							jobTitle: myApplication.job_post_title,
						}
					),
				related_id: job_post_details_id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			const isHotelierOnline = await getAllOnlineSocketIds({
				user_id: myApplication.hotelier_id,
				type: TypeUser.HOTELIER,
			});

			if (isHotelierOnline && isHotelierOnline.length > 0) {
				io.to(String(myApplication.hotelier_id)).emit(
					TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION,
					{
						user_id: myApplication.hotelier_id,
						photo: jobSeeker[0].photo,
						title: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
						content:
							this.NotificationMsg.WAITING_FOR_APPROVAL.content({
								id: myApplication.job_post_details_id,
								jobTitle: myApplication.job_post_title,
							}),
						related_id: job_post_details_id,
						type: NotificationTypeEnum.JOB_TASK,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (isHotelierExists[0].device_id) {
					await Lib.sendNotificationToMobile({
						to: isHotelierExists[0].device_id as string,
						notificationTitle:
							this.NotificationMsg.WAITING_FOR_APPROVAL.title,
						notificationBody:
							this.NotificationMsg.WAITING_FOR_APPROVAL.content({
								id: myApplication.job_post_details_id,
								jobTitle: myApplication.job_post_title,
							}),
						data: JSON.stringify({
							photo: jobSeeker[0].photo,
							related_id: job_post_details_id,
						}),
					});
				}
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};

	public toggleTaskCompletionStatus = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const id = Number(req.params.id);
		const is_completed = req.query.is_completed;
		const isCompleted = is_completed === "1" ? true : false;

		return await this.db.transaction(async (trx) => {
			const userModel = this.Model.UserModel(trx);
			const jobTaskListModel = this.Model.jobTaskListModel(trx);

			const jobSeeker = await userModel.checkUser({
				id: user_id,
				type: TypeUser.JOB_SEEKER,
			});
			if (jobSeeker && jobSeeker.length < 1) {
				throw new CustomError(
					"Job seeker not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

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

			const isHotelierExists = await userModel.checkUser({
				id: taskList[0].hotelier_id,
			});
			if (isHotelierExists && isHotelierExists.length < 1) {
				throw new CustomError(
					"Organization not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await this.insertNotification(trx, TypeUser.HOTELIER, {
				user_id: taskList[0].hotelier_id,
				sender_id: user_id,
				sender_type: USER_TYPE.JOB_SEEKER,
				title: this.NotificationMsg.TASK_STATUS.title(
					taskList[0].is_completed
				),
				content: this.NotificationMsg.TASK_STATUS.content(
					taskList[0].id,
					taskList[0].is_completed
				),
				related_id: taskList[0].id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			const isHotelierOnline = await getAllOnlineSocketIds({
				user_id: taskList[0].hotelier_id,
				type: TypeUser.HOTELIER,
			});

			if (isHotelierOnline && isHotelierOnline.length > 0) {
				io.to(String(taskList[0].hotelier_id)).emit(
					TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION,
					{
						user_id: taskList[0].hotelier_id,
						photo: jobSeeker[0].photo,
						title: this.NotificationMsg.TASK_STATUS.title(
							taskList[0].is_completed
						),
						content: this.NotificationMsg.TASK_STATUS.content(
							taskList[0].id,
							taskList[0].is_completed
						),
						related_id: taskList[0].id,
						type: NotificationTypeEnum.JOB_TASK,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (isHotelierExists[0].device_id) {
					await Lib.sendNotificationToMobile({
						to: isHotelierExists[0].device_id as string,
						notificationTitle:
							this.NotificationMsg.TASK_STATUS.title(
								taskList[0].is_completed
							),
						notificationBody:
							this.NotificationMsg.TASK_STATUS.content(
								taskList[0].id,
								taskList[0].is_completed
							),
						data: JSON.stringify({
							photo: jobSeeker[0].photo,
							related_id: taskList[0].id,
						}),
					});
				}
			}

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
			const userModel = this.Model.UserModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobTaskActivitiesModel =
				this.Model.jobTaskActivitiesModel(trx);
			const jobTaskListModel = this.Model.jobTaskListModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);

			const jobSeeker = await userModel.checkUser({ id: user_id });
			if (!jobSeeker) {
				throw new CustomError(
					"Job Seeker not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

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

			const jobPostDetails =
				await jobPostModel.getSingleJobPostForJobSeeker(
					taskActivity.job_post_details_id
				);

			if (!jobPostDetails) {
				throw new CustomError(
					"Job post details not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const jobStart = new Date(jobPostDetails.start_time);
			const jobEnd = new Date(jobPostDetails.end_time);
			const jobDurationHours =
				(jobEnd.getTime() - jobStart.getTime()) / (1000 * 60 * 60);

			if (jobDurationHours < 1) {
				throw new CustomError(
					"Job duration must be at least 1 hour.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			if (!taskActivity.start_time) {
				throw new CustomError(
					"Task activity does not have a start time.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const taskStart = new Date(taskActivity.start_time);
			const taskEnd = new Date();
			const taskDurationHours =
				(taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60);

			//! Need to uncomment later
			// if (taskDurationHours < 1) {
			// 	throw new CustomError(
			// 		"Task must be submitted only after working at least 1 hour.",
			// 		this.StatusCode.HTTP_BAD_REQUEST
			// 	);
			// }

			if (taskDurationHours < 1) {
				throw new CustomError(
					"Task must be submitted only after working at least 1 hour.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const taskList = await jobTaskListModel.getJobTaskList({
				job_task_activity_id: Number(id),
			});
			if (!taskList.length || taskList.length === 0) {
				throw new CustomError(
					"The organization has not assigned any tasks for this job yet. Please wait until tasks are assigned.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const incompleteTasks = taskList.filter(
				(task) => !task.is_completed
			);
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
			if (!myApplication) {
				throw new CustomError(
					`Job application not found or does not belong to you.`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const res = await jobTaskActivitiesModel.updateJobTaskActivity(
				taskActivity.id,
				{
					end_time: new Date(),
				}
			);

			const isHotelierExists = await userModel.checkUser({
				id: myApplication.hotelier_id,
			});
			if (isHotelierExists && isHotelierExists.length < 1) {
				throw new CustomError(
					"Organization not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await this.insertNotification(trx, TypeUser.HOTELIER, {
				user_id: myApplication.hotelier_id,
				sender_id: user_id,
				sender_type: USER_TYPE.JOB_SEEKER,
				title: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
				content: this.NotificationMsg.WAITING_FOR_APPROVAL.content({
					id: taskActivity.job_post_details_id,
					jobTitle: myApplication.job_post_title,
				}),
				related_id: res[0].id,
				type: NotificationTypeEnum.JOB_TASK,
			});

			const isHotelierOnline = await getAllOnlineSocketIds({
				user_id: myApplication.hotelier_id,
				type: TypeUser.HOTELIER,
			});

			if (isHotelierOnline && isHotelierOnline.length > 0) {
				io.to(String(myApplication.hotelier_id)).emit(
					TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION,
					{
						user_id: myApplication.hotelier_id,
						photo: jobSeeker[0].photo,
						title: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
						content:
							this.NotificationMsg.WAITING_FOR_APPROVAL.content({
								id: taskActivity.job_post_details_id,
								jobTitle: myApplication.job_post_title,
							}),
						related_id: res[0].id,
						type: NotificationTypeEnum.JOB_TASK,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (isHotelierExists[0].device_id) {
					await Lib.sendNotificationToMobile({
						to: isHotelierExists[0].device_id as string,
						notificationTitle:
							this.NotificationMsg.WAITING_FOR_APPROVAL.title,
						notificationBody:
							this.NotificationMsg.WAITING_FOR_APPROVAL.content({
								id: taskActivity.job_post_details_id,
								jobTitle: myApplication.job_post_title,
							}),
						data: JSON.stringify({
							photo: jobSeeker[0].photo,
							related_id: res[0].id,
						}),
					});
				}
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	};
}
