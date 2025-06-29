import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { IGetReportsQuery } from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import { CANCELLATION_REPORT_TYPE } from "../../../utils/miscellaneous/constants";

export class JobSeekerCancellationReportServices extends AbstractServices {
	constructor() {
		super();
	}

	public getCancellationApplicationReports = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { limit, skip, status } = req.query;
		const model = this.Model.cancellationReportModel();
		const data = await model.getJobApplicationReports({
			user_id,
			limit,
			skip,
			status,
		} as unknown as IGetReportsQuery);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	};

	public getCancellationApplicationReport = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { id } = req.params;

		const model = this.Model.cancellationReportModel();
		const data = await model.getSingleJobApplicationReport(
			Number(id),
			CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION,
			null,
			user_id
		);

		if (!data) {
			return {
				success: false,
				message: `Cancellation report with ID ${id} not found`,
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};
}
