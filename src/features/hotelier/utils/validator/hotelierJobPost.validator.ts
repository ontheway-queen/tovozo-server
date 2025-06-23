import Joi from "joi";
import { GENDERS } from "../../../../utils/miscellaneous/constants";

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
}
