import Joi from "joi";
import { TypeUser } from "../../../../utils/modelTypes/user/userModelTypes";

export default class AdminPaymentValidator {
	public getAllPaymentLedgerQuery = Joi.object({
		name: Joi.string().allow("").optional(),
		from_date: Joi.string().optional(),
		to_date: Joi.string().optional(),
		user_id: Joi.number().optional(),
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		type: Joi.string()
			.valid(...Object.values(TypeUser))
			.optional(),
	});
}
