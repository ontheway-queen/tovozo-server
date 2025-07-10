import Joi from "joi";
import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_STATUS_ENUM,
	CANCELLATION_REPORT_TYPE_ENUM,
	REPORT_TYPE_ENUM,
} from "../../../../utils/miscellaneous/constants";

class CancellationReportValidator {
	public cancellationReportSchema = Joi.object({
		status: Joi.string().valid(...CANCELLATION_REPORT_STATUS_ENUM),
		reject_reason: Joi.string().when("status", {
			is: CANCELLATION_REPORT_STATUS.REJECTED,
			then: Joi.required().messages({
				"any.required":
					"Rejected reason is required when status is REJECTED.",
			}),
			otherwise: Joi.forbidden(),
		}),
	});

	public reportQuerySchema = Joi.object({
		user_id: Joi.number().optional(),
		report_type: Joi.string()
			.valid(...CANCELLATION_REPORT_TYPE_ENUM)
			.optional(),

		status: Joi.string()
			.valid(...CANCELLATION_REPORT_STATUS_ENUM)
			.optional(),

		limit: Joi.number().integer().min(1).max(1000).optional(),
		skip: Joi.number().integer().min(0).optional(),
		searchQuery: Joi.string().allow("").optional(),
	});

	public reportTypeQuerySchema = Joi.object({
		report_type: Joi.string()
			.valid(...CANCELLATION_REPORT_TYPE_ENUM)
			.required(),
	});
}
export default CancellationReportValidator;
