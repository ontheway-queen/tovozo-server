import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	USER_AUTHENTICATION_VIEW,
	USER_STATUS,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	IChangePasswordPayload,
	ILocationUpdatePayload,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { registrationVerificationCompletedTemplate } from "../../../utils/templates/registrationVerificationCompletedTemplate";
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
				organization: Lib.safeParseJSON(body.organization) || {},
				user: Lib.safeParseJSON(body.user) || {},
				addPhoto: Lib.safeParseJSON(body.add_photo) || [],
				deletePhoto: Lib.safeParseJSON(body.delete_photo) || [],
				addAmenities: Lib.safeParseJSON(body.add_amenities) || [],
				updateAmenities: Lib.safeParseJSON(body.update_amenities) || {},
				deleteAmenities: Lib.safeParseJSON(body.delete_amenities) || [],
				organization_address:
					Lib.safeParseJSON(body.organization_address) || {},
			} as IHotelierUpdateParsedBody;
			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "photo":
						parsed.user.photo = filename;
						break;
					case "hotel_photo":
						parsed.addPhoto.push({
							file: filename,
							organization_id: id,
						});
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
				if (parsed.organization.status) {
					const checkHotelier = await model.getSingleOrganization(id);
					if (!checkHotelier) {
						throw new CustomError(
							"Hotelier account not found!",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}

					if (parsed.organization.status === checkHotelier.status) {
						throw new CustomError(
							`Already updated status to ${parsed.organization.status}`,
							this.StatusCode.HTTP_CONFLICT
						);
					}
				}
				updateTasks.push(
					model.updateOrganization(
						{
							name: parsed.organization.org_name || data.org_name,
							status: parsed.organization.status || data.status,
						},
						{
							id: id,
						}
					)
				);
			}

			if (parsed.addPhoto.length > 0) {
				updateTasks.push(model.addPhoto(parsed.addPhoto));
			}

			if (parsed.deletePhoto.length > 0) {
				for (const delP of parsed.deletePhoto) {
					updateTasks.push(model.deletePhoto(Number(delP)));
				}
			}

			if (parsed.addAmenities.length > 0) {
				const amenitiesPayload: {
					amenity: string;
					organization_id: number;
				}[] = [];
				for (const amenity of parsed.addAmenities) {
					amenitiesPayload.push({ amenity, organization_id: id });
				}
				updateTasks.push(model.addAmenities(amenitiesPayload));
			}

			if (Object.keys(parsed.updateAmenities).length) {
				const checkUpdateAmenity = await model.getAmenities({
					organization_id: id,
					id: parsed.updateAmenities.id,
				});
				if (!checkUpdateAmenity.length) {
					throw new CustomError(
						"Update amenity not found!",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}
				updateTasks.push(
					model.updateAmenities(
						parsed.updateAmenities.amenity,
						parsed.updateAmenities.id
					)
				);
			}

			if (parsed.deleteAmenities.length > 0) {
				const checkAmenities = await model.getAmenities({
					organization_id: id,
				});
				if (!checkAmenities.length) {
					throw new CustomError(
						"Amenity not found!",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}
				updateTasks.push(
					model.deleteAmenities({
						organization_id: id,
						ids: parsed.deleteAmenities,
					})
				);
			}

			await Promise.all(updateTasks);

			if (parsed.organization.status === USER_STATUS.ACTIVE) {
				if (data.status === parsed.organization.status) {
					throw new CustomError(
						`Already updated status to ${parsed.organization.status}`,
						this.StatusCode.HTTP_CONFLICT
					);
				}
				await Lib.sendEmailDefault({
					email: existingUser.email,
					emailSub:
						"Hotelier Account Activation Successful – You Can Now Log In",
					emailBody: registrationVerificationCompletedTemplate(
						existingUser.name,
						"tovozo://login"
					),
				});
			}
			if (Object.keys(parsed.organization_address).length > 0) {
				if (parsed.organization_address.city_id) {
					const checkCity = await commonModel.getAllCity({
						city_id: parsed.organization_address.city_id,
					});
					if (!checkCity.length) {
						throw new CustomError(
							"City not found!",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}
				}
				if (parsed.organization_address.id) {
					const checkLocation = await commonModel.getLocation({
						location_id: parsed.organization_address.id,
					});
					if (!checkLocation) {
						throw new CustomError(
							"Location not found!",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}
					updateTasks.push(
						commonModel.updateLocation(
							parsed.organization_address,
							{
								location_id: parsed.organization_address.id,
							}
						)
					);
				} else {
					updateTasks.push(
						commonModel.createLocation(
							parsed.organization_address as ILocationUpdatePayload
						)
					);
				}
			}

			// await this.insertAdminAudit(trx, {
			// 	details: `Hotelier (${existingUser.name} - ${data.user_id}) profile has been updated.`,
			// 	created_by: req.admin.user_id,
			// 	endpoint: req.originalUrl,
			// 	type: "UPDATE",
			// 	payload: JSON.stringify(parsed),
			// });
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}
}
