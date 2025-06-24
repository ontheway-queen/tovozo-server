import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerServices } from "../service/jobSeekerJobs.service";

export class JobSeekerJobsController extends AbstractController {
	private service = new JobSeekerServices();
	constructor() {
		super();
	}

	public getJobs = this.asyncWrapper.wrap(
		{ querySchema: this.commonValidator.getLimitSkipQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getJobs(req);
			res.status(code).json(data);
		}
	);

	public getJob = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getJob(req);
			res.status(code).json(data);
		}
	);
}
