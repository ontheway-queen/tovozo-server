import Joi from "joi";

class HotelierJobTaskListValidator {
	public createJobTaskList = Joi.object({
		job_task_activity_id: Joi.number().required(),
		tasks: Joi.array()
			.items(
				Joi.object({
					message: Joi.string().required(),
				})
			)
			.min(1)
			.required(),
	});

	public updateJobTaskList = Joi.object({
		message: Joi.string().optional(),
	});
}

export default HotelierJobTaskListValidator;
