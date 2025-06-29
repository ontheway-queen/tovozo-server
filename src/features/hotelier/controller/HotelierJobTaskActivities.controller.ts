import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierJobTaskActivitiesService from "../services/hotelierJobTaskActivities.service";

export default class HotelierJobTaskActivitiesController extends AbstractController {
	private hotelierJobTaskActivitiesService =
		new HotelierJobTaskActivitiesService();
	constructor() {
		super();
	}

	public approveJobTaskActivity = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.approveJobTaskActivity(
					req
				);
			res.status(code).json(data);
		}
	);
}
