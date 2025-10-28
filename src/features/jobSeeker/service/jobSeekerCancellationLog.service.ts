import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetJobPostListParams } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { IGetReportsQuery } from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import { CANCELLATION_REPORT_TYPE } from "../../../utils/miscellaneous/constants";

export class JobSeekerCancellationLogServices extends AbstractServices {
	constructor() {
		super();
	}

	public getCancellationApplicationLogs = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { limit, skip, status, filter } = req.query;
		const model = this.Model.cancellationLogModel();
		const data = await model.getJobApplicationCancellationLogs({
			user_id,
			limit,
			skip,
			status,
			filter,
		} as unknown as IGetReportsQuery);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	};

	public getCancellationApplicationLog = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const { id } = req.params;

		const model = this.Model.cancellationLogModel();
		const data = await model.getSingleJobApplicationCancellationLog({
			id: Number(id),
			report_type: CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION,
			reporter_id: user_id,
		});

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
