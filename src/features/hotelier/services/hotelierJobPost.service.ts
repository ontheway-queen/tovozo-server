import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	IJobPostDetailsPayload,
	IJobPostPayload,
} from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

class HotelierJobPostService extends AbstractServices {
	public async createJobPost(req: Request) {
		const { user_id } = req.hotelier;
		const body = req.body as {
			job_post: IJobPostPayload;
			job_post_details: IJobPostDetailsPayload[];
		};
		return await this.db.transaction(async (trx) => {
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

				if (new Date(detail.start_time) >= new Date(detail.end_time)) {
					throw new CustomError(
						"Job post start time cannot be greater than or equal to end time.",
						this.StatusCode.HTTP_BAD_REQUEST
					);
				}

				jobPostDetails.push({
					...detail,
					job_post_id: res[0].id,
				});
			}

			await model.createJobPostDetails(jobPostDetails);
			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
			};
		});
	}

	public async getJobPostList(req: Request) {
		const { limit, skip, status } = req.query;
		const { user_id } = req.hotelier;
		const model = this.Model.jobPostModel();
		const data = await model.getHotelierJobPostList({
			user_id,
			limit,
			skip,
			status,
		});
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleJobPostWithJobSeekerDetails(req: Request) {
		const { id } = req.params;
		const { user_id } = req.hotelier;
		const model = this.Model.jobPostModel();
		const data = await model.getSingleJobPostWithJobSeekerDetails(
			Number(id)
		);
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
			const model = this.Model.jobPostModel(trx);
			const jobPost = await model.getSingleJobPost(Number(id));
			if (!jobPost) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			// const currentTime = new Date();
			// const startTime = new Date(jobPost.start_time);
			// const hoursDiff =
			// 	(startTime.getTime() - currentTime.getTime()) /
			// 	(1000 * 60 * 60);

			// if (hoursDiff < 24) {
			// 	throw new CustomError(
			// 		"Job post must be updated at least 24 hours in advance.",
			// 		this.StatusCode.HTTP_BAD_REQUEST
			// 	);
			// }

			const { start_time, end_time } = body?.job_post_details[0] || {};
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

			const updatedJobPost = await model.updateJobPost(
				Number(jobPost.id),
				body.job_post
			);

			if (body.job_post_details && updatedJobPost) {
				await model.updateJobPostDetails(
					Number(id),
					body.job_post_details
				);
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_OK,
				data: updatedJobPost,
			};
		});
	}

	public async cancelJobPost(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const model = this.Model.jobPostModel(trx);
			const jobPost = await model.getSingleJobPost(Number(id));
			if (!jobPost) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			// const currentTime = new Date();
			// const startTime = new Date(jobPost.start_time);
			// const hoursDiff =
			// 	(startTime.getTime() - currentTime.getTime()) /
			// 	(1000 * 60 * 60);

			// if (hoursDiff < 24) {
			// 	throw new CustomError(
			// 		"Job post must be cancelled at least 24 hours in advance.",
			// 		this.StatusCode.HTTP_BAD_REQUEST
			// 	);
			// }

			await model.cancelJobPost(Number(jobPost.job_post_id));
			await model.cancelJobPostDetails(Number(jobPost.job_post_id));

			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			await jobApplicationModel.cancelApplication(jobPost.job_post_id);

			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}
}
export default HotelierJobPostService;
