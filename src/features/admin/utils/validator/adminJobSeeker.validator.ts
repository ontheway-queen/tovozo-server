import Joi from "joi";
import {
	JOB_APPLICATION_STATUS_ENUM,
	USER_STATUS,
	USER_STATUS_ENUM,
} from "../../../../utils/miscellaneous/constants";

class AdminJobSeekerValidator {
	public getAllJobSeekerSchema = Joi.object({
		name: Joi.string().min(1).max(255).optional().allow(""),
		filter: Joi.string().min(1).max(255).optional().allow(""),
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
		status: Joi.string()
			.valid(...Object.values(USER_STATUS))
			.optional(),
		from_date: Joi.date().optional(),
		to_date: Joi.date().optional(),
		application_status: Joi.string()
			.valid(...JOB_APPLICATION_STATUS_ENUM)
			.optional(),
	});

	createJobSeekerValidator = Joi.object({
		user: Joi.object({
			name: Joi.string().min(1).max(255).required(),
			email: Joi.string().email().lowercase().min(1).max(255).required(),
			password: Joi.string().min(8).max(100).required(),
			phone_number: Joi.string().min(7).max(20).optional(),
		}).required(),
		job_seeker: Joi.object({
			account_status: Joi.string()
				.valid(...USER_STATUS_ENUM)
				.default("Pending"),
		}).optional(),
		own_address: Joi.object({
			address: Joi.string().optional(),
			city: Joi.string().max(100).optional(),
			country: Joi.string().max(100).optional(),
			state: Joi.string().max(100).optional(),
			longitude: Joi.number().precision(6).min(-180).max(180).optional(),
			latitude: Joi.number().precision(6).min(-90).max(90).optional(),
			postal_code: Joi.string().optional(),
		}).optional(),
	});

	updateJobSeekerValidator = Joi.object({
		user: Joi.object({
			name: Joi.string().min(1).max(255).optional(),
			email: Joi.string().optional(),
			password: Joi.string().optional(),
			phone_number: Joi.string().min(7).max(20).optional(),
		}).optional(),

		own_address: Joi.object({
			city: Joi.string().optional(),
			state: Joi.string().optional(),
			country: Joi.string().optional(),
			name: Joi.string().max(100).optional(),
			address: Joi.string().max(100).optional(),
			longitude: Joi.number().precision(6).optional(),
			latitude: Joi.number().precision(6).optional(),
			postal_code: Joi.string().max(20).optional(),
		}).optional(),

		job_seeker: Joi.object({
			date_of_birth: Joi.date().optional(),
			gender: Joi.string().valid("Male", "Female", "Other").optional(),
			account_status: Joi.valid(...Object.values(USER_STATUS)).optional(),
			is_2fa_on: Joi.boolean().optional(),
		}).optional(),
	});

	public latlonValidator = Joi.object({
		lat: Joi.string(),
		lon: Joi.string(),
		name: Joi.string().allow("").optional(),
	});

	public verifyBankDetailsValidator = Joi.object({
		bank_id: Joi.number().required().messages({
			"any.required": "Bank ID is required",
			"number.base": "Bank ID must be a number",
		}),
	});
}

export default AdminJobSeekerValidator;
