import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierJobTaskActivitiesService from "../services/hotelierJobTaskActivities.service";
import HotelierJobTaskListValidator from "../utils/validator/hotelierJobTaskList.validator";

export default class HotelierJobTaskActivitiesController extends AbstractController {
	private hotelierJobTaskActivitiesService =
		new HotelierJobTaskActivitiesService();
	private validator = new HotelierJobTaskListValidator();
	constructor() {
		super();
	}

	public approveJobTaskActivity = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.approveJobTaskActivity(
					req
				);
			res.status(code).json(data);
		}
	);

	public createJobTaskList = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createJobTaskList },
		async (req: Request, res: Response) => {
			console.log("body", req.body);
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.createJobTaskList(
					req
				);
			res.status(code).json(data);
		}
	);

	public updateJobTaskList = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.getSingleItemWithIdValidator,
			bodySchema: this.validator.updateJobTaskList,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.updateJobTaskList(
					req
				);
			res.status(code).json(data);
		}
	);

	public deleteJobTaskList = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			console.log("id", req.params);
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.deleteJobTaskList(
					req
				);
			res.status(code).json(data);
		}
	);

	public approveEndJobTaskActivity = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.hotelierJobTaskActivitiesService.approveEndJobTaskActivity(
					req
				);
			res.status(code).json(data);
		}
	);
}
