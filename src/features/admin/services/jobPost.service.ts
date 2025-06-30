import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import CustomError from "../../../utils/lib/customError";

export default class AdminJobPostService extends AbstractServices {
	constructor() {
		super();
	}

	public async getAllJobPosts(req: Request) {
		const { limit, skip, status } = req.query;
		const model = this.Model.jobPostModel();
		const data = await model.getHotelierJobPostList({
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

	public async getSingleJobPost(req: Request) {
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
}
