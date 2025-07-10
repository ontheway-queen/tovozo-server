import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { JOB_POST_DETAILS_STATUS } from "../../../utils/miscellaneous/constants";

export class JobSeekerServices extends AbstractServices {
	constructor() {
		super();
	}

	public getJobs = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const model = this.Model.jobPostModel();
		const { data, total } = await model.getJobPostList({
			...req,
			user_id,
			category_id: req.query.category_id,
			limit: req.query.limit,
			skip: req.query.skip,
			status: JOB_POST_DETAILS_STATUS.Pending,
		} as IGetJobPostListParams);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total: total || 0,
		};
	};

	public getJob = async (req: Request) => {
		const { id } = req.params;
		const model = this.Model.jobPostModel();
		const data = await model.getSingleJobPost(Number(id));
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};
}
