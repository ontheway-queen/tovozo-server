import Joi from "joi";
import {
	GENDERS,
	REPORT_STATUS_ENUM,
	REPORT_TYPE_ENUM,
	USER_STATUS_ENUM,
} from "../../../../utils/miscellaneous/constants";
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

	// limit skip
	public getLimitSkipQueryValidator = Joi.object({
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
		category_id: Joi.string().optional(),
		city_id: Joi.string().optional(),
		from_date: Joi.string().optional(),
		to_date: Joi.string().optional(),
		name: Joi.string().allow("").optional(),
	});

	// Get nationality validator
	public getNationality = Joi.object({
		name: Joi.string().optional().allow(""),
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
	});

	public getAllJobSchema = Joi.object({
		title: Joi.string().min(1).max(255).optional(),
		status: Joi.boolean().optional(),
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		orderBy: Joi.string().valid("title").optional(),
		orderTo: Joi.string().valid("asc", "desc").optional(),
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
			"string.min":
				"Please provide valid password that's length must be min 8",
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
			name: Joi.string().min(1).max(255).required(),
			email: Joi.string().email().lowercase().min(1).max(255).required(),
			password: Joi.string().min(8).max(100).required(),
			phone_number: Joi.string().min(7).max(20).optional(),
		}).required(),

		job_seeker: Joi.object({
			nationality: Joi.number().integer().required(),
			account_status: Joi.string()
				.valid(...USER_STATUS_ENUM)
				.default("Pending"),
		}).required(),
		own_address: Joi.object({
			address: Joi.string().optional(),
			city: Joi.string().max(100).optional(),
			country: Joi.string().max(100).optional(),
			state: Joi.string().max(100).optional(),
			longitude: Joi.number().precision(6).optional(),
			latitude: Joi.number().precision(6).optional(),
		}).optional(),
	});

	registerOrganizationValidator = Joi.object({
		user: Joi.object({
			name: Joi.string().min(1).max(255).required(),
			email: Joi.string().email().lowercase().min(1).max(255).required(),
			password: Joi.string().min(8).max(100).required(),
			phone_number: Joi.string().min(7).max(20).optional(),
		}).required(),

		organization: Joi.object({
			org_name: Joi.string().max(255).required(),
			details: Joi.string().allow("").optional(),
		}).required(),

		organization_address: Joi.object({
			city: Joi.string().max(255).required(),
			state: Joi.string().max(255).required(),
			country: Joi.string().max(255).required(),
			address: Joi.string().optional(),
			longitude: Joi.number().precision(6).optional(),
			latitude: Joi.number().precision(6).optional(),
			postal_code: Joi.string().max(20).optional(),
		}).required(),
	});

	getNotificationValidator = Joi.object({
		limit: Joi.number().integer().optional(),
		skip: Joi.number().integer().optional(),
	});
	mutationNotificationValidator = Joi.object({
		id: Joi.number().integer().positive().optional(),
	});

	// get single item with id validator
	public getSingleItemWithIdValidator = Joi.object({
		id: Joi.number().integer().required(),
	});

	//   get reports data query
	public getReportQueryValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		searchQuery: Joi.string().optional(),
		type: Joi.string()
			.valid(...REPORT_TYPE_ENUM)
			.optional(),
		report_status: Joi.string()
			.valid(...REPORT_STATUS_ENUM)
			.optional(),
	});
}
