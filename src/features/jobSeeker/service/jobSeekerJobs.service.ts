import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export class JobSeekerServices extends AbstractServices {
	constructor() {
		super();
	}

	public getJobs = async (req: Request) => {
		const model = this.Model.jobPostModel();
		const { data, total } = await model.getJobPostList({
			...req,
			limit: req.query.limit,
			skip: req.query.skip,
			status: "Pending",
		});
		return {
			success: true,
			message: this.ResMsg.HTTP_SUCCESSFUL,
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
			message: this.ResMsg.HTTP_SUCCESSFUL,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};
}
