import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

export default class AdminPaymentService extends AbstractServices {
	constructor() {
		super();
	}

	public async getAllPaymentsForAdmin(req: Request) {
		const { search, limit, skip, status } = req.query;

		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getAllPaymentsForAdmin({
			search: search as string,
			limit: Number(limit),
			skip: Number(skip),
			status: status as string,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	}

	public async getSinglePayment(req: Request) {
		const { id } = req.params;
		const paymentModel = this.Model.paymnentModel();
		const payment = await paymentModel.getSinglePayment(Number(id));
		if (!payment) {
			return {
				success: false,
				message: this.ResMsg.HTTP_NOT_FOUND,
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: payment,
		};
	}

	public async getAllPaymentLedgersForAdmin(req: Request) {
		const { search, limit, skip } = req.query;
		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getAllPaymentLedgerForAdmin({
			search: search as string,
			limit: Number(limit),
			skip: Number(skip),
			type: TypeUser.ADMIN,
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
