import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierReportService from "../services/HotelierReport.service";
import HotelierReportValidator from "../utils/validator/hotelierReport.validator";

export default class HotelierReportController extends AbstractController {
	private validator = new HotelierReportValidator();
	private hotelierReportService = new HotelierReportService();
	constructor() {
		super();
	}

	public submitReport = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.submitReport },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.hotelierReportService.submitReport(req);
			res.status(code).json(data);
		}
	);
}
