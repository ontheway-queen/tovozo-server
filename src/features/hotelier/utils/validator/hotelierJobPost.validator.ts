import Joi from "joi";
import {
	CANCEL_JOB_POST_ENUM,
	GENDERS,
	JOB_POST_DETAILS_STATUS,
	JOB_POST_DETAILS_STATUS_ENUM,
} from "../../../../utils/miscellaneous/constants";

export class HotelierJobPostValidator {
	public createJobPostSchema = Joi.object({
		job_post: Joi.object({
			title: Joi.string().required(),
			details: Joi.string().optional(),
			created_time: Joi.string().isoDate().optional(),
			expire_time: Joi.string().isoDate().optional(),
			hourly_rate: Joi.number().required(),
			prefer_gender: Joi.string()
				.valid(...GENDERS)
				.optional(),
			requirements: Joi.string().optional(),
		}).required(),
		job_post_details: Joi.array()
			.items(
				Joi.object({
					job_id: Joi.number().required(),
					start_time: Joi.string().isoDate().required(),
					end_time: Joi.string().isoDate().required(),
				})
			)
			.min(1)
			.required(),
	});

	public getJobPostSchema = Joi.object({
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
		status: Joi.string()
			.valid(...JOB_POST_DETAILS_STATUS_ENUM)
			.optional(),
	});

	public getSingleJobPostSchema = Joi.object({
		id: Joi.number().integer().required(),
	}).required();

	public cancelJobPostSchema = Joi.object({
		related_id: Joi.number().integer(),
		report_type: Joi.string().valid(...CANCEL_JOB_POST_ENUM),
		reason: Joi.string(),
	});

	public updateJobPostSchema = Joi.object({
		job_post: Joi.object({
			title: Joi.string().optional(),
			details: Joi.string().optional(),
			expire_time: Joi.string().isoDate().optional(),
			hourly_rate: Joi.number().optional(),
			prefer_gender: Joi.string()
				.valid(...GENDERS)
				.optional(),
			requirements: Joi.string().optional(),
		}).required(),
		job_post_details: Joi.object({
			job_id: Joi.number().optional(),
			start_time: Joi.string().isoDate().optional(),
			end_time: Joi.string().isoDate().optional(),
		}).optional(),
	});
}
