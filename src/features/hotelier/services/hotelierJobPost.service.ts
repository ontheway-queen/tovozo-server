import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	JOB_POST_DETAILS_STATUS,
	PAY_LEDGER_TRX_TYPE,
	PAYMENT_ENTRY_TYPE,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { stripe } from "../../../utils/miscellaneous/stripe";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import {
	IGetJobPostListParams,
	IJobPostDetailsPayload,
	IJobPostDetailsStatus,
	IJobPostPayload,
} from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { IHoiteleirJob } from "../utils/types/hotelierJobPostTypes";

class HotelierJobPostService extends AbstractServices {
	public async createJobPost(req: Request) {
		const { user_id } = req.hotelier;
		const body = req.body as {
			job_post: IJobPostPayload;
			job_post_details: IJobPostDetailsPayload[];
		};
		return await this.db.transaction(async (trx) => {
			const userModel = this.Model.UserModel(trx);
			const jobSeeker = this.Model.jobSeekerModel(trx);
			const model = this.Model.jobPostModel(trx);
			const organizationModel = this.Model.organizationModel(trx);
			const jobModel = this.Model.jobModel(trx);
			const checkOrganization = await organizationModel.getOrganization({
				user_id,
			});
			if (!checkOrganization) {
				throw new CustomError(
					"Organization not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			console.log({ checkOrganization });

			const unpaidJobs = await model.getWorkFinishedJobForHotelier({
				organization_id: checkOrganization.id,
			});

			if (unpaidJobs) {
				throw new CustomError(
					"You have previous unpaid jobs. Please pay them before posting a new job.",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			body.job_post.organization_id = checkOrganization.id;

			const res = await model.createJobPost(body.job_post);

			if (!res.length) {
				throw new CustomError(
					this.ResMsg.HTTP_BAD_REQUEST,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const jobPostDetails: IJobPostDetailsPayload[] = [];

			for (const detail of body.job_post_details) {
				const checkJob = await jobModel.getSingleJob(detail.job_id);
				if (!checkJob) {
					throw new CustomError(
						"Invalid Job Category!",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}

				const start = new Date(detail.start_time);
				const end = new Date(detail.end_time);

				if (start >= end) {
					throw new CustomError(
						"Job post start time cannot be greater than or equal to end time.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}

				const diffInHours =
					(end.getTime() - start.getTime()) / (1000 * 60 * 60);
				if (diffInHours < 1) {
					throw new CustomError(
						"Job post duration must be at least 1 hour.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}

				const expireTime = new Date(detail.start_time).getTime();
				const now = Date.now();
				const delay = Math.max(expireTime - now, 0);

				const jobPostDetailsQueue = this.getQueue(
					"expire-job-post-details"
				);
				await jobPostDetailsQueue.add(
					"expire-job-post-details",
					{ id: res[0].id },
					{
						delay,
						removeOnComplete: true,
						removeOnFail: false,
					}
				);

				jobPostDetails.push({
					...detail,
					job_post_id: res[0].id,
					hourly_rate: checkJob.hourly_rate,
					job_seeker_pay: checkJob.job_seeker_pay,
					platform_fee: checkJob.platform_fee,
				});
			}

			const jobpostDetailsId = await model.createJobPostDetails(
				jobPostDetails
			);

			// Job Post Nearby
			const orgLat = parseFloat(checkOrganization.latitude as string);
			const orgLng = parseFloat(checkOrganization.longitude as string);

			const all = await jobSeeker.getJobSeekerLocation({});
			for (const seeker of all) {
				const isSeekerExists = await userModel.checkUser({
					id: seeker.user_id,
				});
				if (isSeekerExists && isSeekerExists.length < 1) {
					continue;
				}

				const seekerLat = parseFloat(seeker.latitude);
				const seekerLng = parseFloat(seeker.longitude);

				const distance = Lib.getDistanceFromLatLng(
					orgLat,
					orgLng,
					seekerLat,
					seekerLng
				);
				if (distance > 10) continue;

				console.log(
					`Job seeker ${seeker.user_id} is within ${distance.toFixed(
						2
					)} km`
				);

				await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
					user_id: seeker.user_id,
					sender_id: user_id,
					sender_type: USER_TYPE.HOTELIER,
					title: this.NotificationMsg.NEW_JOB_POST_NEARBY.title,
					content: this.NotificationMsg.NEW_JOB_POST_NEARBY.content,
					related_id: jobpostDetailsId[0].id,
					type: NotificationTypeEnum.JOB_MATCH,
				});

				const isJobSeekerOnline = await getAllOnlineSocketIds({
					user_id: seeker.user_id,
					type: seeker.type,
				});

				if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
					io.to(String(seeker.user_id)).emit(
						TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
						{
							related_id: jobpostDetailsId[0].id,
							user_id: seeker.user_id,
							photo: checkOrganization.photo,
							title: this.NotificationMsg.NEW_JOB_POST_NEARBY
								.title,
							content:
								this.NotificationMsg.NEW_JOB_POST_NEARBY
									.content,
							type: NotificationTypeEnum.JOB_MATCH,
							read_status: false,
							created_at: new Date().toISOString(),
						}
					);
				} else {
					if (isSeekerExists[0].device_id) {
						const pushNotify = await Lib.sendNotificationToMobile({
							to: isSeekerExists[0].device_id as string,
							notificationTitle:
								this.NotificationMsg.NEW_JOB_POST_NEARBY.title,
							notificationBody:
								this.NotificationMsg.NEW_JOB_POST_NEARBY
									.content,
							// data: JSON.stringify({
							// 	related_id: jobpostDetailsId[0].id,
							// 	photo: checkOrganization.photo,
							// }),
						});
						console.log({
							pushNotify,
							device_id: isSeekerExists[0].device_id,
						});
					}
				}
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
			};
		});
	}

	public async getJobPostList(req: Request) {
		const { limit, skip, status, title } = req.query;
		const { user_id } = req.hotelier;
		const model = this.Model.jobPostModel();
		const data = await model.getJobPostListForHotelier({
			user_id,
			limit,
			skip,
			status,
			title,
		} as IGetJobPostListParams);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleJobPostForHotelier(req: Request) {
		const { id } = req.params;
		const model = this.Model.jobPostModel();
		const data = await model.getSingleJobPostForHotelier(Number(id));
		if (!data) {
			throw new CustomError(
				"Job post not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async updateJobPost(req: Request) {
		const { id } = req.params;
		const body = req.body;
		return await this.db.transaction(async (trx) => {
			const jobModel = this.Model.jobModel(trx);
			const model = this.Model.jobPostModel(trx);
			const jobPost: IHoiteleirJob =
				await model.getSingleJobPostForHotelier(Number(id));
			if (!jobPost) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (
				jobPost.job_post_details_status !==
				(JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus)
			) {
				throw new CustomError(
					"The job post cannot be updated because its status is not 'Pending'.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const hasJobPost =
				body.job_post && Object.keys(body.job_post).length > 0;
			const hasJobPostDetails =
				body.job_post_details &&
				Object.keys(body.job_post_details).length > 0;

			if (hasJobPost) {
				await model.updateJobPost(
					Number(jobPost.job_post_id),
					body.job_post
				);
			}
			if (hasJobPostDetails) {
				const { job_id, start_time, end_time } = body.job_post_details;
				const job = await jobModel.getSingleJob(job_id);
				if (!job) {
					throw new CustomError(
						"The requested job with the ID is not found.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}
				if (job.is_deleted) {
					throw new CustomError(
						"This job has been deleted for some reason.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}

				if (
					start_time &&
					end_time &&
					new Date(start_time) >= new Date(end_time)
				) {
					throw new CustomError(
						"Job post start time cannot be greater than or equal to end time.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}
				await model.updateJobPostDetails(
					Number(id),
					body.job_post_details
				);
			}
			if (!hasJobPost && !hasJobPostDetails) {
				throw new CustomError(
					"No values provided to update.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}

	public async cancelJobPost(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const body = req.body;
			const { user_id } = req.hotelier;
			const model = this.Model.jobPostModel(trx);
			const cancellationLogModel = this.Model.cancellationLogModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);

			const jobPost = await model.getSingleJobPostForHotelier(Number(id));
			if (!jobPost) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (
				jobPost.job_post_details_status ===
				(JOB_POST_DETAILS_STATUS.Cancelled as unknown as typeof jobPost.job_post_details_status)
			) {
				throw new CustomError(
					"Job post already cancelled",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const report =
				await cancellationLogModel.getSingleCancellationLogWithRelatedId(
					jobPost.id
				);
			if (report) {
				throw new CustomError(
					"Conflict: This job post already has an associated cancellation report.",
					this.StatusCode.HTTP_CONFLICT
				);
			}
			const currentTime = new Date();
			const startTime = new Date(jobPost.start_time);
			const endTime = new Date(jobPost.end_time);
			const hourlyRate = jobPost.hourly_rate;
			const hoursDiff =
				(startTime.getTime() - currentTime.getTime()) /
				(1000 * 60 * 60);

			if (hoursDiff > 24) {
				await model.cancelJobPost(Number(jobPost.job_post_id));

				const vacancy = await model.getAllJobsUsingJobPostId({
					id: Number(jobPost.job_post_id),
				});

				for (const job of vacancy) {
					await model.updateJobPostDetailsStatus({
						id: Number(job.id),
						status: JOB_POST_DETAILS_STATUS.Cancelled as unknown as IJobPostDetailsStatus,
					});
				}

				await jobApplicationModel.cancelApplication(
					jobPost.job_post_id
				);

				return {
					success: true,
					message: "Your job post has been successfully cancelled.",
					code: this.StatusCode.HTTP_OK,
				};
			} else {
				const diffMs = endTime.getTime() - startTime.getTime();
				const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

				const totalAmount = Number(diffHours) * Number(hourlyRate);

				const session = await stripe.checkout.sessions.create({
					payment_method_types: ["card"],
					mode: "payment",
					line_items: [
						{
							price_data: {
								currency: "usd",
								product_data: {
									name: `Cancellation Fee for Job #${jobPost.id}`,
								},
								unit_amount: Math.round(totalAmount * 100),
							},
							quantity: 1,
						},
					],
					payment_intent_data: {
						metadata: {
							job_post_details_id: jobPost.id.toString(),
							job_title: jobPost.title,
							user_id: user_id.toString(),
							total_amount: totalAmount.toString(),
							job_seeker_id:
								jobPost?.job_seeker_details?.job_seeker_id !=
								null
									? jobPost.job_seeker_details.job_seeker_id.toString()
									: null,
							job_application_id:
								jobPost?.job_seeker_details?.application_id !==
								null
									? jobPost.job_seeker_details.application_id.toString()
									: null,
						},
					},
					success_url: `${config.BASE_URL}/hotelier/job-post/job-cancellation-payment/success?session_id={CHECKOUT_SESSION_ID}`,
					cancel_url: `${config.BASE_URL}/hotelier/job-post/job-cancellation-payment/failed`,
				});

				return {
					success: true,
					message:
						"To finalize your cancellation, please complete the payment.",
					code: this.StatusCode.HTTP_OK,
					data: { url: session.url },
				};
			}
		});
	}

	public async verifyJobCancellationPayment(req: Request) {
		return await this.db.transaction(async (trx) => {
			const sessionId = req.query.session_id as string;
			const { user_id, email } = req.hotelier;
			if (!user_id) {
				throw new CustomError(
					"Hotelier ID is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			if (!sessionId) {
				throw new CustomError(
					"Session ID is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const chatModel = this.Model.chatModel(trx);
			const organizationModel = this.Model.organizationModel(trx);
			const paymentModel = this.Model.paymnentModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);

			const organization = await organizationModel.getOrganization({
				user_id,
			});
			if (!organization) {
				throw new CustomError(
					"Organization not found for the provided Hotelier ID",
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}
			console.log({ organization });
			const session = await stripe.checkout.sessions.retrieve(sessionId);
			if (!session || session.payment_status !== "paid") {
				throw new CustomError(
					"Payment not completed or session not found",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}
			const paymentIntentId = session.payment_intent as string;
			const paymentIntent = await stripe.paymentIntents.retrieve(
				paymentIntentId,
				{
					expand: ["charges"],
				}
			);
			console.log({ paymentIntent });
			const baseLedgerPayload = {
				voucher_no: `CJP-${paymentIntent.metadata.job_post_details_id}`,
				ledger_date: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
			};

			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				trx_type: PAY_LEDGER_TRX_TYPE.IN,
				user_type: USER_TYPE.ADMIN,
				amount: Number(paymentIntent.metadata.total_amount),
				entry_type: PAYMENT_ENTRY_TYPE.INVOICE,
				details: `Cancellation fee of amount ${
					Number(paymentIntent.metadata.total_amount) / 100
				} for job '${paymentIntent.metadata.job_title}' requested by ${
					organization.name
				} has been collected.`,
			});

			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				user_id: user_id,
				trx_type: PAY_LEDGER_TRX_TYPE.OUT,
				user_type: USER_TYPE.HOTELIER,
				entry_type: PAYMENT_ENTRY_TYPE.INVOICE,
				amount: Number(paymentIntent.metadata.total_amount),
				details: `You have successfully paid a cancellation fee of amount ${Number(
					paymentIntent.metadata.total_amount
				).toFixed(2)} for the job '${
					paymentIntent.metadata.job_title
				}'.`,
			});
			const model = this.Model.jobPostModel(trx);

			const check = await model.getSingleJobPostForHotelier(
				Number(paymentIntent.metadata.job_post_details_id)
			);
			if (!check) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			console.log({ check });

			const notCancellableStatuses = [
				"Work Finished",
				"Complete",
				"Cancelled",
			];

			if (
				notCancellableStatuses.includes(check.job_post_details_status)
			) {
				throw new CustomError(
					`Can't cancel. This job post is already ${check.job_post_details_status.toLowerCase()}.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			await model.updateJobPostDetailsStatus({
				id: Number(paymentIntent.metadata.job_post_details_id),
				status: "Cancelled",
			});

			if (paymentIntent.metadata.job_seeker_id) {
				const chatSession = await chatModel.getChatSessionBetweenUsers({
					hotelier_id: user_id,
					job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
				});
				if (chatSession) {
					await chatModel.updateChatSession({
						session_id: chatSession.id,
						payload: {
							enable_chat: false,
						},
					});
				}

				await jobApplicationModel.updateMyJobApplicationStatus({
					application_id: Number(
						paymentIntent.metadata.job_application_id
					),
					job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
					status: "Cancelled",
				});
			}

			await this.insertNotification(trx, TypeUser.ADMIN, {
				user_id: user_id,
				sender_type: USER_TYPE.HOTELIER,
				title: "Payment Received for job post cancellation",
				content: `Cancellation fee of amount ${
					Number(paymentIntent.metadata.total_amount) / 100
				} for job '${paymentIntent.metadata.job_title}' requested by ${
					organization.name
				} has been collected.`,
				related_id: Number(paymentIntent.metadata.job_post_details_id),
				type: NotificationTypeEnum.PAYMENT,
			});

			await this.insertNotification(trx, USER_TYPE.HOTELIER, {
				title: "Payment done for job post cancellation",
				content: `You have successfully paid a cancellation fee of amount ${Number(
					paymentIntent.metadata.total_amount
				).toFixed(2)} for the job '${
					paymentIntent.metadata.job_title
				}'.`,
				related_id: Number(paymentIntent.metadata.job_post_details_id),
				sender_type: USER_TYPE.ADMIN,
				user_id: user_id,
				type: NotificationTypeEnum.PAYMENT,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}

	public async trackJobSeekerLocation(req: Request) {
		const { id } = req.params;
		const { job_seeker } = req.query;
		const model = this.Model.jobApplicationModel();
		const jobPost = await model.getMyJobApplication({
			job_seeker_id: Number(job_seeker),
			job_application_id: Number(id),
		});
		if (!jobPost) {
			throw new CustomError(
				"Job post not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		const now = new Date();
		const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
		const jobStartTime = new Date(jobPost.start_time);

		if (jobStartTime > twoHoursFromNow || jobStartTime < now) {
			throw new CustomError(
				"Live location sharing is only allowed within 2 hours before job start time.",
				this.StatusCode.HTTP_BAD_REQUEST
			);
		}

		return {
			success: true,
			message: "Live location sharing is allowed.",
			code: this.StatusCode.HTTP_OK,
		};
	}
}
export default HotelierJobPostService;
