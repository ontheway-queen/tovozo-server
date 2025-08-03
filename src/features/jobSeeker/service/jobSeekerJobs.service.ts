import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { JOB_POST_DETAILS_STATUS } from "../../../utils/miscellaneous/constants";

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
}
