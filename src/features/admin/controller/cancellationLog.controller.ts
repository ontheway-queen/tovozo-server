import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import CancellationReportValidator from "../utils/validator/cancellationReport.validator";
import CancellationReportService from "../services/cancellationLog.service";

class CancellationReportController extends AbstractController {
	private service = new CancellationReportService();
	private validator = new CancellationReportValidator();

	constructor() {
		super();
	}

	public getCancellationLogs = this.asyncWrapper.wrap(
		{ querySchema: this.validator.reportQuerySchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getCancellationLogs(
				req
			);
			res.status(code).json(data);
		}
	);

	public getSingleCancellationLog = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleCancellationLog(req);
			res.status(code).json(data);
		}
	);

	public updateCancellationLogStatus = this.asyncWrapper.wrap(
		{
			bodySchema: this.validator.cancellationReportSchema,
			paramSchema: this.commonValidator.getSingleItemWithIdValidator,
			querySchema: this.validator.reportTypeQuerySchema,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.updateCancellationLogStatus(req);
			res.status(code).json(data);
		}
	);
}

export default CancellationReportController;
