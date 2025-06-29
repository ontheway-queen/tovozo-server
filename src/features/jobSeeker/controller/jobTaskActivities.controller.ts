import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobTaskActivitiesService from "../service/jobTaskActivities.service";
import JobTaskActivitiesValidator from "../utils/validator/jobTaskActivities.validator";

export default class JobTaskActivitiesController extends AbstractController {
	private service = new JobTaskActivitiesService();
	private validator = new JobTaskActivitiesValidator();
	constructor() {
		super();
	}

	public createJobTaskActivity = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createJobTaskActivity },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.createJobTaskActivities(req);
			res.status(code).json(data);
		}
	);
}
