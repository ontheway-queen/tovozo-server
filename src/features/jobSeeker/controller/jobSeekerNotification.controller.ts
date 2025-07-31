import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerNotificationService from "../service/jobSeekerNotificationService";

export default class JobSeekerNotificationController extends AbstractController {
	private services = new JobSeekerNotificationService();

	constructor() {
		super();
	}

	public getAllNotification = this.asyncWrapper.wrap(
		{ querySchema: this.commonValidator.getNotificationValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.getAllNotification(
				req
			);

			res.status(code).json(data);
		}
	);

	public deleteNotification = this.asyncWrapper.wrap(
		{
			querySchema: this.commonValidator.mutationNotificationValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.deleteNotification(
				req
			);
			res.status(code).json(data);
		}
	);

	public readNotification = this.asyncWrapper.wrap(
		{
			querySchema: this.commonValidator.mutationNotificationValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.readNotification(req);
			res.status(code).json(data);
		}
	);
}
