import Joi from "joi";

export class StripePayoutValidator {
	public addStripePayoutAccount = Joi.object({
		country: Joi.string().min(2).max(2).required(),
		email: Joi.string().email().required(),
		visa_copy: Joi.string().optional(),
		passport_copy: Joi.string().optional(),
		id_copy: Joi.string().optional(),
	});
}
