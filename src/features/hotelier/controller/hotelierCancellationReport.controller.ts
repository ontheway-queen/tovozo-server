import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { HotelierJobPostValidator } from "../utils/validator/hotelierJobPost.validator";
import HotelierCancellationReportService from "../services/hotelierCancellationReport.service";
import CancellationReportValidator from "../../admin/utils/validator/cancellationReport.validator";

export default class HotelierCancellationReportController extends AbstractController {
	private service = new HotelierCancellationReportService();
	private validator = new HotelierJobPostValidator();
	private cancellationReportValidator = new CancellationReportValidator();
	constructor() {
		super();
	}

	public getCancellationReports = this.asyncWrapper.wrap(
		{ querySchema: this.cancellationReportValidator.reportQuerySchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getCancellationReports(
				req
			);
			res.status(code).json(data);
		}
	);

	public getCancellationReport = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getCancellationReport(
				req
			);
			res.status(code).json(data);
		}
	);

	public cancelJobPostReport = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.cancelJobPostReport(
				req
			);
			res.status(code).json(data);
		}
	);
}
