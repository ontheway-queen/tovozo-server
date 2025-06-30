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
	IOrganizationAmenitiesType,
	IOrganizationName,
} from "../../auth/utils/types/hotelierAuth.types";
import { UserStatusType } from "../../public/utils/types/publicCommon.types";
import { IHotelierUpdateParsedBody } from "../utils/types/adminHotelier.types";
class AdminHotelierService extends AbstractServices {
	public async createHotelier(req: Request) {
		const { user_id } = req.admin;
		return this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];
			console.log({ user: req.body });
			const { designation, ...user } = Lib.safeParseJSON(
				req.body.user
			) as IHotelierUser;
			const organization = Lib.safeParseJSON(
				req.body.organization
			) as IOrganizationName;
			const organizationAddress = Lib.safeParseJSON(
				req.body.organization_address
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

			const organization_location = await commonModel.createLocation(
				organizationAddress
			);
			const locationId = organization_location[0].id;
			const userId = registration[0].id;

			await userModel.createUserMaintenanceDesignation({
				designation,
				user_id: userId,
			});
			const orgInsert = await organizationModel.createOrganization({
				...organization,
				status: USER_STATUS.ACTIVE,
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
		const [organization_amenities, organization_photos] = await Promise.all(
			[
				organizationModel.getAmenities({ organization_id: data.id }),
				organizationModel.getPhotos(data.id),
			]
		);
		const jobPosts = await jobPostModel.getHotelierJobPostList({
			organization_id: data.id,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: {
				...data,
				organization_amenities,
				organization_photos,
				jobPosts: jobPosts.data,
			},
		};
	}

	public async updateHotelier(req: Request) {
		const id = req.params.id as unknown as number;
		return await this.db.transaction(async (trx) => {
			const model = this.Model.organizationModel(trx);
			const data = await model.getSingleOrganization(id);
			console.log({ data });
			if (!data) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			const files = req.files as Express.MulterS3.File[];
			const parsed = {
				organization: Lib.safeParseJSON(req.body.organization) || {},
				user: Lib.safeParseJSON(req.body.user) || {},
				addPhoto: Lib.safeParseJSON(req.body.add_photo) || [],
				deletePhoto: Lib.safeParseJSON(req.body.delete_photo) || [],
				addAmenities: Lib.safeParseJSON(req.body.add_amenities) || [],
				updateAmenities:
					Lib.safeParseJSON(req.body.update_amenities) || {},
				deleteAmenities:
					Lib.safeParseJSON(req.body.delete_amenities) || [],
			} as IHotelierUpdateParsedBody;

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "profile_photo":
						parsed.user.photo = filename;
						break;
					case "photo":
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

			const userModel = this.Model.UserModel(trx);

			const [existingUser] = await userModel.checkUser({
				id: id,
				type: USER_TYPE.HOTELIER,
			});
			console.log({ existingUser });

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

				if (phoneExists) {
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
					model.updateOrganization(parsed.organization, {
						user_id: id,
					})
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
				await Lib.sendEmailDefault({
					email: existingUser.email,
					emailSub:
						"Hotelier Account Activation Successful – You Can Now Log In",
					emailBody: registrationVerificationCompletedTemplate(
						existingUser.name,
						"Trabill OTA B2B://login"
					),
				});

				// await this.insertNotification(trx, TypeUser.HOTELIER, {
				//   user_id: id,
				//   content: `Your account has been updated to ${parsed.hotelier.status}`,
				//   related_id: id,
				//   type: "HOTELIER_VERIFICATION",
				// });
			}

			await this.insertAdminAudit(trx, {
				details: `Hotelier (${existingUser.name} - ${id}) profile has been updated.`,
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
