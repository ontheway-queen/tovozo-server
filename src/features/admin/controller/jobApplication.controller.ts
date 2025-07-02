import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminJobApplicationService from "../services/jobApplication.service";

export default class AdminJobApplicationController extends AbstractController {
	private service = new AdminJobApplicationService();

	constructor() {
		super();
	}

	public assignJobApplication = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.assignJobApplication(
				req
			);
			res.status(code).json(data);
		}
	);
}
