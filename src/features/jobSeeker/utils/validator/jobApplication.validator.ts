import Joi from "joi";

export default class JobApplicationValidator {
  createJobApplicationValidator = Joi.object({
    job_post_details_id: Joi.number().integer().required(),
    })
}
