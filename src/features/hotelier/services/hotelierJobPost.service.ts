import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	IGetJobPostListParams,
	IJobPostDetailsPayload,
	IJobPostDetailsStatus,
	IJobPostPayload,
} from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import {
	CANCELLATION_REPORT_TYPE,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import { IHoiteleirJob } from "../utils/types/hotelierJobPostTypes";

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
		} as IGetJobPostListParams);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleJobPostWithJobSeekerDetails(req: Request) {
		const { id } = req.params;
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
			const jobPost: IHoiteleirJob =
				await model.getSingleJobPostWithJobSeekerDetails(Number(id));
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
				const { start_time, end_time } = body.job_post_details;
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
			const user = req.hotelier;
			const model = this.Model.jobPostModel(trx);
			const cancellationReportModel =
				this.Model.cancellationReportModel(trx);

			const jobPost = await model.getSingleJobPostWithJobSeekerDetails(
				Number(id)
			);
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
				await cancellationReportModel.getSingleReportWithRelatedId(
					jobPost.id
				);
			if (report) {
				throw new CustomError(
					this.ResMsg.HTTP_CONFLICT,
					this.StatusCode.HTTP_CONFLICT
				);
			}
			const currentTime = new Date();
			const startTime = new Date(jobPost.start_time);
			const hoursDiff =
				(startTime.getTime() - currentTime.getTime()) /
				(1000 * 60 * 60);
			console.log(jobPost);
			if (hoursDiff > 24) {
				await model.cancelJobPost(Number(jobPost.job_post_id));
				await model.updateJobPostDetailsStatus(
					Number(jobPost.id),
					JOB_POST_DETAILS_STATUS.Cancelled as unknown as IJobPostDetailsStatus
				);

				const jobApplicationModel = this.Model.jobApplicationModel(trx);
				await jobApplicationModel.cancelApplication(
					jobPost.job_post_id
				);

				return {
					success: true,
					message: "Your job post has been successfully cancelled.",
					code: this.StatusCode.HTTP_OK,
				};
			} else {
				if (
					body.report_type !==
						CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST ||
					!body.reason
				) {
					throw new CustomError(
						"Invalid request: 'report_type' and 'reason' is required.",
						this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
					);
				}

				body.reporter_id = user.user_id;
				body.related_id = id;

				const cancellationReportModel =
					this.Model.cancellationReportModel(trx);
				const data =
					await cancellationReportModel.requestForCancellationReport(
						body
					);

				return {
					success: true,
					message: this.ResMsg.HTTP_SUCCESSFUL,
					code: this.StatusCode.HTTP_OK,
					data: data[0].id,
				};
			}
		});
	}
}
export default HotelierJobPostService;
