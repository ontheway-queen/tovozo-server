import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	BRITISH_ID,
	USER_STATUS,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { NotificationTypeEnum } from "../../../utils/modelTypes/common/commonModelTypes";
import { IJobApplicationStatus } from "../../../utils/modelTypes/jobApplication/jobApplicationModel.types";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import {
	registrationFromAdminTemplate,
	registrationVerificationCompletedTemplate,
} from "../../../utils/templates/registrationVerificationCompletedTemplate";
import {
	IJobSeekerInfoBody,
	IJobSeekerNationalityBody,
	IJobSeekerUserBody,
} from "../../auth/utils/types/jobSeekerAuth.types";
import { UserStatusType } from "../../public/utils/types/publicCommon.types";
import { IAdminJobSeekerUpdateParsedBody } from "../utils/types/adminJobSeeker.types";
class AdminJobSeekerService extends AbstractServices {
	public async createJobSeeker(req: Request) {
		return this.db.transaction(async (trx) => {
			const { user_id } = req.admin;
			const files = (req.files as Express.Multer.File[]) || [];

			const parseInput = (key: string) =>
				Lib.safeParseJSON(req.body[key]) || {};

			const userInput = parseInput("user") as IJobSeekerUserBody;
			const jobSeekerInput = parseInput(
				"job_seeker"
			) as IJobSeekerNationalityBody;
			const jobSeekerInfoInput = parseInput(
				"job_seeker_info"
			) as IJobSeekerInfoBody;

			// Attach file references
			let idCopyFound = false;
			for (const { fieldname, filename } of files) {
				if (fieldname === "photo") {
					userInput.photo = filename;
					continue;
				}

				if (jobSeekerInput.nationality === BRITISH_ID) {
					if (fieldname === "id_copy") {
						idCopyFound = true;
					} else if (fieldname !== "passport_copy") {
						throw new CustomError(
							"Only id_copy is allowed for British nationality",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}
				} else {
					if (fieldname !== "visa_copy") {
						throw new CustomError(
							"Only visa_copy required for Non-British Nationality",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}
				}

				jobSeekerInfoInput[fieldname] = filename;
			}
			if (jobSeekerInput.nationality === BRITISH_ID && !idCopyFound) {
				throw new CustomError(
					"id_copy is required for British Nationality",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const { email, phone_number, password, ...restUserData } =
				userInput;

			const userModel = this.Model.UserModel(trx);
			const jobSeekerModel = this.Model.jobSeekerModel(trx);

			const existingUser = await userModel.checkUser({
				email,
				phone_number,
				type: USER_TYPE.JOB_SEEKER,
			});

			if (existingUser && existingUser.length) {
				for (const user of existingUser) {
					if (user.email === email) {
						return {
							success: false,
							code: this.StatusCode.HTTP_BAD_REQUEST,
							message: this.ResMsg.EMAIL_ALREADY_EXISTS,
						};
					}

					if (user.phone_number === phone_number) {
						return {
							success: false,
							code: this.StatusCode.HTTP_BAD_REQUEST,
							message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
						};
					}
				}
			}

			const password_hash = await Lib.hashValue(password);

			const registration = await userModel.createUser({
				...restUserData,
				email,
				phone_number,
				password_hash,
				type: USER_TYPE.JOB_SEEKER,
			});

			if (!registration.length) {
				throw new CustomError(
					this.ResMsg.HTTP_BAD_REQUEST,
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const jobSeekerId = registration[0].id;

			await jobSeekerModel.createJobSeeker({
				...jobSeekerInput,
				user_id: jobSeekerId,
			});

			const tokenPayload = {
				user_id: jobSeekerId,
				name: userInput.name,
				gender: userInput.gender,
				user_email: email,
				phone_number,
				photo: userInput.photo,
				status: true,
				create_date: new Date(),
			};

			await this.insertNotification(trx, TypeUser.ADMIN, {
				user_id: jobSeekerId,
				sender_type: USER_TYPE.ADMIN,
				title: this.NotificationMsg.JOB_SEEKER_ACCOUNT_CREATED.title,
				content:
					this.NotificationMsg.JOB_SEEKER_ACCOUNT_CREATED.content(
						userInput.name
					),
				related_id: jobSeekerId,
				type: NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
			});

			await this.insertAdminAudit(trx, {
				created_by: user_id,
				details: `A job seeker account (${userInput.name}) has been created.`,
				endpoint: req.originalUrl,
				type: "CREATE",
				payload: JSON.stringify(parseInput),
			});

			await Lib.sendEmailDefault({
				email,
				emailSub: `Hi ${userInput.name}, your account has been created successfully`,
				emailBody: registrationFromAdminTemplate(userInput.name, {
					email: userInput.email,
					password: userInput.password,
				}),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				data: tokenPayload,
			};
		});
	}

	public async getJobSeekers(req: Request) {
		const {
			name,
			status,
			limit = 100,
			skip = 0,
			from_date,
			to_date,
			sortBy,
			application_status,
		} = req.query as unknown as {
			name?: string;
			status?: UserStatusType;
			limit?: number;
			skip?: number;
			from_date?: string;
			to_date?: string;
			sortBy: "asc" | "desc";
			application_status: IJobApplicationStatus;
		};
		const model = this.Model.jobSeekerModel();
		const data = await model.getAllJobSeekerList({
			name,
			limit,
			skip,
			status,
			from_date,
			to_date,
			sortBy,
			application_status,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getSingleJobSeeker(req: Request) {
		const { id } = req.params as unknown as { id: number };
		const model = this.Model.jobSeekerModel();
		const data = await model.getJobSeekerDetails({ user_id: id });
		if (!data) {
			return {
				success: false,
				message: `The requested job seeker account with ID ${id} not found`,
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: {
				...data,
			},
		};
	}

	public async updateJobSeeker(req: Request) {
		return await this.db.transaction(async (trx) => {
			const user_id = req.admin.user_id;
			const id = req.params.id as unknown as number;
			const model = this.Model.jobSeekerModel(trx);
			const data = await model.getJobSeekerDetails({ user_id: id });
			if (!data) {
				return {
					success: false,
					message: `The requested job seeker account with ID ${id} not found`,
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}
			const files = req.files as Express.MulterS3.File[];
			console.log({ files });
			const parsed = {
				user: Lib.safeParseJSON(req.body.user) || {},
				jobSeeker: Lib.safeParseJSON(req.body.job_seeker) || {},
				jobSeekerInfo:
					Lib.safeParseJSON(req.body.job_seeker_info) || {},
				ownAddress: Lib.safeParseJSON(req.body.own_address) || {},
				addJobPreferences:
					Lib.safeParseJSON(req.body.add_job_preferences) || [],
				delJobPreferences:
					Lib.safeParseJSON(req.body.del_job_preferences) || [],
				addJobLocations:
					Lib.safeParseJSON(req.body.add_job_locations) || [],
				delJobLocations:
					Lib.safeParseJSON(req.body.del_job_locations) || [],
				updateJobLocations:
					Lib.safeParseJSON(req.body.update_job_locations) || [],
				addJobShifting:
					Lib.safeParseJSON(req.body.add_job_shifting) || [],
				delJobShifting:
					Lib.safeParseJSON(req.body.del_job_shifting) || [],
			} as IAdminJobSeekerUpdateParsedBody;

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "resume":
						parsed.jobSeekerInfo.resume = filename;
						break;
					case "photo":
						parsed.user.photo = filename;
						break;
					case "visa_copy":
						parsed.jobSeekerInfo.visa_copy = filename;
						break;
					case "id_copy":
						parsed.jobSeekerInfo.id_copy = filename;
						break;
					case "passport_copy":
						parsed.jobSeekerInfo.passport_copy = filename;
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
			const jobSeekerModel = this.Model.jobSeekerModel(trx);
			const commonModel = this.Model.commonModel(trx);

			const [existingUser] = await userModel.checkUser({
				id: id,
				type: USER_TYPE.JOB_SEEKER,
			});

			if (!existingUser) {
				throw new CustomError(
					`The requested job seeker account with ID ${id} not found`,
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
					type: USER_TYPE.JOB_SEEKER,
				});
				if (phoneExists.length) {
					throw new CustomError(
						this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
						this.StatusCode.HTTP_BAD_REQUEST,
						"ERROR"
					);
				}
			}

			const updateTasks: Promise<any>[] = [];

			if (Object.keys(parsed.user).length > 0) {
				updateTasks.push(userModel.updateProfile(parsed.user, { id }));
			}

			if (Object.keys(parsed.ownAddress).length > 0) {
				updateTasks.push(
					commonModel.updateLocation(parsed.ownAddress, {
						location_id: parsed.ownAddress.id!,
					})
				);
			}

			if (Object.keys(parsed.jobSeeker).length > 0) {
				if (parsed.jobSeeker.account_status) {
					const checkJobSeeker = await jobSeekerModel.getJobSeeker({
						user_id: id,
					});
					if (!checkJobSeeker) {
						throw new CustomError(
							"Job Seeker account not found!",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}

					if (
						parsed.jobSeeker.account_status ===
						checkJobSeeker.account_status
					) {
						throw new CustomError(
							`Already updated status to ${parsed.jobSeeker.account_status}`,
							this.StatusCode.HTTP_CONFLICT
						);
					}
					if (parsed.jobSeeker.final_completed) {
						if (!checkJobSeeker.is_completed) {
							throw new CustomError(
								"Job Seeker account not completed!",
								this.StatusCode.HTTP_CONFLICT
							);
						}
						parsed.jobSeeker.final_completed_at =
							new Date().toISOString();
						parsed.jobSeeker.final_completed_by = user_id;

						await this.insertNotification(
							trx,
							USER_TYPE.JOB_SEEKER,
							{
								title: "Your account has been completed",
								content: `Your account has been completed. You can now start applying for jobs.`,
								related_id: id,
								sender_type: USER_TYPE.ADMIN,
								sender_id: user_id,
								user_id: id,
								type: "JOB_SEEKER_VERIFICATION",
							}
						);
					}
				}
				updateTasks.push(
					jobSeekerModel.updateJobSeeker(parsed.jobSeeker, {
						user_id: id,
					})
				);
			}

			if (parsed.updateJobLocations.length > 0) {
				for (const loc of parsed.updateJobLocations) {
					updateTasks.push(
						commonModel.updateLocation(loc, { location_id: loc.id })
					);
				}
			}

			await Promise.all(updateTasks);

			if (parsed.jobSeeker.account_status === USER_STATUS.ACTIVE) {
				await Lib.sendEmailDefault({
					email: existingUser.email,
					emailSub:
						"Job Seeker Account Activation Successful – You Can Now Log In",
					emailBody: registrationVerificationCompletedTemplate(
						existingUser.name,
						"tovozo://login"
					),
				});
			}

			await this.insertAdminAudit(trx, {
				details: `Job seeker (${existingUser.name} - ${id}) profile has been updated.`,
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

	public async deleteJobSeeker(req: Request) {
		const id = req.params.id as unknown as number;
		return await this.db.transaction(async (trx) => {
			const model = this.Model.jobSeekerModel();
			const data = await model.getJobSeekerDetails({ user_id: id });
			if (!data) {
				return {
					success: false,
					message: `The requested job seeker account with ID ${id} not found`,
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}
			const userModel = this.Model.UserModel(trx);
			await userModel.deleteUser(id);
			await this.insertAdminAudit(trx, {
				details: `Job seeker (${data.name} - ${id}) has been deleted.`,
				created_by: req.admin.user_id,
				endpoint: req.originalUrl,
				type: "DELETE",
			});
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: `Job seeker (${data.name} - ${id}) has been deleted successfully.`,
			};
		});
	}

	public async getNearestJobSeekers(req: Request) {
		const jobSeeker = this.Model.jobSeekerModel();
		const { lat, lon, name } = req.query;
		const orgLat = parseFloat(lat as string);
		const orgLng = parseFloat(lon as string);

		const all = await jobSeeker.getJobSeekerLocation({
			name: name as string,
		});

		const nearbySeekers: { id: number; name: string }[] = [];

		for (const seeker of all) {
			const seekerLat = parseFloat(seeker.latitude);
			const seekerLng = parseFloat(seeker.longitude);

			const distance = Lib.getDistanceFromLatLng(
				orgLat,
				orgLng,
				seekerLat,
				seekerLng
			);
			console.log({ seeker });
			if (distance <= 10) {
				nearbySeekers.push({
					id: seeker.user_id,
					name: seeker.name,
				});
			}
		}

		return {
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: nearbySeekers,
		};
	}
}

export default AdminJobSeekerService;
