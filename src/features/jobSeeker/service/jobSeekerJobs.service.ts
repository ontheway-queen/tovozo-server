import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { JOB_POST_DETAILS_STATUS } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";

export class JobSeekerServices extends AbstractServices {
	constructor() {
		super();
	}

	public getJobPostListForJobSeeker = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { category_id, limit, skip, city_id, from_date, to_date, name } =
			req.query;
		const model = this.Model.jobPostModel();
		const { data, total } = await model.getJobPostListForJobSeeker({
			user_id,
			category_id,
			limit,
			skip,
			status: JOB_POST_DETAILS_STATUS.Pending,
			city_id,
			from_date,
			to_date,
			search: name,
		} as IGetJobPostListParams);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total: total || 0,
		};
	};

	public getSingleJobPostForJobSeeker = async (req: Request) => {
		const { id } = req.params;
		const model = this.Model.jobPostModel();
		const data = await model.getSingleJobPostForJobSeeker(Number(id));
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};

	public saveJobPostDetailsForJobSeeker = async (req: Request) => {
		const model = this.Model.jobPostModel();
		const { user_id } = req.jobSeeker;
		const id = Number(req.params.id);
		const isSaveJobExists = await model.checkSaveJob({
			job_seeker_id: user_id,
			job_post_details_id: id,
		});
		if (isSaveJobExists) {
			throw new CustomError(
				"You’ve already saved this job.",
				this.StatusCode.HTTP_CONFLICT
			);
		}

		await model.saveJobPostDetailsForJobSeeker({
			job_seeker_id: user_id,
			job_post_details_id: id,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
		};
	};

	public getSavedJobsList = async (req: Request) => {
		const model = this.Model.jobPostModel();
		const { user_id } = req.jobSeeker;
		const { skip = 0, limit = 10, need_total = true } = req.query as any;

		const result = await model.getSavedJobsList({
			job_seeker_id: user_id,
			skip: Number(skip),
			limit: Number(limit),
			need_total: need_total === "true" || need_total === true,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...result,
		};
	};

	public deleteSavedJob = async (req: Request) => {
		const model = this.Model.jobPostModel();
		const { user_id } = req.jobSeeker;
		const id = Number(req.params.id);
		const isSaveJobExists = await model.checkSaveJob({
			job_seeker_id: user_id,
			job_post_details_id: id,
		});
		if (!isSaveJobExists) {
			throw new CustomError(
				"This job is not in your saved list.",
				this.StatusCode.HTTP_CONFLICT
			);
		}

		await model.deleteSavedJob({
			job_seeker_id: user_id,
			job_post_details_id: id,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
		};
	};
}
