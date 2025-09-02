import Joi from "joi";
import { USER_STATUS_ENUM } from "../../../../utils/miscellaneous/constants";

export default class HotelierProfileValidator {
	public updateProfile = Joi.object({
		user: Joi.object({
			name: Joi.string().optional(),
			device_id: Joi.string().optional(),
			phone_number: Joi.string().optional(),
		}).optional(),
		organization: Joi.object({
			name: Joi.string().optional(),
			details: Joi.string().optional(),
			status: Joi.string()
				.valid(...USER_STATUS_ENUM)
				.optional(),
			location_id: Joi.number().optional(),
		}).optional(),
		org_address: Joi.object({
			name: Joi.string().optional(),
			address: Joi.string().optional(),
			city: Joi.string().optional(),
			state: Joi.string().optional(),
			country: Joi.string().optional(),
			longitute: Joi.number().precision(6).optional(),
			latitute: Joi.number().precision(6).optional(),
			postal_code: Joi.string()
				.pattern(/^[0-9]+$/)
				.optional()
				.messages({
					"string.pattern.base":
						"Postal code must contain only numbers",
				}),
			is_home_address: Joi.boolean().optional(),
		}).custom((value, helpers) => {
			if (value.city && !value.state) {
				return helpers.message({
					custom: "State is required when city is provided",
				});
			}
			if (value.city && !value.country) {
				return helpers.message({
					custom: "Country is required when city is provided",
				});
			}
			return value;
		}, "City dependency validation"),
	});
}
