import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { REPORT_TYPE } from "../../../utils/miscellaneous/constants";
import { IGetReportsQuery } from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import CustomError from "../../../utils/lib/customError";

export default class HotelierCancellationReportService extends AbstractServices {
	constructor() {
		super();
	}

	// get cancellation reports
	public getCancellationReports = async (req: Request) => {
		const { user_id } = req.hotelier;
		const { status, limit, skip, search_text, report_type } = req.query;
		const model = this.Model.cancellationReportModel();

		const data = await model.getJobPostReports({
			user_id,
			status,
			report_type: report_type || REPORT_TYPE.CANCEL_JOB_POST,
			limit,
			skip,
			search_text,
		} as unknown as IGetReportsQuery);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	};

	public getCancellationReport = async (req: Request) => {
		const { id } = req.params;
		const model = this.Model.cancellationReportModel();

		const data = await model.getSingleJobPostReport(
			Number(id),
			REPORT_TYPE.CANCEL_JOB_POST
		);
		if (!data) {
			throw new CustomError(
				"Job post cancellation report not found",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data,
		};
	};
}
