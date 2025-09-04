import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminPaymentService from "../services/adminPayment.service";
import AdminPaymentValidator from "../utils/validator/adminPayment.validator";

export default class AdminPaymentController extends AbstractController {
	private service = new AdminPaymentService();
	private validator = new AdminPaymentValidator();

	constructor() {
		super();
	}

	public getAllPaymentsForAdmin = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllPaymentsForAdmin(
				req
			);
			res.status(code).json(data);
		}
	);

	public getSinglePayment = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSinglePayment(req);
			res.status(code).json(data);
		}
	);

	public getAllPaymentLedgersForAdmin = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllPaymentLedgerQuery },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getAllPaymentLedgersForAdmin(req);
			res.status(code).json(data);
		}
	);
}
