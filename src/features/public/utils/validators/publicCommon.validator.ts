import Joi from "joi";
import { GENDERS } from "../../../../utils/miscellaneous/constants";
import { SEND_OTP_TYPES } from "./validatorConstant";
export default class PublicCommonValidator {
  public singleParamNumValidator = (idFieldName: string = "id") => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.number().required();
    return Joi.object(schemaObject);
  };

  // single param string validator
  public singleParamStringValidator = (idFieldName: string = "id") => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.string().required();
    return Joi.object(schemaObject);
  };

  // multiple params number validator
  public multipleParamsNumValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }

  // multiple params string validator
  public multipleParamsStringValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }

  // common login input validator
  loginValidator = Joi.object({
    email: Joi.string().email().required().lowercase().messages({
      "string.base": "Enter valid email",
      "string.email": "Enter valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "Enter valid password",
      "string.min": "Enter valid password minimum length 8",
      "any.required": "Password is required",
    }),
  });

  //common register validator
  registerValidator = Joi.object({
    username: Joi.string().min(1).max(255).required(),
    name: Joi.string().min(1).max(255).required(),
    gender: Joi.string()
      .valid(...GENDERS)
      .required(),
    email: Joi.string().email().lowercase().min(1).max(255).required(),
    password: Joi.string().min(8).max(100).required(),
    phone_number: Joi.string().min(7).max(20).optional(),
  });

  //login with google validator
  loginWithGoogleValidator = Joi.object({
    accessToken: Joi.string().required(),
    image: Joi.string().required(),
    name: Joi.string().min(1).max(255).required(),
    email: Joi.string().email().lowercase().min(1).max(255).required(),
  });

  //single param validator
  public singleParamValidator = Joi.object({
    id: Joi.number().required(),
  });

  // Get nationality validator
  public getNationality = Joi.object({
    name: Joi.string().optional().allow(""),
    limit: Joi.number().integer().optional(),
    skip: Joi.number().integer().optional(),
  });

  // common forget password input validator
  commonForgetPassInputValidation = Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Provide valid token",
      "any.required": "Token is required",
    }),
    email: Joi.string().email().optional().lowercase().messages({
      "string.base": "Provide valid email",
      "string.email": "Provide valid email",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "Provide valid password",
      "string.min": "Please provide valid password that's length must be min 8",
      "any.required": "Password is required",
    }),
  });

  commonTwoFAInputValidation = Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Provide valid token",
      "any.required": "Token is required",
    }),
    email: Joi.string().email().optional().lowercase().messages({
      "string.base": "Provide valid email",
      "string.email": "Provide valid email",
    }),
  });

  // send email otp input validator
  sendOtpInputValidator = Joi.object({
    type: Joi.string()
      .valid(...SEND_OTP_TYPES)
      .required()
      .messages({
        "string.base": "Please enter valid OTP type",
        "any.only": "Please enter valid OTP type",
        "any.required": "OTP type is required",
      }),
    email: Joi.string().email().lowercase().required().messages({
      "string.base": "Enter valid email address",
      "string.email": "Enter valid email address",
      "any.required": "Email is required",
    }),
  });

  // match email otp input validator
  matchEmailOtpInputValidator = Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      "string.base": "Enter valid email",
      "string.email": "Enter valid email",
      "any.required": "Email is required",
    }),
    otp: Joi.string().required().messages({
      "string.base": "Enter valid otp",
      "any.required": "OTP is required",
    }),
    type: Joi.string()
      .valid(...SEND_OTP_TYPES)
      .required()
      .messages({
        "string.base": "Enter valid otp type",
        "any.only": "Enter valid otp type",
        "any.required": "OTP type is required",
      }),
  });

  // common change password input validation
  changePassInputValidation = Joi.object({
    old_password: Joi.string().min(8).required().messages({
      "string.base": "Provide a valid old password",
      "string.min": "Provide a valid old password minimum length is 8",
      "any.required": "Old password is required",
    }),
    new_password: Joi.string().min(8).required().messages({
      "string.base": "Provide a valid new password",
      "string.min": "Provide a valid new password minimum length is 8",
      "any.required": "New password is required",
    }),
  });

  registerJobSeekerValidator = Joi.object({
    user: Joi.object({
      // username: Joi.string().min(1).max(255).required(),
      name: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().lowercase().min(1).max(255).required(),
      password: Joi.string().min(8).max(100).required(),
      phone_number: Joi.string().min(7).max(20).optional(),
    }).required(),

    job_seeker: Joi.object({
      // date_of_birth: Joi.date().required(),
      // gender: Joi.string().valid("Male", "Female", "Other").required(),
      nationality: Joi.number().integer().required(),
      // work_permit: Joi.boolean().required(),
      account_status: Joi.string().max(42).default("Pending"),
      // criminal_convictions: Joi.boolean().required(),
    }).required(),
    passport_copy: Joi.string().max(255).allow("").optional(),
    id_copy: Joi.string().max(255).allow("").optional(),
    visa_copy: Joi.string().max(255).allow("").optional(),
    // own_address: Joi.object({
    //   city_id: Joi.number().integer().required(),
    //   name: Joi.string().max(100).required(),
    //   address: Joi.string().optional(),
    //   longitude: Joi.number().precision(6).optional(),
    //   latitude: Joi.number().precision(6).optional(),
    //   postal_code: Joi.string().max(20).optional(),
    // }).required(),

    // job_preferences: Joi.array().items(Joi.number().integer()).required(),

    // job_shifting: Joi.array()
    //   .items(Joi.string().valid("Morning", "Afternoon", "Night", "Flexible"))
    //   .required(),

    // job_seeker_info: Joi.object({
    //   // hospitality_exp: Joi.boolean().required(),
    //   // languages: Joi.string().allow("").optional(),
    //   // hospitality_certifications: Joi.string().allow("").optional(),
    //   // medical_condition: Joi.string().allow("").optional(),
    //   // dietary_restrictions: Joi.string().allow("").optional(),
    //   // work_start: Joi.string().max(42).allow("").optional(),
    //   // certifications: Joi.string().allow("").optional(),
    //   // reference: Joi.string().allow("").optional(),
    //   // resume: Joi.string().max(255).allow("").optional(),
    //   // training_program_interested: Joi.boolean().required(),
    //   // start_working: Joi.string().max(42).allow("").optional(),
    //   // hours_available: Joi.string().max(42).allow("").optional(),
    //   // comment: Joi.string().allow("").optional(),

    // })
    // .required(),

    // job_locations: Joi.array()
    //   .items(
    //     Joi.object({
    //       city_id: Joi.number().integer().required(),
    //       name: Joi.string().max(100).required(),
    //       address: Joi.string().optional(),
    //       longitude: Joi.number().precision(6).optional(),
    //       latitude: Joi.number().precision(6).optional(),
    //       postal_code: Joi.string().max(20).optional(),
    //     })
    //   )
    //   .min(1)
    //   .required(),
  });

  registerOrganizationValidator = Joi.object({
    user: Joi.object({
      // username: Joi.string().min(1).max(255).required(),
      name: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().lowercase().min(1).max(255).required(),
      password: Joi.string().min(8).max(100).required(),
      phone_number: Joi.string().min(7).max(20).optional(),
      photo: Joi.string().max(255).allow("").optional(),
      designation: Joi.string().max(500).required(),
    }).required(),

    organization: Joi.object({
      name: Joi.string().max(255).required(),
      details: Joi.string().allow("").optional(),
    }).required(),

    organization_address: Joi.object({
      city_id: Joi.number().integer().required(),
      name: Joi.string().max(100).required(),
      address: Joi.string().optional(),
      longitude: Joi.number().precision(6).optional(),
      latitude: Joi.number().precision(6).optional(),
      postal_code: Joi.string().max(20).optional(),
    }).required(),

    organization_amenities: Joi.array()
      .items(Joi.string().max(255).required())
      .optional(),
  });

  getNotificationValidator = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    limit: Joi.number().integer().positive().optional(),
    skip: Joi.number().integer().positive().optional(),
  });
}
