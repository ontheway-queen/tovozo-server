import Joi from "joi";

export default class JobSeekerPaymentValidator {
	public getPaymentsForJobSeekerQueryValidator = Joi.object({
		search: Joi.string().valid().optional(),
		limit: Joi.string().optional(),
		skip: Joi.string().optional(),
		status: Joi.string()
			.valid("Unpaid", "Paid", "Failed", "Partial Paid")
			.optional(),
	});
}
