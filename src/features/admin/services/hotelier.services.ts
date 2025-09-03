import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import { USER_STATUS, USER_TYPE } from "../../../utils/miscellaneous/constants";
import {
	registrationFromAdminTemplate,
	registrationVerificationCompletedTemplate,
} from "../../../utils/templates/registrationVerificationCompletedTemplate";
import {
	IHotelierUser,
	IOrganizationAddressPayload,
} from "../../auth/utils/types/hotelierAuth.types";
import { UserStatusType } from "../../public/utils/types/publicCommon.types";
import { IHotelierUpdateParsedBody } from "../utils/types/adminHotelier.types";
class AdminHotelierService extends AbstractServices {
	public async createHotelier(req: Request) {
		const { user_id } = req.admin;

		return this.db.transaction(async (trx) => {
			const user = Lib.safeParseJSON(req.body.user) as IHotelierUser;
			const organization = Lib.safeParseJSON(req.body.organization);
			const organizationAddress = Lib.safeParseJSON(
				req.body.organization_address
			) as IOrganizationAddressPayload;

			const files = (req.files as Express.Multer.File[]) || [];
			for (const file of files) {
				if (file.fieldname === "photo") {
					user.photo = file.filename;
				}

				if (file.fieldname === "organization_photo") {
					organization.photo = file.filename;
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
			let stateId = 0;
			let city_id = 0;
			let location_id = null;
			if (Object.keys(organizationAddress).length > 0) {
				if (organizationAddress.city) {
					// check country
					const checkCountry = await commonModel.getAllCountry({
						name: organizationAddress.country,
					});

					if (!checkCountry.length) {
						throw new CustomError(
							"Service not available in this country",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}

					const checkState = await commonModel.getAllStates({
						country_id: checkCountry[0].id,
						name: organizationAddress.state,
					});
					if (!checkState.length) {
						const state = await commonModel.createState({
							country_id: checkCountry[0].id,
							name: organizationAddress.state as string,
						});
						stateId = state[0].id;
					} else {
						stateId = checkState[0].id;
					}

					const checkCity = await commonModel.getAllCity({
						country_id: checkCountry[0].id,
						state_id: stateId,
						name: organizationAddress.city,
					});
					if (!checkCity.length) {
						const city = await commonModel.createCity({
							country_id: checkCountry[0].id,
							state_id: stateId,
							name: organizationAddress.city,
						});
						city_id = city[0].id;
					} else {
						city_id = checkCity[0].id;
					}
				}

				const [locationRecord] = await commonModel.createLocation({
					city_id,
					name: organizationAddress.name,
					address: organizationAddress.address,
					longitude: organizationAddress.longitude,
					latitude: organizationAddress.latitude,
					postal_code: organizationAddress.postal_code,
					is_home_address: organizationAddress.is_home_address,
				});
				location_id = locationRecord.id;
			}
			const orgInsert = await organizationModel.createOrganization({
				name: organization.org_name,
				details: organization.details,
				photo: organization.photo,
				status: USER_STATUS.ACTIVE,
				user_id: registration[0].id,
				location_id,
			});

			const tokenData = {
				user_id: registration[0].id,
				name: user.name,
				user_email: email,
				phone_number,
				photo: user.photo,
				status: true,
				create_date: new Date(),
			};
			await Lib.sendEmailDefault({
				email,
				emailSub: `Hi ${user.name}, your account has been created successfully`,
				emailBody: registrationFromAdminTemplate(user.name, {
					email: user.email,
					password: user.password,
				}),
			});

			await this.insertAdminAudit(trx, {
				created_by: user_id,
				details: `Hotelier Account (${user.name}) has been created.`,
				endpoint: req.originalUrl,
				type: "CREATE",
				payload: req.body,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				data: tokenData,
			};
		});
	}

	public async getHoteliers(req: Request) {
		const {
			id,
			user_id,
			name,
			status,
			limit = 100,
			skip = 0,
			from_date,
			to_date,
		} = req.query as unknown as {
			id?: string;
			user_id?: string;
			name?: string;
			status?: UserStatusType;
			limit?: number;
			skip?: number;
			from_date?: string;
			to_date?: string;
		};
		const model = this.Model.organizationModel();
		const data = await model.getOrganizationList({
			id: id ? Number(id) : undefined,
			user_id: user_id ? Number(user_id) : undefined,
			name,
			limit,
			skip,
			status,
			from_date,
			to_date,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleHotelier(req: Request) {
		const { id } = req.params as unknown as { id: number };
		const organizationModel = this.Model.organizationModel();
		const jobPostModel = this.Model.jobPostModel();
		const data = await organizationModel.getSingleOrganization(id);
		if (!data) {
			return {
				success: false,
				message: this.ResMsg.HTTP_NOT_FOUND,
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}
		// const [organization_amenities, organization_photos] = await Promise.all(
		// 	[
		// 		organizationModel.getAmenities({ organization_id: data.id }),
		// 		organizationModel.getPhotos(data.id),
		// 	]
		// );
		const jobPosts = await jobPostModel.getJobPostListForHotelier({
			organization_id: data.id,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: {
				...data,
				// organization_amenities,
				// organization_photos,
				jobPosts: jobPosts.data,
			},
		};
	}

	public async updateHotelier(req: Request) {
		const id = req.params.id as unknown as number;
		return await this.db.transaction(async (trx) => {
			const model = this.Model.organizationModel(trx);
			const commonModel = this.Model.commonModel(trx);
			const data = await model.getSingleOrganization(id);

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

			const userModel = this.Model.UserModel(trx);

			const [existingUser] = await userModel.checkUser({
				id: data.user_id,
				type: USER_TYPE.HOTELIER,
			});

			if (!existingUser) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
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
							name:
								parsed.organization.name ||
								parsed.organization.org_name ||
								data.name,
							details:
								parsed.organization.details || data.details,
							photo: parsed.organization.photo || data.photo,
							status: parsed.organization.status || data.status,
						},
						{
							id: id,
						}
					)
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

			await this.insertAdminAudit(trx, {
				details: `Hotelier (${existingUser.name} - ${data.user_id}) profile has been updated.`,
				created_by: req.admin.user_id,
				endpoint: req.originalUrl,
				type: "UPDATE",
				payload: JSON.stringify(parsed),
			});
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async deleteHotelier(req: Request) {
		const id = req.params.id as unknown as number;
		return await this.db.transaction(async (trx) => {
			const model = this.Model.organizationModel(trx);
			const data = await model.getSingleOrganization(id);
			if (!data) {
				return {
					success: false,
					message: this.ResMsg.HTTP_NOT_FOUND,
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}
			const userModel = this.Model.UserModel(trx);
			await userModel.deleteUser(data.user_id);
			await model.deleteOrganization({ id: data.id });
			await this.insertAdminAudit(trx, {
				details: `Hotelier (${data.name} - ${data.user_id}) has been deleted.`,
				created_by: req.admin.user_id,
				endpoint: req.originalUrl,
				type: "DELETE",
			});
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: `Hotelier (${data.name} - ${data.user_id}) has been deleted successfully.`,
			};
		});
	}
}

export default AdminHotelierService;
