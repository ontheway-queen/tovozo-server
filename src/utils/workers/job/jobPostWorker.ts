import { db } from "../../../app/database";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CommonModel from "../../../models/commonModel/commonModel";
import JobPostModel from "../../../models/hotelierModel/jobPostModel";
import PaymentModel from "../../../models/paymentModel/paymentModel";
import Models from "../../../models/rootModel";
import Lib from "../../lib/lib";
import {
	JOB_POST_DETAILS_STATUS,
	JOB_POST_STATUS,
	PAYMENT_STATUS,
} from "../../miscellaneous/constants";
import { TypeEmitNotificationEnum } from "../../modelTypes/common/commonModelTypes";
import { TypeUser } from "../../modelTypes/user/userModelTypes";

export default class JobPostWorker {
	public async expireJobPostDetails(job: any) {
		const { id } = job.data;
		return await db.transaction(async (trx) => {
			const jobPostModel = new Models().jobPostModel(trx);
			await jobPostModel.updateJobPost(id, {
				status: JOB_POST_STATUS.Expired,
			});
			await jobPostModel.updateJobPost(id, {
				status: JOB_POST_STATUS.Expired,
			});
			const jobs = await jobPostModel.getAllJobsUsingJobPostId({
				id,
				status: "Pending",
			});
			if (jobs.length > 0) {
				await Promise.all(
					jobs.map((job) =>
						jobPostModel.updateJobPostDetailsStatus({
							id: job.id,
							status: JOB_POST_DETAILS_STATUS.Expired,
						})
					)
				);
			}
		});
	}

	public async jobStartReminder(job: any) {
		const {
			id,
			hotelier_id,
			job_seeker_id,
			photo,
			title,
			content,
			type,
			related_id,
			job_seeker_device_id,
		} = job.data;
		return await db.transaction(async (trx) => {
			const commonModel = new CommonModel(trx);
			await commonModel.createNotification({
				user_id: job_seeker_id,
				sender_id: hotelier_id,
				sender_type: TypeUser.HOTELIER,
				title,
				content,
				type,
				related_id,
			});

			const isJobSeekerOnline = await getAllOnlineSocketIds({
				user_id: job_seeker_id,
				type: TypeUser.JOB_SEEKER,
			});
			if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
				io.to(String(job_seeker_id)).emit(
					TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
					{
						user_id: job_seeker_id,
						photo,
						title,
						content,
						related_id,
						type,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (job_seeker_device_id) {
					if (job_seeker_device_id) {
						await Lib.sendNotificationToMobile({
							to: job_seeker_device_id,
							notificationTitle: title,
							notificationBody: content,
							data: JSON.stringify({
								photo,
								related_id,
							}),
						});
					}
				}
			}
		});
	}

	public async cancelHotelierJobsIfUnpaid(job: any) {
		const {
			id,
			payment_id,
			organization_id,
			hotelier_id,
			hotelier_device_id,
			photo,
			type,
			related_id,
		} = job.data;
		console.log("hotelier_id from worker", hotelier_id);
		return await db.transaction(async (trx) => {
			const paymentModel = new PaymentModel(trx);
			const payment = await paymentModel.getSinglePayment(payment_id);
			if (!payment || payment.status === PAYMENT_STATUS.PAID) {
				return;
			}

			const jobPostModel = new JobPostModel(trx);
			const { data, total } =
				await jobPostModel.getJobPostListForHotelier({
					organization_id,
					status: "Pending",
				});

			console.log({ data });

			for (const jobPost of data) {
				await jobPostModel.updateJobPostDetailsStatus({
					id: jobPost.id,
					status: "Cancelled",
				});

				await jobPostModel.updateJobPost(jobPost.job_post_id, {
					status: "Cancelled",
				});
			}

			const commonModel = new CommonModel(trx);
			await commonModel.createNotification({
				user_id: hotelier_id,
				sender_type: TypeUser.ADMIN,
				title: `Some of your jobs cancelled due to unpaid payment`,
				content: `You did not complete payment within 24 hours. ${total} job${
					(total as number) > 1 ? "s" : ""
				} have been cancelled automatically. Please contact support if needed.`,
				type,
				related_id,
			});

			const isHotelierOnline = await getAllOnlineSocketIds({
				user_id: hotelier_id,
				type: TypeUser.HOTELIER,
			});

			if (isHotelierOnline && isHotelierOnline.length > 0) {
				io.to(String(hotelier_id)).emit(
					TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION,
					{
						user_id: hotelier_id,
						photo,
						title: `Some of your jobs cancelled due to unpaid payment`,
						content: `You did not complete payment within 24 hours. ${total} job${
							(total as number) > 1 ? "s" : ""
						} have been cancelled automatically. Please contact support if needed.`,
						related_id,
						type,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				if (hotelier_device_id) {
					await Lib.sendNotificationToMobile({
						to: hotelier_device_id,
						notificationTitle: `Some of your jobs cancelled due to unpaid payment`,
						notificationBody: `You did not complete payment within 24 hours. ${total} job${
							(total as number) > 1 ? "s" : ""
						} have been cancelled automatically. Please contact support if needed.`,
						// data: JSON.stringify({
						// 	photo,
						// 	related_id,
						// }),
					});
				}
			}
		});
	}
}
