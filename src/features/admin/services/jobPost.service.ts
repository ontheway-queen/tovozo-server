import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";

export default class AdminJobPostService extends AbstractServices {
	constructor() {
		super();
	}

	public async getJobPostListForAdmin(req: Request) {
		const {
			limit,
			skip,
			status,
			filter: search,
			from_date,
			to_date,
		} = req.query;
		const model = this.Model.jobPostModel();
		const data = await model.getJobPostListForAdmin({
			limit: Number(limit) || 100,
			skip: Number(skip) || 0,
			status: status as string | undefined,
			search: search as string | undefined,
			from_date: from_date as string | undefined,
			to_date: to_date as string | undefined,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleJobPostForAdmin(req: Request) {
		const { id } = req.params;
		const model = this.Model.jobPostModel();
		const data = await model.getSingleJobPostForAdmin(Number(id));
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

	public async cancelJobPostByAdmin(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const model = this.Model.jobPostModel(trx);

			const check = await model.getSingleJobPostForAdmin(Number(id));
			if (!check) {
				throw new CustomError(
					"Job post not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const notCancellableStatuses = ["Work Finished", "Complete", "Cancelled"];

			if (notCancellableStatuses.includes(check.job_post_details_status)) {
				throw new CustomError(
					`Can't cancel. This job post is already ${check.job_post_details_status.toLowerCase()}.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const data = await model.updateJobPostDetailsStatus({
				id: Number(id),
				status: "Cancelled",
			});

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
		});
	}
}
