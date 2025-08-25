import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerApplicationService from "../services/jobSeeker.services";
import AdminJobSeekerValidator from "../utils/validator/adminJobSeeker.validator";

class AdminJobSeekerController extends AbstractController {
	private service = new JobSeekerApplicationService();
	private validator = new AdminJobSeekerValidator();

	constructor() {
		super();
	}

	public createJobSeeker = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createJobSeekerValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createJobSeeker(req);
			res.status(code).json(data);
		}
	);
	public getJobSeekers = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllJobSeekerSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getJobSeekers(req);
			res.status(code).json(data);
		}
	);
	public getSingleJobSeeker = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public updateJobSeeker = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamValidator,
			// bodySchema: this.validator.updateJobSeekerValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateJobSeeker(req);
			res.status(code).json(data);
		}
	);
	public deleteJobSeeker = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteJobSeeker(req);
			res.status(code).json(data);
		}
	);

	public getNearestJobSeekers = this.asyncWrapper.wrap(
		{
			querySchema: this.validator.latlonValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getNearestJobSeekers(req);
			res.status(code).json(data);
		}
	);
}

export default AdminJobSeekerController;
