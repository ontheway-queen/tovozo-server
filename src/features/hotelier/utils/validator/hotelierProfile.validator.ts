import Joi from "joi";

export default class HotelierProfileValidator {
	public updateProfile = Joi.object({
		user: Joi.object({
			device_id: Joi.string().optional(),
		}).optional(),
	});
}
