import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export default class PaymentService extends AbstractServices {
	constructor() {
		super();
	}

	public async getPaymentsForHotelier(req: Request) {
		const { limit, skip, search } = req.query;
		const { user_id } = req.hotelier;
		const params = {
			hotelier_id: user_id,
			limit: Number(limit) || 100,
			skip: Number(skip) || 0,
			search: search ? String(search) : "",
		};
		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getPaymentsForHotelier(
			params
		);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	}
}
