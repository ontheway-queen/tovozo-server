import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerPayoutService from "../service/jobSeekerPayout.service";
import JobSeekerPayoutValidator from "../utils/validator/jobSeekerPayout.validator";

export default class JobSeekerPayoutController extends AbstractController {
	private profileService = new JobSeekerPayoutService();
	private validator = new JobSeekerPayoutValidator();

	constructor() {
		super();
	}

	public requestForPayout = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.requestPayoutValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.profileService.requestForPayout(req);
			res.status(code).json(data);
		}
	);

	public getPayoutsForJobSeeker = this.asyncWrapper.wrap(
		{ querySchema: this.validator.queryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.profileService.getPayoutsForJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public getSinglePayout = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamNumValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.profileService.getSinglePayout(
				req
			);
			res.status(code).json(data);
		}
	);
}
