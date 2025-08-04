import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerServices } from "../service/jobSeekerJobs.service";

export class JobSeekerJobsController extends AbstractController {
	private service = new JobSeekerServices();
	constructor() {
		super();
	}

	public getJobPostListForJobSeeker = this.asyncWrapper.wrap(
		{ querySchema: this.commonValidator.getLimitSkipQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getJobPostListForJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public getSingleJobPostForJobSeeker = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleJobPostForJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public saveJobPostDetailsForJobSeeker = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.saveJobPostDetailsForJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public getSavedJobsList = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSavedJobsList(req);
			res.status(code).json(data);
		}
	);

	public deleteSavedJob = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteSavedJob(req);
			res.status(code).json(data);
		}
	);
}
