import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	LOGIN_TOKEN_EXPIRES_IN,
	OTP_TYPES,
	PROJECT_NAME,
	USER_AUTHENTICATION_VIEW,
	USER_STATUS,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	IForgetPasswordPayload,
	NotificationTypeEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { registrationHotelierTemplate } from "../../../utils/templates/registrationHotelierTemplate";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtpTemplate";
import {
	IHotelierAuthView,
	IHotelierRegistrationBodyPayload,
	IHotelierUser,
	IOrganizationAddressPayload,
	IOrganizationAmenitiesType,
	IOrganizationName,
} from "../utils/types/hotelierAuth.types";

export default class HotelierAuthService extends AbstractServices {
	constructor() {
		super();
	}

	public async organizationRegistrationService(req: Request) {
		return this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];
			const body = req.body as IHotelierRegistrationBodyPayload;
			const { designation, ...user } = Lib.safeParseJSON(
				body.user
			) as IHotelierUser;
			const organization = Lib.safeParseJSON(
				body.organization
			) as IOrganizationName;
			const organizationAddress = Lib.safeParseJSON(
				body.organization_address
			) as IOrganizationAddressPayload;
			const amenitiesInput =
				(Lib.safeParseJSON(
					req.body.organization_amenities
				) as IOrganizationAmenitiesType[]) || [];

			for (const file of files) {
				if (file.fieldname === "photo") {
					user.photo = file.filename;
				}
			}

			const { email, phone_number, password, ...userData } = user;

			const userModel = this.Model.UserModel(trx);
			const organizationModel = this.Model.organizationModel(trx);
			const commonModel = this.Model.commonModel(trx);

			const [existingUser] = await userModel.checkUser({
				email,
				phone_number,
				type: USER_TYPE.HOTELIER,
			});

