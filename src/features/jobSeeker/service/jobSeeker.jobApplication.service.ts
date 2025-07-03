import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateJobApplicationPayload } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";
import CustomError from "../../../utils/lib/customError";
import JobPostModel from "../../../models/hotelierModel/jobPostModel";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
	GENDER_TYPE,
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
	REPORT_TYPE,
} from "../../../utils/miscellaneous/constants";
import { IJobPostDetailsStatus } from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import CancellationReportModel from "../../../models/cancellationReportModel/cancellationReportModel";

export class JobSeekerJobApplication extends AbstractServices {
	constructor() {
		super();
	}

	public createJobApplication = async (req: Request) => {
		const { job_post_details_id } = req.body;
		const { user_id, gender } = req.jobSeeker;

		return await this.db.transaction(async (trx) => {
			const jobPostModel = new JobPostModel(trx);
			const cancellationReportModel = new CancellationReportModel(trx);

			const jobPost = await jobPostModel.getSingleJobPost(
				job_post_details_id
			);

			if (!jobPost) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
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
			if (
				jobPost.gender !== GENDER_TYPE.Other &&
				gender &&
				gender !== GENDER_TYPE.Other &&
				gender !== jobPost.gender
			) {
				throw new CustomError(
					"Your gender does not meet the eligibility criteria for this job.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			if (
				jobPost.status !==
				(JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus)
			) {
				throw new CustomError(
					"This job post is no longer accepting applications.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			const model = this.Model.jobApplicationModel(trx);

			const existPendingApplication = await model.getMyJobApplication({
				job_seeker_id: user_id,
			});

			if (
				existPendingApplication &&
				existPendingApplication.job_application_status !==
					JOB_APPLICATION_STATUS.COMPLETED
			) {
				throw new CustomError(
					"You already have a pending application for this job.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const payload = {
				job_post_details_id: Number(job_post_details_id),
				job_seeker_id: user_id,
				job_post_id: jobPost.job_post_id,
			};
			const res = await model.createJobApplication(
				payload as ICreateJobApplicationPayload
			);

			await model.markJobPostDetailAsApplied(Number(job_post_details_id));
			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: res[0]?.id,
			};
		});
	};

	public getMyJobApplications = async (req: Request) => {
		const { orderBy, orderTo, status, limit, skip } = req.query;
		const { user_id } = req.jobSeeker;

		const model = this.Model.jobApplicationModel();
		const { data, total } = await model.getMyJobApplications({
			user_id,
			status: status as string,
			limit: limit ? Number(limit) : 100,
			skip: skip ? Number(skip) : 0,
			orderBy: orderBy as string,
			orderTo: orderTo as "asc" | "desc",
		});
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	};

	public getMyJobApplication = async (req: Request) => {
		const id = req.params.id;
		const { user_id } = req.jobSeeker;
		const model = this.Model.jobApplicationModel();
		const data = await model.getMyJobApplication({
			job_application_id: parseInt(id),
			job_seeker_id: user_id,
		});
		if (!data) {
			throw new CustomError(
				`The job application with ID ${id} was not found.`,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	};

	public cancelMyJobApplication = async (req: Request) => {
		return await this.db.transaction(async (trx) => {
			const id = req.params.id;
			const { user_id } = req.jobSeeker;
			const body = req.body;

			const applicationModel = this.Model.jobApplicationModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);
			const application = await applicationModel.getMyJobApplication({
				job_application_id: Number(id),
				job_seeker_id: Number(user_id),
			});

			if (!application) {
				throw new CustomError(
					"Application not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (
				application.job_application_status !==
				JOB_APPLICATION_STATUS.PENDING
			) {
				throw new CustomError(
					"This application cannot be cancelled because it has already been processed.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const currentTime = new Date();
			const startTime = new Date(application?.start_time);
			const hoursDiff =
				(startTime.getTime() - currentTime.getTime()) /
				(1000 * 60 * 60);

			if (hoursDiff > 24) {
				const data =
					await applicationModel.updateMyJobApplicationStatus(
						parseInt(id),
						user_id,
						JOB_APPLICATION_STATUS.CANCELLED
					);

				if (!data) {
					throw new CustomError(
						"Application data with the requested id not found",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}

				await jobPostModel.updateJobPostDetailsStatus(
					data.job_post_id,
					JOB_POST_DETAILS_STATUS.Pending as unknown as IJobPostDetailsStatus
				);

				return {
					success: true,
					message: this.ResMsg.HTTP_OK,
					code: this.StatusCode.HTTP_OK,
					data: data.id,
				};
			} else {
				if (
					body.report_type !==
						CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION ||
					!body.reason
				) {
					throw new CustomError(
						this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
						this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
					);
				}
				body.reporter_id = user_id;
				body.related_id = id;

				const cancellationReportModel =
					this.Model.cancellationReportModel(trx);
				const data =
					await cancellationReportModel.requestForCancellationReport(
						body
					);

				return {
					success: true,
					message: this.ResMsg.HTTP_OK,
					code: this.StatusCode.HTTP_OK,
					data: data[0].id,
				};
			}
		});
	};
}
