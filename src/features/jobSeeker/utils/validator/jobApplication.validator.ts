import Joi from "joi";
import {
	CANCEL_APPLICATION_ENUM,
	REPORT_TYPE_ENUM,
} from "../../../../utils/miscellaneous/constants";

export default class JobApplicationValidator {
	createJobApplicationValidator = Joi.object({
		job_post_details_id: Joi.number().integer().required(),
	});

	cancellationReportTypeValidator = Joi.object({
		cancellation_report_type: Joi.string()
			.valid(...REPORT_TYPE_ENUM)
			.optional(),
	});

	cancellationReportReasonValidator = Joi.object({
		report_type: Joi.string()
			.valid(...CANCEL_APPLICATION_ENUM)
			.optional(),
		reason: Joi.string().optional(),
	});
}
