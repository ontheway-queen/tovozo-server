import Joi from "joi";
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
    gender: Joi.string().valid("Male", "Female", "Other").required(),
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
}
