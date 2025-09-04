import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminPayoutService from "../services/payout.service";
import AdminPayoutValidator from "../utils/validator/adminPayout.validator";

export default class AdminPayoutController extends AbstractController {
	private service = new AdminPayoutService();
	private validator = new AdminPayoutValidator();

	constructor() {
		super();
	}

	public getAllPayouts = this.asyncWrapper.wrap(
		{ querySchema: this.validator.queryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllPayouts(req);
			res.status(code).json(data);
		}
	);

	public getSinglePayout = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamNumValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSinglePayout(req);
			res.status(code).json(data);
		}
	);

	public managePayout = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamNumValidator("id"),
			bodySchema: this.validator.managePayout,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.managePayout(req);
			res.status(code).json(data);
		}
	);
}
