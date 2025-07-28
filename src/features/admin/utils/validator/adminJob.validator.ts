import Joi from "joi";
import {
	CANCELLATION_REPORT_STATUS_ENUM,
	REPORT_TYPE_ENUM,
} from "../../../../utils/miscellaneous/constants";
import { platform } from "os";

class AdminJobValidator {
	public createJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).required(),
		details: Joi.string().min(100).messages({
			"string.empty": "Details is required",
			"string.min": "Details must be at least 100 characters long",
		}),
		hourly_rate: Joi.number().required(),
		job_seeker_pay: Joi.number().required(),
		platform_fee: Joi.number().required(),
	});

	public updateJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).optional(),
		description: Joi.string().optional(),
		status: Joi.boolean().optional(),
		hourly_rate: Joi.number().optional(),
		job_seeker_pay: Joi.number().optional(),
		platform_fee: Joi.number().optional(),
	})
		.and("hourly_rate", "job_seeker_pay", "platform_fee")
		.messages({
			"object.and": `"hourly_rate" requires both "job_seeker_pay" and "platform_fee" to be provided together.`,
		});

	public getAllJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).optional(),
		status: Joi.boolean().optional(),
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		orderBy: Joi.string().valid("title").optional(),
		orderTo: Joi.string().valid("asc", "desc").optional(),
	});

	public cancellationReportSchema = Joi.object({
		status: Joi.string().valid(...CANCELLATION_REPORT_STATUS_ENUM),
		reject_reason: Joi.string().optional(),
	});
}

export default AdminJobValidator;
