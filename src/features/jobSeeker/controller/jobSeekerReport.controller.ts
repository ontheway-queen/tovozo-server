import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerReportService from "../service/jobSeekerReport.service";
import HotelierReportValidator from "../../hotelier/utils/validator/hotelierReport.validator";

export default class JobSeekerReportController extends AbstractController {
	private validator = new HotelierReportValidator();
	private jobSeekerReportService = new JobSeekerReportService();
	constructor() {
		super();
	}

	public submitReport = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.submitReport },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.jobSeekerReportService.submitReport(req);
			res.status(code).json(data);
		}
	);
}
