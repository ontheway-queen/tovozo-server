import Joi from "joi";

export default class JobApplicationValidator {
	createJobApplicationValidator = Joi.object({
		job_post_details_id: Joi.number().integer().required(),
	});

	cancellationReportTypeValidator = Joi.object({
		cancellation_report_type: Joi.string()
			.valid("cancel_application", "cancel_job_post")
			.required(),
	});

	cancellationReportReasonValidator = Joi.object({
		reason: Joi.string().required(),
	});
}
