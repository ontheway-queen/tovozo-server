import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import { REPORT_TYPE } from "../../../utils/miscellaneous/constants";
import {
	IReportStatus,
	IReportType,
} from "../../../utils/modelTypes/report/reportModel.types";

export default class JobSeekerReportService extends AbstractServices {
	constructor() {
		super();
	}

	public submitReport = async (req: Request) => {
		console.log(req.body);
		const body = req.body;
		const model = this.Model.reportModel();
		const isReportExist = await model.getSingleReport(
			body.job_post_details_id
		);

		if (
			isReportExist &&
			isReportExist.report_type === REPORT_TYPE.JobPost
		) {
			throw new CustomError(
				`A report is already submitted for the job post.`,
				this.StatusCode.HTTP_CONFLICT
			);
		}

		const res = await model.submitReport({ ...body });

		if (!res.length) {
			throw new CustomError(
				`Failed to submit the report. Please try again later.`,
				this.StatusCode.HTTP_BAD_REQUEST
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: res[0]?.id,
		};
	};
}
