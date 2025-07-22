import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import PaymentService from "../services/payment.service";
import HotelierPaymentValidator from "../utils/validator/payment.validator";

export default class PaymentController extends AbstractController {
	private paymentService = new PaymentService();
	private validator = new HotelierPaymentValidator();
	constructor() {
		super();
	}

	public getPaymentsForHotelier = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getPaymentsForHotelierQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.getPaymentsForHotelier(req);
			res.status(code).json(data);
		}
	);

	public getSinglePaymentForHotelier = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.getSinglePaymentForHotelier(req);
			res.status(code).json(data);
		}
	);

	public createCheckoutSession = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.createCheckoutSession(req);
			res.status(code).json(data);
		}
	);

	public verifyCheckoutSession = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.verifyCheckoutSession(req);
			res.status(code).json(data);
		}
	);

	public getAllPaymentLedgerForHotelier = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.paymentService.getAllPaymentLedgerForHotelier(req);
			res.status(code).json(data);
		}
	);
}
