import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerCancellationReportServices } from "../service/jobSeekerCancellationReport.service";
import CancellationReportValidator from "../../admin/utils/validator/cancellationReport.validator";

export class JobSeekerCancellationApplicationReportController extends AbstractController {
	private service = new JobSeekerCancellationReportServices();
	private CancellationReportValidator = new CancellationReportValidator();

	constructor() {
		super();
	}

	public getgetCancellationApplicationReports = this.asyncWrapper.wrap(
		{ querySchema: this.CancellationReportValidator.reportQuerySchema },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getCancellationApplicationReports(req);
			res.status(code).json(data);
		}
	);

	public getCancellationApplicationReport = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getCancellationApplicationReport(req);
			res.status(code).json(data);
		}
	);
}
