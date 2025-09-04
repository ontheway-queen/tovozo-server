import Joi from "joi";

export default class BankDetailsValidator {
	public getBankDetailsQueryValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		account_number: Joi.string().optional(),
		bank_code: Joi.string().optional(),
		account_name: Joi.string().optional(),
		id: Joi.number().optional(),
	});

	public addBankDetailsPayloadValidator = Joi.object({
		account_number: Joi.string().required(),
		bank_code: Joi.string().required(),
		account_name: Joi.string().required(),
	});
}
