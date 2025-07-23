import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	ICancellationReportStatus,
	IGetReportsQuery,
} from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import CustomError from "../../../utils/lib/customError";

export default class HotelierCancellationLogService extends AbstractServices {
	constructor() {
		super();
	}

	// get cancellation reports
	public getCancellationLogs = async (req: Request) => {
		const { user_id } = req.hotelier;
		const { status, limit, skip, searchQuery, report_type } = req.query;
		const model = this.Model.cancellationLogModel();

		const data = await model.getJobPostCancellationLogs({
			user_id,
			status,
			report_type:
				report_type || CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
			limit,
			skip,
			searchQuery,
		} as unknown as IGetReportsQuery);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	};

	public getCancellationLog = async (req: Request) => {
		const { id } = req.params;
		const model = this.Model.cancellationLogModel();

		const data = await model.getSingleJobPostCancellationLog(
			Number(id),
			CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST
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

	public cancelJobPostCancellationLog = async (req: Request) => {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const model = this.Model.cancellationLogModel(trx);
			console.log({ id });
			const jobPostReport = await model.getSingleJobPostCancellationLog(
				Number(id),
				CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST
			);
			console.log({ jobPostReport });
			if (!jobPostReport) {
				throw new CustomError(
					"Job post cancellation report not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			if (jobPostReport.status !== CANCELLATION_REPORT_STATUS.PENDING) {
				throw new CustomError(
					`Only reports with status 'PENDING' can be cancelled. Current status is '${jobPostReport.status}'.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			await model.updateCancellationLogStatus(Number(id), {
				status: CANCELLATION_REPORT_STATUS.CANCELLED as unknown as ICancellationReportStatus,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	};
}
