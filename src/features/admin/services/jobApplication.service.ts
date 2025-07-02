import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
	GENDER_TYPE,
	JOB_POST_DETAILS_STATUS,
} from "../../../utils/miscellaneous/constants";
import { ICreateJobApplicationPayload } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";

export default class AdminJobApplicationService extends AbstractServices {
	constructor() {
		super();
	}

	public async assignJobApplication(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id: admin_id } = req.admin;
			const { job_post_details_id, user_id, job_post_id } = req.body;

			const model = this.Model.jobApplicationModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const cancellationReportModel =
				this.Model.cancellationReportModel(trx);

			const jobPost = await jobPostModel.getSingleJobPost(
				job_post_details_id
			);

			if (!jobPost) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (jobPost.status !== JOB_POST_DETAILS_STATUS.Pending) {
				throw new CustomError(
					"Can't apply. This job post is not accepting applications.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const jobPostReport =
				await cancellationReportModel.getSingleJobPostReport(
					null,
					CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
					job_post_details_id
				);
			if (
				jobPostReport &&
				jobPostReport.status === CANCELLATION_REPORT_STATUS.PENDING
			) {
				throw new CustomError(
					"A cancellation request is already pending for this job post.",
					this.StatusCode.HTTP_CONFLICT
				);
			}
			console.log({ jobPost });

			const res = await model.createJobApplication({
				job_seeker_id: user_id,
				job_post_id: job_post_id,
				job_post_details_id,
			} as ICreateJobApplicationPayload);

			await model.markJobPostDetailAsApplied(Number(job_post_details_id));

			await this.insertAdminAudit(trx, {
				details: `Job post ID:${job_post_details_id} assigned to a job seeker ID:${user_id} for further activities.`,
				created_by: admin_id,
				endpoint: req.originalUrl,
				type: "UPDATE",
				payload: JSON.stringify({
					job_seeker_id: user_id,
					job_post_id: job_post_id,
					job_post_details_id,
				}),
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: res[0].id,
			};
		});
	}
}
