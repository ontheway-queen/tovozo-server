import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerPaymentService from "../service/jobSeekerPayment.service";
import JobSeekerPaymentValidator from "../utils/validator/payment.validator";

export default class JobSeekerPaymentController extends AbstractController {
	private service = new JobSeekerPaymentService();
	private validator = new JobSeekerPaymentValidator();
	constructor() {
		super();
	}

	public getJobSeekerPayments = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getPaymentsForJobSeekerQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getJobSeekerPayments(
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

	public getAllPaymentLedgersForJobSeeker = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getAllPaymentLedgersForJobSeeker(req);
			res.status(code).json(data);
		}
	);
}
