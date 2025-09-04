import Joi from "joi";

export default class JobSeekerPayoutValidator {
	requestPayoutValidator = Joi.object({
		amount: Joi.number().required(),
		note: Joi.string().required(),
		bank_id: Joi.number().integer().required(),
	});

	queryValidator = Joi.object({
		search: Joi.string().optional(),
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
	});
}
