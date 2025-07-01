import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminReportService from "../services/report.service";
import ReportValidator from "../utils/validator/report.validator";

export default class AdminReportController extends AbstractController {
	private adminReportService = new AdminReportService();
	private validator = new ReportValidator();

	constructor() {
		super();
	}

	public getReportsWithInfo = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.adminReportService.getReportsWithInfo(req);
			res.status(code).json(data);
		}
	);

	public getSingleReportWithInfo = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.adminReportService.getSingleReportWithInfo(req);
			res.status(code).json(data);
		}
	);

	public reportMarkAsAcknowledge = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.getSingleItemWithIdValidator,
			bodySchema: this.validator.markAsAcknowledgeReportSchema,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.adminReportService.reportMarkAsAcknowledge(req);
			res.status(code).json(data);
		}
	);
}
