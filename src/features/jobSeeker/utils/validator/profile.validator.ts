import Joi from "joi";

export default class JobSeekerProfileUpdate {
	updateJobSeekerValidator = Joi.object({
		user: Joi.object({
			name: Joi.string().min(1).max(255).optional(),
			phone_number: Joi.string().min(7).max(20).optional(),
			photo: Joi.string().max(255).optional(),
			device_id: Joi.string().optional(),
		}).optional(),

		own_address: Joi.object({
			id: Joi.number().optional(),
			city_id: Joi.number().integer().optional(),
			name: Joi.string().max(100).optional(),
			address: Joi.string().max(100).optional(),
			longitude: Joi.number().precision(6).optional(),
			latitude: Joi.number().precision(6).optional(),
			postal_code: Joi.string().max(20).optional(),
		}).optional(),

		job_seeker: Joi.object({
			date_of_birth: Joi.date().optional(),
			gender: Joi.string().valid("Male", "Female", "Other").optional(),
			address: Joi.string().optional(),
			is_2fa_on: Joi.boolean().optional(),
		}).optional(),
	});

	updateUserVerificationDetails = Joi.object({
		bank_details: Joi.object({
			account_name: Joi.string().required(),
			account_number: Joi.string().required(),
			bank_code: Joi.string().required(),
		}).required(),
	});
}
