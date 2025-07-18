import Joi from "joi";

export default class JobSeekerProfileUpdate {
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
      is_2fa_on: Joi.boolean().optional(),
    }).optional(),

    add_job_preferences: Joi.array().items(Joi.number().integer()).optional(),
    del_job_preferences: Joi.array().items(Joi.number().integer()).optional(),

    delete_job_locations: Joi.array().items(Joi.number().integer()).optional(),

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
      .items(Joi.string().valid("Morning", "Afternoon", "Night", "Flexible"))
      .optional(),
    del_job_shifting: Joi.array()
      .items(Joi.string().valid("Morning", "Afternoon", "Night", "Flexible"))
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
}
