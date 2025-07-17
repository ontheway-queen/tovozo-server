import Joi from "joi";

export default class JobTaskActivitiesValidator {
	public createJobTaskActivity = Joi.object({
		job_application_id: Joi.number().required(),
		job_post_details_id: Joi.number().required(),
	});

	public toogleTaskCompletion = Joi.object({
		is_completed: Joi.string().valid("1", "0").required(),
	});
}
