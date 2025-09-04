import Joi from "joi";

export default class AdminPayoutValidator {
	public managePayout = Joi.object({
		status: Joi.string().valid("Approved", "Rejected").required(),
		admin_note: Joi.string().required(),
		transaction_reference: Joi.string().when("status", {
			is: "Approved",
			then: Joi.string().required().messages({
				"any.required": `"transaction_reference" is required when status is Approved`,
				"string.empty": `"transaction_reference" cannot be empty when status is Approved`,
			}),
			otherwise: Joi.string().optional(),
		}),
	});

	public queryValidator = Joi.object({
		name: Joi.string().optional(),
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
	});
}
