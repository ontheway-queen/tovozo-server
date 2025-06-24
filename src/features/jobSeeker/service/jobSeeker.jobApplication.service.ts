import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateJobApplicationPayload } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";
import CustomError from "../../../utils/lib/customError";
import JobPostModel from "../../../models/hotelierModel/jobPostModel";
import {
	GENDER_TYPE,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";

export class JobSeekerJobApplication extends AbstractServices {
	constructor() {
		super();
	}

	public createJobApplication = async (req: Request) => {
		const { job_post_details_id } = req.body;
		const { user_id, gender } = req.jobSeeker;

		return await this.db.transaction(async (trx) => {
			const jobPostModel = new JobPostModel(trx);
			const jobPost = await jobPostModel.getSingleJobPost(
				job_post_details_id
			);

			if (!jobPost) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			if (
				jobPost.gender !== GENDER_TYPE.Other &&
				gender &&
				gender !== GENDER_TYPE.Other &&
				gender !== jobPost.gender
			) {
				throw new CustomError(
					"Your gender does not meet the eligibility criteria for this job.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			if (jobPost.status !== JOB_POST_DETAILS_STATUS.Pending) {
				throw new CustomError(
					"This job post is no longer accepting applications.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const model = this.Model.jobApplicationModel(trx);

			const payload = {
				job_post_details_id: Number(job_post_details_id),
				job_seeker_id: user_id,
				job_post_id: jobPost.job_post_id,
			};
			const res = await model.createJobApplication(
				payload as ICreateJobApplicationPayload
			);

			await model.markJobPostDetailAsApplied(Number(job_post_details_id));
			return {
				success: true,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				data: res[0]?.id,
			};
		});
	};

	public getMyJobApplications = async (req: Request) => {
		const { orderBy, orderTo, status, limit, skip } = req.query;
		const { user_id } = req.jobSeeker;

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
			message: this.ResMsg.HTTP_SUCCESSFUL,
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
				this.ResMsg.HTTP_NOT_FOUND,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_SUCCESSFUL,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};

	public cancelMyJobApplication = async (req: Request) => {
		const id = req.params.id;
		const { user_id } = req.jobSeeker;
		const model = this.Model.jobApplicationModel();
		const data = await model.cancelMyJobApplication(parseInt(id), user_id);
		if (!data) {
			throw new CustomError(
				this.ResMsg.HTTP_NOT_FOUND,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		return {
			success: true,
			message: this.ResMsg.HTTP_SUCCESSFUL,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};
}
