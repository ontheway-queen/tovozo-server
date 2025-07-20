import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import PaymentService from "../services/payment.service";

export default class PaymentController extends AbstractController {
	private paymentService = new PaymentService();
	constructor() {
		super();
	}

	public getPaymentsForHotelier = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.getPaymentsForHotelier(req);
			res.status(code).json(data);
		}
	);
}
