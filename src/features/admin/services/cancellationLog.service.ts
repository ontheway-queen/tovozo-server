import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import {
	ICancellationReportStatus,
	ICancellationReportType,
} from "../../../utils/modelTypes/cancellationReport/cancellationReport.types";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

class CancellationLogService extends AbstractServices {
	// get reports
	public async getCancellationLogs(req: Request) {
		const { report_type, status, skip, limit, name } = req.query;

		const model = this.Model.cancellationLogModel();

		const data = await model.getCancellationLogsForAdmin({
			report_type: report_type as ICancellationReportType,
			status: status as ICancellationReportStatus,
			skip: Number(skip),
			limit: Number(limit),
			name: name as string,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	}

	// get single report
	public async getSingleCancellationLog(req: Request) {
		const { id } = req.params as unknown as { id: number };
		const { report_type } = req.query;
		const model = this.Model.cancellationLogModel();

		let data;
		if (report_type === CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION) {
			data = await model.getSingleJobApplicationCancellationLog({
				id,
				report_type,
			});
		} else if (report_type === CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
			data = await model.getSingleJobPostCancellationLog({
				id,
				report_type,
			});
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
	public async updateCancellationLogStatus(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.admin;
			const body = req.body;
			const id = req.params.id;
			const { report_type } = req.query;

			const reportModel = this.Model.cancellationLogModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);

			let report;
			if (report_type === CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
				report = await reportModel.getSingleJobPostCancellationLog({
					id: Number(id),
					report_type,
				});
				console.log({ report });
			} else if (
				report_type === CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION
			) {
				report =
					await reportModel.getSingleJobApplicationCancellationLog({
						id: Number(id),
						report_type,
					});
			}

			if (!report) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			console.log({ report });
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
				await reportModel.updateCancellationLogStatus(Number(id), body);
				if (report_type === CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
					const jobPost =
						await jobPostModel.getSingleJobPostForHotelier(
							report.related_job_post_details
						);
					console.log({ jobPost });
					await jobPostModel.cancelJobPost(
						Number(jobPost.job_post_id)
					);

					await jobPostModel.updateJobPostDetailsStatus({
						id: Number(jobPost.id),
						status: JOB_POST_DETAILS_STATUS.Cancelled,
					});

					await jobApplicationModel.cancelApplication(
						Number(jobPost.job_post_id)
					);
				} else if (
					report_type === CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION
				) {
					const application =
						await jobApplicationModel.updateMyJobApplicationStatus({
							application_id: report.related_id,
							job_seeker_id: report.reporter_id,
							status: JOB_APPLICATION_STATUS.CANCELLED,
						});
					await jobPostModel.updateJobPostDetailsStatus({
						id: application.job_post_details_id,
						status: JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus,
					});
				}
			} else {
				await reportModel.updateCancellationLogStatus(Number(id), body);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
			};
		});
	}
}

export default CancellationLogService;
