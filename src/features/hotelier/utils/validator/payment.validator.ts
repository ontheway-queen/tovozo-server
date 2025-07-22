import Joi from "joi";

export default class HotelierPaymentValidator {
	public getPaymentsForHotelierQueryValidator = Joi.object({
		search: Joi.string().valid().optional(),
		limit: Joi.string().optional(),
		skip: Joi.string().optional(),
		status: Joi.string()
			.valid("UNPAID", "PAID", "FAILED", "PARTIAL_PAID")
			.optional(),
	});
}
