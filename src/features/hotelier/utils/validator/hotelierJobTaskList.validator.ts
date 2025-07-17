import Joi from "joi";

class HotelierJobTaskListValidator {
	public createJobTaskList = Joi.object({
		job_task_activity_id: Joi.number().required(),
		message: Joi.string().required(),
	});

	public updateJobTaskList = Joi.object({
		message: Joi.string().optional(),
	});
}

export default HotelierJobTaskListValidator;
