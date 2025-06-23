import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerJobApplication } from "../service/jobSeeker.jobApplication.service";
import Joi from "joi";
import JobApplicationValidator from "../utils/validator/jobApplication.validator";

export class JobSeekerJobApplicationController extends AbstractController {
	private service = new JobSeekerJobApplication();
	private validator = new JobApplicationValidator();
	constructor() {
		super();
	}

	public createJobApplication = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createJobApplicationValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createJobApplication(
				req
			);
			res.status(code).json(data);
		}
	);

	public getMyJobApplications = this.asyncWrapper.wrap(
		{ querySchema: Joi.object().unknown(true) },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getMyJobApplications(
				req
			);
			res.status(code).json(data);
		}
	);

	public getMyJobApplication = this.asyncWrapper.wrap(
		{ paramSchema: Joi.object({ id: Joi.string().required() }) },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getMyJobApplication(
				req
			);
			res.status(code).json(data);
		}
	);
}
