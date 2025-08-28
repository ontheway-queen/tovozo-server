import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export default class PayoutRequestsService extends AbstractServices {
	constructor() {
		super();
	}

	public async getAllPayoutRequests(req: Request) {
		const { search, limit, skip } = req.query;
		const payoutRequestModel = this.Model.payoutRequestModel();
		const { data, total } = await payoutRequestModel.getAllPayoutRequests({
			search: search as string,
			limit: Number(limit),
			skip: Number(skip),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			total,
			data,
		};
	}
}
