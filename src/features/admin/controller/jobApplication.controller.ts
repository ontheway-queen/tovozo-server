import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminJobApplicationService from "../services/jobApplication.service";
import JobApplicationValidator from "../utils/validator/jobApplication.validator";

export default class AdminJobApplicationController extends AbstractController {
	private service = new AdminJobApplicationService();
	private jobApplicationValidator = new JobApplicationValidator();
	constructor() {
		super();
	}

	public assignJobApplication = this.asyncWrapper.wrap(
		{ bodySchema: this.jobApplicationValidator.assignApplication },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.assignJobApplication(
				req
			);
			res.status(code).json(data);
		}
	);
	public getAllAdminAssignedApplications = this.asyncWrapper.wrap(
		{ querySchema: this.jobApplicationValidator.getApplicationQuery },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getAllAdminAssignedApplications(req);
			res.status(code).json(data);
		}
	);
}
