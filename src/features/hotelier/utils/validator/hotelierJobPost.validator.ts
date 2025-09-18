import Joi from "joi";
import {
	CANCEL_JOB_POST_ENUM,
	GENDERS,
	JOB_POST_DETAILS_STATUS_ENUM,
} from "../../../../utils/miscellaneous/constants";

export class HotelierJobPostValidator {
	public createJobPostSchema = Joi.object({
		job_post: Joi.object({
			expire_time: Joi.string()
				.isoDate()
				.required()
				.custom((value, helpers) => {
					const expireDate = new Date(value);
					if (expireDate <= new Date()) {
						return helpers.error("any.custom", {
							message:
								"Expire time must be a future date and time.",
						});
					}
					return value;
				})
				.messages({
					"string.isoDate": "Expire time must be a valid ISO date.",
					"any.required": "Expire time is required.",
					"any.custom": "{{#message}}",
				}),
		}).required(),

		job_post_details: Joi.array()
			.items(
				Joi.object({
					job_id: Joi.number().required().messages({
						"number.base": "Job ID must be a number.",
						"any.required": "Job ID is required.",
					}),
					start_time: Joi.string()
						.isoDate()
						.required()
						.custom((value, helpers) => {
							const startTime = new Date(value);
							const nowPlus24h = new Date(
								Date.now() + 24 * 60 * 60 * 1000
							);
							if (startTime < nowPlus24h) {
								return helpers.error("any.custom", {
									message:
										"Start time must be at least 24 hours from now.",
								});
							}
							return value;
						})
						.messages({
							"string.isoDate":
								"Start time must be a valid ISO date.",
							"any.required": "Start time is required.",
							"any.custom": "{{#message}}",
						}),
					end_time: Joi.string().isoDate().required().messages({
						"string.isoDate": "End time must be a valid ISO date.",
						"any.required": "End time is required.",
					}),
				})
			)
			.min(1)
			.required(),
	})
		.custom((obj, helpers) => {
			const expireTime = new Date(obj.job_post.expire_time);
			for (const detail of obj.job_post_details) {
				const startTime = new Date(detail.start_time);
				if (startTime < expireTime) {
					return helpers.error("any.custom", {
						message: "Start time must be after expire time.",
					});
				}
			}
			return obj;
		})
		.messages({
			"any.custom": "{{#message}}",
		});

	public getJobPostSchema = Joi.object({
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
		status: Joi.string()
			.valid(...JOB_POST_DETAILS_STATUS_ENUM)
			.optional(),
		name: Joi.string().allow("").optional(),
		title: Joi.string().optional(),
		from_date: Joi.string().optional(),
		to_date: Joi.string().optional(),
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

	public trackJobSeekerLocationSchema = Joi.object({
		job_seeker: Joi.number().integer().required(),
	});
}
