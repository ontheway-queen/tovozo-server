import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CancellationLogModel from "../../../models/cancellationLogModel/cancellationLogModel";
import JobPostModel from "../../../models/hotelierModel/jobPostModel";
import UserModel from "../../../models/userModel/userModel";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";

import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { ICreateJobApplicationPayload } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

export class JobSeekerJobApplication extends AbstractServices {
	constructor() {
		super();
	}

	public createJobApplication = async (req: Request) => {
		const { job_post_details_id } = req.body;
		const { user_id } = req.jobSeeker;

		return await this.db.transaction(async (trx) => {
			const userModel = new UserModel(trx);
			const jobPostModel = new JobPostModel(trx);
			const jobSeekerModel = this.Model.jobSeekerModel(trx);
			const cancellationLogModel = new CancellationLogModel(trx);

			const jobSeekerUser = await userModel.checkUser({ id: user_id });
			if (!jobSeekerUser) {
				throw new CustomError(
					"User not found with related ID.",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const jobSeeker = await jobSeekerModel.getJobSeekerDetails({
				user_id,
			});
			if (!jobSeeker) {
				throw new CustomError(
					"Job seeker not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			if (!jobSeeker.final_completed) {
				throw new CustomError(
					"Your ID copy and work permit have been submitted and are pending admin review. Please wait until your documents are approved before continuing with the application process.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const jobPost = await jobPostModel.getSingleJobPostForJobSeeker(
				job_post_details_id
			);
			if (!jobPost) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			if (
				jobPost.status !==
				(JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus)
			) {
				throw new CustomError(
					"This job post is no longer accepting applications.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const jobPostReport =
				await cancellationLogModel.getSingleJobPostCancellationLog({
					id: null,
					report_type: CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
					related_id: job_post_details_id,
				});
			if (
				jobPostReport &&
				jobPostReport.status === CANCELLATION_REPORT_STATUS.PENDING
			) {
				throw new CustomError(
					"A cancellation request is already pending for this job post.",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			const model = this.Model.jobApplicationModel(trx);

			const existPendingApplication = await model.getMyJobApplication({
				job_seeker_id: user_id,
			});

			//! Need to uncomment later.
			if (
				existPendingApplication &&
				(existPendingApplication.job_application_status ===
					JOB_APPLICATION_STATUS.PENDING ||
					existPendingApplication.job_application_status ===
						JOB_APPLICATION_STATUS.IN_PROGRESS)
			) {
				throw new CustomError(
					"Hold on! You need to complete your current job before moving on to the next.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const payload = {
				job_post_details_id: Number(job_post_details_id),
				job_seeker_id: user_id,
				job_post_id: jobPost.job_post_id,
			};
			await model.createJobApplication(
				payload as ICreateJobApplicationPayload
			);

			await model.markJobPostDetailAsApplied(Number(job_post_details_id));

			const isSaveJobExists = await jobPostModel.checkSaveJob({
				job_post_details_id,
			});
			if (isSaveJobExists) {
				await jobPostModel.deleteSavedJob({ job_post_details_id });
			}

			const hotelier = await userModel.checkUser({
				id: jobPost.hotelier_id,
				type: TypeUser.HOTELIER,
			});
			if (hotelier && hotelier.length < 1) {
				throw new CustomError(
					"Organization not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const startTime = new Date(jobPost.start_time);
			// Job start reminder queue start from here
			const reminderTime = new Date(
				startTime.getTime() - 2 * 60 * 60 * 1000
			);
			const jobStartReminderQueue = this.getQueue("jobStartReminder");
			await jobStartReminderQueue.add(
				"jobStartReminder",
				{
					id: jobPost.id,
					hotelier_id: jobPost.hotelier_id,
					job_seeker_id: user_id,
					photo: hotelier[0].photo,
					title: this.NotificationMsg.JOB_START_REMINDER.title,
					content: this.NotificationMsg.JOB_START_REMINDER.content({
						jobTitle: jobPost.job_title,
						startTime: new Date(jobPost.start_time),
					}),
					type: NotificationTypeEnum.JOB_TASK,
					related_id: jobPost.id,
					job_seeker_device_id: jobSeekerUser[0].device_id,
				},
				{
					delay: reminderTime.getTime() - Date.now(),
					removeOnComplete: true,
					removeOnFail: false,
				}
			);
			console.log({ startTime });
			// Chat Session Create Message queue start from here
			const oneHourBeforeStart = new Date(
				startTime.getTime() - 2 * 60 * 60 * 1000
			);
			console.log({ oneHourBeforeStart });
			const chatSessionDelay = oneHourBeforeStart.getTime() - Date.now();
			const safeDelay = chatSessionDelay > 0 ? chatSessionDelay : 0;

			const chatSessionQueue = this.getQueue("chatSessionCreator");
			await chatSessionQueue.add(
				"chatSessionCreator",
				{
					hotelier_id: jobPost.hotelier_id,
					job_seeker_id: user_id,
					job_post_id: jobPost.job_post_id,
				},
				{
					delay: safeDelay,
					removeOnComplete: true,
					removeOnFail: false,
				}
			);

			await this.insertNotification(trx, TypeUser.HOTELIER, {
				user_id: jobPost.hotelier_id,
				sender_id: user_id,
				sender_type: TypeUser.JOB_SEEKER,
				title: this.NotificationMsg.JOB_APPLICATION_RECEIVED.title,
				content: this.NotificationMsg.JOB_APPLICATION_RECEIVED.content({
					jobTitle: jobPost.job_title,
					jobPostId: jobPost.id,
				}),
				type: NotificationTypeEnum.APPLICATION_UPDATE,
				related_id: jobPost.id,
			});

			const isHotelierOnline = await getAllOnlineSocketIds({
				user_id: jobPost.hotelier_id,
				type: TypeUser.HOTELIER,
			});
			if (isHotelierOnline && isHotelierOnline.length > 0) {
				io.to(String(jobPost.hotelier_id)).emit(
					TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION,
					{
						user_id,
						photo: jobSeekerUser[0].photo,
						title: this.NotificationMsg.JOB_APPLICATION_RECEIVED
							.title,
						content:
							this.NotificationMsg.JOB_APPLICATION_RECEIVED.content(
								{
									jobTitle: jobPost.job_title,
									jobPostId: jobPost.id,
								}
							),
						related_id: jobPost.id,
						type: NotificationTypeEnum.APPLICATION_UPDATE,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (hotelier[0].device_id) {
					const device_id = hotelier[0].device_id;
					await Lib.sendNotificationToMobile({
						to: hotelier[0].device_id,
						notificationTitle:
							this.NotificationMsg.JOB_APPLICATION_RECEIVED.title,
						notificationBody:
							this.NotificationMsg.JOB_APPLICATION_RECEIVED.content(
								{
									jobTitle: jobPost.job_title,
									jobPostId: jobPost.id,
								}
							),
						data: JSON.stringify({
							photo: jobSeekerUser[0].photo,
							related_id: jobPost.id,
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

	public getMyJobApplications = async (req: Request) => {
		const { orderBy, orderTo, status, limit, skip } = req.query;
		const { user_id } = req.jobSeeker;
		console.log({ user_id });
		const model = this.Model.jobApplicationModel();
		const { data, total } = await model.getMyJobApplications({
			user_id,
			status: status as string,
			limit: limit ? Number(limit) : 100,
			skip: skip ? Number(skip) : 0,
			orderBy: orderBy as string,
			orderTo: orderTo as "asc" | "desc",
		});
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	};

	public getMyJobApplication = async (req: Request) => {
		const id = req.params.id;
		const { user_id } = req.jobSeeker;
		const model = this.Model.jobApplicationModel();
		const data = await model.getMyJobApplication({
			job_application_id: parseInt(id),
			job_seeker_id: user_id,
		});
		if (!data) {
			throw new CustomError(
				`The job application with ID ${id} was not found.`,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};

	public cancelMyJobApplication = async (req: Request) => {
		return await this.db.transaction(async (trx) => {
			const id = req.params.id;
			const { user_id } = req.jobSeeker;
			const body = req.body;

			const applicationModel = this.Model.jobApplicationModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const application = await applicationModel.getMyJobApplication({
				job_application_id: Number(id),
				job_seeker_id: Number(user_id),
			});

			if (!application) {
				throw new CustomError(
					"Application not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (
				application.job_application_status !==
				JOB_APPLICATION_STATUS.PENDING
			) {
				throw new CustomError(
					"This application cannot be cancelled because it has already been processed.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const cancellationLogModel = this.Model.cancellationLogModel(trx);
			const isReportExists =
				await cancellationLogModel.getSingleCancellationLogWithRelatedId(
					Number(id)
				);
			if (isReportExists) {
				throw new CustomError(
					"A cancellation report for this application is already pending.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const currentTime = new Date();
			const startTime = new Date(application?.start_time);
			const hoursDiff =
				(startTime.getTime() - currentTime.getTime()) /
				(1000 * 60 * 60);

			if (hoursDiff > 24) {
				const data =
					await applicationModel.updateMyJobApplicationStatus({
						application_id: parseInt(id),
						job_seeker_id: user_id,
						status: JOB_APPLICATION_STATUS.CANCELLED,
					});

				if (!data) {
					throw new CustomError(
						"Application data with the requested id not found",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}

				await jobPostModel.updateJobPostDetailsStatus({
					id: data.job_post_details_id,
					status: JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus,
				});

				return {
					success: true,
					message: this.ResMsg.HTTP_OK,
					code: this.StatusCode.HTTP_OK,
				};
			} else {
				if (
					body.report_type !==
						CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION ||
					!body.reason
				) {
					throw new CustomError(
						"Cancellation report must include a valid reason and type 'CANCEL_APPLICATION'.",
						this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
					);
				}
				body.reporter_id = user_id;
				body.related_id = id;

				const cancellationReportModel =
					this.Model.cancellationLogModel(trx);
				await cancellationReportModel.requestForCancellationLog(body);

				return {
					success: true,
					message: this.ResMsg.HTTP_OK,
					code: this.StatusCode.HTTP_OK,
				};
			}
		});
	};
}
