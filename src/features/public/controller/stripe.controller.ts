import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import StripeService from "../services/stripe.service";

export default class StripeController extends AbstractController {
	private stripeService = new StripeService();

	constructor() {
		super();
	}

	public onboardComplete = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.stripeService.onboardComplete(
				req
			);
			res.status(code).json(data);
		}
	);
}
