import Joi from "joi";
import {
	CANCELLATION_REPORT_STATUS_ENUM,
	REPORT_TYPE_ENUM,
} from "../../../../utils/miscellaneous/constants";

class AdminJobValidator {
	public createJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).required(),
		description: Joi.string().optional(),
	});

	public updateJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).optional(),
		description: Joi.string().optional(),
		status: Joi.boolean().optional(),
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
