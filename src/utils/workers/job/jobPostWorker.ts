import { db } from "../../../app/database";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CommonModel from "../../../models/commonModel/commonModel";
import Models from "../../../models/rootModel";
import Lib from "../../lib/lib";
import {
	JOB_POST_DETAILS_STATUS,
	JOB_POST_STATUS,
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
		console.log({ data: job.data });
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
}