			if (existingUser) {
				if (existingUser.email === email) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: this.ResMsg.EMAIL_ALREADY_EXISTS,
					};
				}
				if (existingUser.phone_number === phone_number) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
					};
				}
			}

			const password_hash = await Lib.hashValue(password);

			const registration = await userModel.createUser({
				...userData,
				email,
				phone_number,
				password_hash,
				type: USER_TYPE.HOTELIER,
			});

			if (!registration.length) {
				throw new CustomError(
					this.ResMsg.HTTP_BAD_REQUEST,
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const checkCountry = await commonModel.getAllCountry({
				id: organizationAddress.country_id,
			});

			if (!checkCountry.length) {
				throw new CustomError(
					"Service is not available in this country",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			let stateId = 0;
			const checkState = await commonModel.getAllStates({
				country_id: organizationAddress.country_id,
				name: organizationAddress.state,
			});
			if (!checkState.length) {
				const state = await commonModel.createState({
					country_id: organizationAddress.country_id,
					name: organizationAddress.state,
				});
				stateId = state[0].id;
			} else {
				stateId = checkState[0].id;
			}

			let cityId = 0;
			const checkCity = await commonModel.getAllCity({
				country_id: organizationAddress.country_id,
				state_id: stateId,
				name: organizationAddress.city,
			});
			if (!checkCity.length) {
				const city = await commonModel.createCity({
					country_id: organizationAddress.country_id,
					state_id: stateId,
					name: organizationAddress.city,
				});
				cityId = city[0].id;
			} else {
				cityId = checkCity[0].id;
			}

			const organization_location = await commonModel.createLocation({
				address: organizationAddress.address,
				city_id: cityId,
				latitude: organizationAddress.latitude,
				longitude: organizationAddress.longitude,
				postal_code: organizationAddress.postal_code,
			});
			const locationId = organization_location[0].id;
			const userId = registration[0].id;

			await userModel.createUserMaintenanceDesignation({
				designation,
				user_id: userId,
			});
			const orgInsert = await organizationModel.createOrganization({
				name: organization.org_name,
				user_id: userId,
				location_id: locationId,
			});

			const organizationId = orgInsert[0].id;

			const photos = files.map((file) => ({
				organization_id: organizationId,
				file: file.filename,
			}));

			if (photos.length) {
				await organizationModel.addPhoto(photos);
			}

			const amenities = amenitiesInput.map((a: string) => ({
				organization_id: organizationId,
				amenity: a,
			}));

			if (amenities.length) {
				await organizationModel.addAmenities(amenities);
			}

			const tokenData = {
				user_id: userId,
				name: user.name,
				user_email: email,
				phone_number,
				photo: user.photo,
				status: true,
				create_date: new Date(),
			};

			await this.insertNotification(trx, TypeUser.ADMIN, {
				user_id: userId,
				sender_type: USER_TYPE.ADMIN,
				title: this.NotificationMsg.NEW_HOTELIER_REGISTRATION.title,
				content: this.NotificationMsg.NEW_HOTELIER_REGISTRATION.content(
					user.name
				),
				related_id: userId,
				type: NotificationTypeEnum.HOTELIER_VERIFICATION,
			});
			//   throw Error("Registration failed");
			await Lib.sendEmailDefault({
				email,
				emailSub: `Your organization registration with ${PROJECT_NAME} is under review`,
				emailBody: registrationHotelierTemplate({ name: user.name }),
			});

			const token = Lib.createToken(
				tokenData,
				config.JWT_SECRET_HOTEL,
				LOGIN_TOKEN_EXPIRES_IN
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				data: tokenData,
				token,
			};
		});
	}

	// login
	public async loginService(req: Request) {
		const { email, password } = req.body as {
			email: string;
			password: string;
		};
		const userModel = this.Model.UserModel();
		const commonModel = this.Model.commonModel();
		const checkUser =
			await userModel.getSingleCommonAuthUser<IHotelierAuthView>({
				schema_name: "hotelier",
				table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
				email,
			});

		if (!checkUser) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: "No user found with this credentials!",
			};
		}

		const { password_hash: hashPass, ...rest } = checkUser;
		const checkPass = await Lib.compareHashValue(password, hashPass);

		if (!checkPass) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: this.ResMsg.WRONG_CREDENTIALS,
			};
		}
		console.log(rest.organization_status);
		console.log(USER_STATUS.ACTIVE);
		if (
			rest.organization_status.toLowerCase() !==
			USER_STATUS.ACTIVE.toLowerCase()
		) {
			return {
				success: false,
				code: this.StatusCode.HTTP_FORBIDDEN,
				message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
			};
		}

		if (rest.is_2fa_on) {
			const checkOtp = await commonModel.getOTP({
				email: checkUser.email,
				type: OTP_TYPES.two_fa_admin,
			});

			if (checkOtp.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_GONE,
					message: this.ResMsg.THREE_TIMES_EXPIRED,
				};
			}
			const generateOtp = Lib.otpGenNumber(6);
			const hashed_otp = await Lib.hashValue(generateOtp);

			const insertOtp = await commonModel.insertOTP({
				email: checkUser.email,
				type: OTP_TYPES.two_fa_admin,
				hashed_otp,
			});
			if (!insertOtp) {
				return {
					success: false,
					code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
					message: "Cannot send email at the moment ",
				};
			}

			await Lib.sendEmailDefault({
				email: checkUser.email,
				emailSub: "Two Factor Verification",
				emailBody: sendEmailOtpTemplate(generateOtp, "two factor verification"),
			});
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.LOGIN_SUCCESSFUL,
				data: {
					email: rest.email,
					is_2fa_on: true,
				},
			};
		} else {
			const token_data = {
				user_id: rest.user_id,
				name: rest.name,
				phone_number: rest.phone_number,
				photo: rest.photo,
				status: rest.user_status,
				email: rest.email,
				organization_status: rest.organization_status,
			};

			const token = Lib.createToken(
				token_data,
				config.JWT_SECRET_HOTEL,
				LOGIN_TOKEN_EXPIRES_IN
			);
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.LOGIN_SUCCESSFUL,
				data: rest,
				token,
			};
		}
	}

	// loginData for 2FA user info retrieval
	public async loginData(req: Request) {
		const { token, email } = req.body as { token: string; email: string };
		const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_HOTEL);
		const user_model = this.Model.UserModel();

		if (!token_verify) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: this.ResMsg.HTTP_UNAUTHORIZED,
			};
		}

		const { email: verify_email } = token_verify;
		if (email === verify_email) {
			const checkUser =
				await user_model.getSingleCommonAuthUser<IHotelierAuthView>({
					schema_name: "hotelier",
					table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
					email,
				});

			if (!checkUser) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: this.ResMsg.WRONG_CREDENTIALS,
				};
			}

			const { ...rest } = checkUser;

			if (rest.organization_status !== USER_STATUS.ACTIVE) {
				return {
					success: false,
					code: this.StatusCode.HTTP_FORBIDDEN,
					message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
				};
			}

			const token_data = {
				user_id: rest.user_id,
				name: rest.name,
				phone_number: rest.phone_number,
				photo: rest.photo,
				status: rest.user_status,
				email: rest.email,
				organization_status: rest.organization_status,
			};

			const token = Lib.createToken(
				token_data,
				config.JWT_SECRET_HOTEL,
				LOGIN_TOKEN_EXPIRES_IN
			);
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.LOGIN_SUCCESSFUL,
				data: token_data,
				token,
			};
		} else {
			return {
				success: false,
				code: this.StatusCode.HTTP_FORBIDDEN,
				message: this.StatusCode.HTTP_FORBIDDEN,
			};
		}
	}

	//forget pass
	public async forgetPassword(req: Request) {
		const { token, email, password } = req.body as IForgetPasswordPayload;
		const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_HOTEL);

		if (!token_verify) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: this.ResMsg.HTTP_UNAUTHORIZED,
			};
		}

		const { email: verify_email } = token_verify;
		if (email === verify_email) {
			const hashed_pass = await Lib.hashValue(password);
			const model = this.Model.UserModel();
			const [get_user] = await model.checkUser({
				email,
				type: USER_TYPE.HOTELIER,
			});
			await model.updateProfile(
				{ password_hash: hashed_pass },
				{ id: get_user.id }
			);
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.PASSWORD_CHANGED,
			};
		} else {
			return {
				success: false,
				code: this.StatusCode.HTTP_FORBIDDEN,
				message: this.StatusCode.HTTP_FORBIDDEN,
			};
		}
	}
}
