import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerStripeService from "../service/jobSeekerStripe.service";

export default class JobSeekerStripeController extends AbstractController {
	private stripeService = new JobSeekerStripeService();

	constructor() {
		super();
	}

	// Add Strie Payout Account
	public addStripePayoutAccount = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.stripeService.addStripePayoutAccount(req);
			res.status(code).json(data);
		}
	);

	public onboardComplete = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.stripeService.onboardComplete(
				req
			);
			res.status(code).json(data);
		}
	);

	public loginStripeAccount = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.stripeService.loginStripeAccount(req);
			res.status(code).json(data);
		}
	);
}
