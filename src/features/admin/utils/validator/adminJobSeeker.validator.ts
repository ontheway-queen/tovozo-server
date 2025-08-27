import Joi from "joi";
import {
	JOB_APPLICATION_STATUS_ENUM,
	USER_STATUS,
	USER_STATUS_ENUM,
} from "../../../../utils/miscellaneous/constants";

class AdminJobSeekerValidator {
	public getAllJobSeekerSchema = Joi.object({
		name: Joi.string().min(1).max(255).optional().allow(""),
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
			nationality: Joi.number().integer().required(),
			account_status: Joi.string()
				.valid(...USER_STATUS_ENUM)
				.default(USER_STATUS.PENDING),
		}).required(),
		passport_copy: Joi.string().max(255).allow("").optional(),
		id_copy: Joi.string().max(255).allow("").optional(),
		visa_copy: Joi.string().max(255).allow("").optional(),
	});

	updateJobSeekerValidator = Joi.object({
		user: Joi.object({
			name: Joi.string().min(1).max(255).optional(),
			phone_number: Joi.string().min(7).max(20).optional(),
			photo: Joi.string().max(255).optional(),
		}).optional(),

		own_address: Joi.object({
			id: Joi.number().required(),
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
			nationality: Joi.string().max(255).optional(),
			address: Joi.string().optional(),
			work_permit: Joi.boolean().optional(),
			criminal_convictions: Joi.boolean().optional(),
			account_status: Joi.valid(...Object.values(USER_STATUS)).optional(),
			is_2fa_on: Joi.boolean().optional(),
		}).optional(),

		add_job_preferences: Joi.array()
			.items(Joi.number().integer())
			.optional(),
		del_job_preferences: Joi.array()
			.items(Joi.number().integer())
			.optional(),

		delete_job_locations: Joi.array()
			.items(Joi.number().integer())
			.optional(),

		update_job_locations: Joi.array()
			.items(
				Joi.object({
					id: Joi.number().optional(),
					city_id: Joi.number().integer().optional(),
					name: Joi.string().max(100).optional(),
					address: Joi.string().optional(),
					longitude: Joi.number().precision(6).optional(),
					latitude: Joi.number().precision(6).optional(),
					postal_code: Joi.string().max(20).optional(),
				})
			)
			.optional(),

		add_job_locations: Joi.array()
			.items(
				Joi.object({
					id: Joi.number().optional(),
					city_id: Joi.number().integer().optional(),
					name: Joi.string().max(100).optional(),
					address: Joi.string().optional(),
					longitude: Joi.number().precision(6).optional(),
					latitude: Joi.number().precision(6).optional(),
					postal_code: Joi.string().max(20).optional(),
				})
			)
			.optional(),

		add_job_shifting: Joi.array()
			.items(
				Joi.string().valid("Morning", "Afternoon", "Night", "Flexible")
			)
			.optional(),
		del_job_shifting: Joi.array()
			.items(
				Joi.string().valid("Morning", "Afternoon", "Night", "Flexible")
			)
			.optional(),

		job_seeker_info: Joi.object({
			hospitality_exp: Joi.boolean().optional(),
			languages: Joi.string().allow("").optional(),
			hospitality_certifications: Joi.string().allow("").optional(),
			medical_condition: Joi.string().allow("").optional(),
			dietary_restrictions: Joi.string().allow("").optional(),
			work_start: Joi.string().max(42).allow("").optional(),
			certifications: Joi.string().allow("").optional(),
			reference: Joi.string().allow("").optional(),
			resume: Joi.string().max(255).allow("").optional(),
			training_program_interested: Joi.boolean().optional(),
			start_working: Joi.string().max(42).allow("").optional(),
			hours_available: Joi.string().max(42).allow("").optional(),
			comment: Joi.string().allow("").optional(),
			passport_copy: Joi.string().max(255).allow("").optional(),
			visa_copy: Joi.string().max(255).allow("").optional(),
		}).optional(),
	});

	latlonValidator = Joi.object({
		lat: Joi.string(),
		lon: Joi.string(),
		name: Joi.string().allow("").optional(),
	});
}

export default AdminJobSeekerValidator;
