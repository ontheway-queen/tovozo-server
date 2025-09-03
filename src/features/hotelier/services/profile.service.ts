import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	USER_AUTHENTICATION_VIEW,
	USER_STATUS,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { IChangePasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";
import { IHotelierUpdateParsedBody } from "../../admin/utils/types/adminHotelier.types";
import { IHotelierAuthView } from "../../auth/utils/types/hotelierAuth.types";
import { IJobSeekerAuthView } from "../../auth/utils/types/jobSeekerAuth.types";

export default class HotelierProfileService extends AbstractServices {
	constructor() {
		super();
	}

	// get profile
	public getProfile = async (req: Request) => {
		const { user_id } = req.hotelier;
		const userModel = this.Model.UserModel();

		const { password_hash, ...rest } =
			await userModel.getSingleCommonAuthUser<IHotelierAuthView>({
				table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
				schema_name: "hotelier",
				user_id,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: {
				...rest,
			},
		};
	};

	//change password
	public async changePassword(req: Request) {
		const { user_id } = req.hotelier;
		const { old_password, new_password } =
			req.body as IChangePasswordPayload;

		const model = this.Model.UserModel();
		const user_details =
			await model.getSingleCommonAuthUser<IJobSeekerAuthView>({
				schema_name: "hotelier",
				table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
				user_id,
			});
		if (!user_details) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		const verify_password = await Lib.compareHashValue(
			old_password,
			user_details.password_hash
		);
		if (!verify_password) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: this.ResMsg.PASSWORDS_DO_NOT_MATCH,
			};
		}

		const hashed_password = await Lib.hashValue(new_password);
		const password_changed = await model.updateProfile(
			{ password_hash: hashed_password },
			{ id: user_id }
		);
		if (password_changed) {
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.PASSWORD_CHANGED,
			};
		} else {
			return {
				success: false,
				code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
				message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
			};
		}
	}

	// update profile
	public async updateHotelier(req: Request) {
		const { user_id } = req.hotelier;
		const id = req.params.id as unknown as number;
		return await this.db.transaction(async (trx) => {
			const model = this.Model.organizationModel(trx);
			const commonModel = this.Model.commonModel(trx);
			const userModel = this.Model.UserModel(trx);

			const [existingUser] = await userModel.checkUser({
				id: user_id,
				type: USER_TYPE.HOTELIER,
			});

			if (!existingUser) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}

			const data = await model.getOrganization({ user_id });

			if (!data) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			const files = req.files as Express.MulterS3.File[];
			const body = req.body;
			const parsed = {
				user: Lib.safeParseJSON(body.user) || {},
				organization: Lib.safeParseJSON(body.organization) || {},
				organization_address:
					Lib.safeParseJSON(body.organization_address) || {},
			} as IHotelierUpdateParsedBody;
			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "photo":
						parsed.user.photo = filename;
						break;
					case "organization_photo":
						parsed.organization.photo = filename;
						break;
					default:
						throw new CustomError(
							this.ResMsg.UNKNOWN_FILE_FIELD,
							this.StatusCode.HTTP_BAD_REQUEST,
							"ERROR"
						);
				}
			}

			if (
				parsed?.user?.phone_number &&
				parsed.user.phone_number !== existingUser.phone_number
			) {
				const phoneExists = await userModel.checkUser({
					phone_number: parsed.user.phone_number,
					type: USER_TYPE.HOTELIER,
				});
				if (phoneExists.length > 0) {
					throw new CustomError(
						this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
						this.StatusCode.HTTP_BAD_REQUEST,
						"ERROR"
					);
				}
			}

			const updateTasks: Promise<unknown>[] = [];

			if (Object.keys(parsed.user).length > 0) {
				updateTasks.push(
					userModel.updateProfile(parsed.user, { id: data.user_id })
				);
			}

			if (Object.keys(parsed.organization).length > 0) {
				updateTasks.push(
					model.updateOrganization(
						{
							name: parsed.organization.name || data.name,
							details:
								parsed.organization.details || data.details,
							photo: parsed.organization.photo || data.photo,
						},
						{
							id: id,
						}
					)
				);
			}

			if (parsed.organization.status === USER_STATUS.ACTIVE) {
				if (data.status === parsed.organization.status) {
					throw new CustomError(
						`Already updated status to ${parsed.organization.status}`,
						this.StatusCode.HTTP_CONFLICT
					);
				}
			}

			let stateId = 0;
			let city_id = 0;
			if (Object.keys(parsed.organization_address).length > 0) {
				if (parsed.organization_address.city) {
					// check country
					const checkCountry = await commonModel.getAllCountry({
						name: parsed.organization_address.country,
					});

					if (!checkCountry.length) {
						throw new CustomError(
							"Service not available in this country",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}

					const checkState = await commonModel.getAllStates({
						country_id: checkCountry[0].id,
						name: parsed.organization_address.state,
					});
					if (!checkState.length) {
						const state = await commonModel.createState({
							country_id: checkCountry[0].id,
							name: parsed.organization_address.state as string,
						});
						stateId = state[0].id;
					} else {
						stateId = checkState[0].id;
					}

					const checkCity = await commonModel.getAllCity({
						country_id: checkCountry[0].id,
						state_id: stateId,
						name: parsed.organization_address.city,
					});
					if (!checkCity.length) {
						const city = await commonModel.createCity({
							country_id: checkCountry[0].id,
							state_id: stateId,
							name: parsed.organization_address.city,
						});
						city_id = city[0].id;
					} else {
						city_id = checkCity[0].id;
					}
				}
				if (data.location_id) {
					const checkLocation = await commonModel.getLocation({
						location_id: data.location_id,
					});
					if (!checkLocation) {
						throw new CustomError(
							"Location not found!",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}
					updateTasks.push(
						commonModel.updateLocation(
							{
								city_id: checkLocation.city_id,
								name: parsed.organization_address.name,
								address: parsed.organization_address.address,
								longitude:
									parsed.organization_address.longitude,
								latitude: parsed.organization_address.latitude,
								postal_code:
									parsed.organization_address.postal_code,
								is_home_address:
									parsed.organization_address.is_home_address,
							},
							{
								location_id: data.location_id,
							}
						)
					);
				} else {
					updateTasks.push(
						(async () => {
							const [locationRecord] =
								await commonModel.createLocation({
									city_id,
									name: parsed.organization_address.name,
									address:
										parsed.organization_address.address,
									longitude:
										parsed.organization_address.longitude,
									latitude:
										parsed.organization_address.latitude,
									postal_code:
										parsed.organization_address.postal_code,
									is_home_address:
										parsed.organization_address
											.is_home_address,
								});
							parsed.organization.location_id = locationRecord.id;
						})()
					);
				}
			}

			await Promise.all(updateTasks);
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}
}
