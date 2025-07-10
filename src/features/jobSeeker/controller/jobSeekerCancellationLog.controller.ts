import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import CancellationReportValidator from "../../admin/utils/validator/cancellationReport.validator";
import { JobSeekerCancellationLogServices } from "../service/jobSeekerCancellationLog.service";

export class JobSeekerCancellationApplicationLogController extends AbstractController {
	private service = new JobSeekerCancellationLogServices();
	private CancellationReportValidator = new CancellationReportValidator();

	constructor() {
		super();
	}

	public getCancellationApplicationLogs = this.asyncWrapper.wrap(
		{ querySchema: this.CancellationReportValidator.reportQuerySchema },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getCancellationApplicationLog(req);
			res.status(code).json(data);
		}
	);

	public getCancellationApplicationLog = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.getSingleItemWithIdValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getCancellationApplicationLog(req);
			res.status(code).json(data);
		}
	);
}
