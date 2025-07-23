import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { HotelierJobPostValidator } from "../utils/validator/hotelierJobPost.validator";
import CancellationReportValidator from "../../admin/utils/validator/cancellationReport.validator";
import HotelierCancellationLogService from "../services/hotelierCancellationLog.service";

export default class HotelierCancellationLogController extends AbstractController {
	private service = new HotelierCancellationLogService();
	private validator = new HotelierJobPostValidator();
	private cancellationReportValidator = new CancellationReportValidator();
	constructor() {
		super();
	}

	public getCancellationLogs = this.asyncWrapper.wrap(
		{ querySchema: this.cancellationReportValidator.reportQuerySchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getCancellationLogs(
				req
			);
			res.status(code).json(data);
		}
	);

	public getCancellationLog = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getCancellationLog(
				req
			);
			res.status(code).json(data);
		}
	);

	public cancelJobPostCancellationLog = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.cancelJobPostCancellationLog(req);
			res.status(code).json(data);
		}
	);
}
