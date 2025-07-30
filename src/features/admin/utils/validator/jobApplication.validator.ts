import Joi from "joi";

class JobApplicationValidator {
	public assignApplication = Joi.object({
		job_post_details_id: Joi.number().required(),
		job_post_id: Joi.number().required(),
		user_id: Joi.number().required(),
	});

	getApplicationQuery = Joi.object({
		limit: Joi.number().integer().min(1).default(100).optional(),
		skip: Joi.number().integer().min(0).default(0).optional(),
		status: Joi.string().optional(),
		from_date: Joi.string().isoDate().optional(),
		to_date: Joi.string().isoDate().optional(),
		name: Joi.string().allow("").optional(),
	});
}

export default JobApplicationValidator;
