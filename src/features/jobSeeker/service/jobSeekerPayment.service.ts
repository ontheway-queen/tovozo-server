import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export default class JobSeekerPaymentService extends AbstractServices {
	constructor() {
		super();
	}

	public async getJobSeekerPayments(req: Request) {
		const { user_id } = req.jobSeeker;
		const { search, limit, skip } = req.query;

		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getPaymentsForJobSeeker({
			job_seeker_id: user_id,
			search: search as string,
			limit: Number(limit),
			skip: Number(skip),
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	}
}
