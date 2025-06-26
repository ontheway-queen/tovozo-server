import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_STATUS_ENUM,
	JOB_POST_DETAILS_STATUS,
	REPORT_TYPE,
} from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";
import {
	ICancellationReport,
	IGetReportsQuery,
} from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

class CancellationReportService extends AbstractServices {
	// get reports
	public async getReports(req: Request) {
		const query: IGetReportsQuery = req.query as any;
		const model = this.Model.cancellationReportModel();
		console.log(query);
		if (
			query.report_type !== REPORT_TYPE.CANCEL_APPLICATION &&
			query.report_type !== REPORT_TYPE.CANCEL_JOB_POST
		) {
			throw new CustomError(
				"Report type is invalid. Please add report type in the query",
				this.StatusCode.HTTP_BAD_REQUEST
			);
		}

		let data;
		if (query.report_type === REPORT_TYPE.CANCEL_JOB_POST) {
			data = await model.getJobPostReports(query);
		} else if (query.report_type === REPORT_TYPE.CANCEL_APPLICATION) {
			data = await model.getJobApplicationReports(query);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	}

	// get single report
	public async getSingleReport(req: Request) {
		const { id } = req.params as unknown as { id: number };
		const { report_type } = req.query;
		const model = this.Model.cancellationReportModel();

		let data;
		if (report_type === REPORT_TYPE.CANCEL_APPLICATION) {
			data = await model.getSingleJobApplicationReport(id, report_type);
		} else if (report_type === REPORT_TYPE.CANCEL_JOB_POST) {
			data = await model.getSingleJobPostReport(id, report_type);
		}

		if (!data) {
			throw new CustomError(
				this.ResMsg.HTTP_NOT_FOUND,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data,
		};
	}

	// update cancellation report statu
	public async updateCancellationReportStatus(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.admin;
			const body = req.body;
			const id = req.params.id;
			const { report_type } = req.query;

			const reportModel = this.Model.cancellationReportModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);

			let report;
			if (report_type === REPORT_TYPE.CANCEL_JOB_POST) {
				report = await reportModel.getSingleJobPostReport(
					Number(id),
					report_type
				);
			} else if (report_type === REPORT_TYPE.CANCEL_APPLICATION) {
				report = await reportModel.getSingleJobApplicationReport(
					Number(id),
					report_type
				);
			}

			if (!report) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			if (report.status !== CANCELLATION_REPORT_STATUS.PENDING) {
				throw new CustomError(
					`${report.status} status can't be ${body.status} again`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			body.reviewed_by = user_id;
			body.reviewed_at = new Date().toISOString();
			body.reject_reason =
				body.status === CANCELLATION_REPORT_STATUS.REJECTED
					? body.reject_reason
					: null;

			if (body.status === CANCELLATION_REPORT_STATUS.APPROVED) {
				await reportModel.updateCancellationReportStatus(
					Number(id),
					body
				);
				if (report_type === REPORT_TYPE.CANCEL_JOB_POST) {
					const jobPost = await jobPostModel.getSingleJobPost(
						report.id
					);

					await jobPostModel.cancelJobPost(
						Number(jobPost.job_post_id)
					);
					await jobPostModel.updateJobPostDetailsStatus(
						Number(jobPost.job_post_id),
						JOB_POST_DETAILS_STATUS.Cancelled as unknown as IJobPostDetailsStatus
					);
					await jobApplicationModel.cancelApplication(
						Number(jobPost.job_post_id)
					);
				} else if (report_type === REPORT_TYPE.CANCEL_APPLICATION) {
					const application =
						await jobApplicationModel.cancelMyJobApplication(
							report.related_id,
							report.reporter_id
						);
					await jobPostModel.updateJobPostDetailsStatus(
						application,
						JOB_POST_DETAILS_STATUS.Applied as unknown as IJobPostDetailsStatus
					);
				}
			} else {
				await reportModel.updateCancellationReportStatus(
					Number(id),
					body
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
			};
		});
	}
}

export default CancellationReportService;
