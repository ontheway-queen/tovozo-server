import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	JOB_APPLICATION_STATUS,
	USER_AUTHENTICATION_VIEW,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	IChangePasswordPayload,
	NotificationTypeEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { IJobSeekerAuthView } from "../../auth/utils/types/jobSeekerAuth.types";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

export default class JobSeekerProfileService extends AbstractServices {
	constructor() {
		super();
	}

	// get profile
	public getProfile = async (req: Request) => {
		const { user_id } = req.jobSeeker;
		const jobSeekerModel = this.Model.jobSeekerModel();

		const { applied_jobs, ...rest } =
			await jobSeekerModel.getJobSeekerDetails({
				user_id,
			});

		const isWaitingForApproval = applied_jobs?.filter(
			(job) =>
				job.application_status ===
				JOB_APPLICATION_STATUS.WaitingForApproval
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: {
				...rest,
				is_waiting_for_approval: isWaitingForApproval!.length > 0,
				applied_jobs,
			},
		};
	};

	public async updateProfile(req: Request) {
		return this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];

			const { user_id } = req.jobSeeker;

			const parsed = {
				user: Lib.safeParseJSON(req.body.user) || {},
				jobSeeker: Lib.safeParseJSON(req.body.job_seeker) || {},
				ownAddress: Lib.safeParseJSON(req.body.own_address) || {},
				bank_details: Lib.safeParseJSON(req.body.bank_details) || {},
			};

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "photo":
						parsed.user.photo = filename;
						break;

					case "id_copy":
						parsed.jobSeeker.id_copy = filename;
						break;

					case "work_permit":
						parsed.jobSeeker.work_permit = filename;
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
				id: user_id,
				type: USER_TYPE.JOB_SEEKER,
			});

			if (!existingUser) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}
			if (
				parsed.user.phone_number &&
				parsed.user.phone_number === existingUser.phone_number
			) {
				const phoneExists = await userModel.checkUser({
					phone_number: parsed.user.phone_number,
					type: USER_TYPE.JOB_SEEKER,
				});

				if (phoneExists && phoneExists.length > 0) {
					throw new CustomError(
						this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
						this.StatusCode.HTTP_BAD_REQUEST,
						"ERROR"
					);
				}
			}

			const updateTasks: Promise<any>[] = [];

			if (parsed.user && Object.keys(parsed.user).length > 0) {
				updateTasks.push(
					userModel.updateProfile(parsed.user, { id: user_id })
				);
			}

			if (
				parsed.ownAddress &&
				Object.keys(parsed.ownAddress).length > 0
			) {
				updateTasks.push(
					commonModel.updateLocation(parsed.ownAddress, {
						location_id: parsed.ownAddress.id!,
					})
				);
			}

			if (parsed.jobSeeker && Object.keys(parsed.jobSeeker).length > 0) {
				updateTasks.push(
					jobSeekerModel.updateJobSeeker(parsed.jobSeeker, {
						user_id,
					})
				);
			}

			await Promise.all(updateTasks);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	// update User Verification Details
	public async updateUserVerificationDetails(req: Request) {
		return this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];
			const { user_id } = req.jobSeeker;

			const parsed = {
				jobSeeker: Lib.safeParseJSON(req.body.job_seeker) || {},
				bank_details: Lib.safeParseJSON(req.body.bank_details) || {},
			};

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "id_copy":
						parsed.jobSeeker.id_copy = filename;
						break;

					case "work_permit":
						parsed.jobSeeker.work_permit = filename;
						break;

					default:
						throw new CustomError(
							this.ResMsg.UNKNOWN_FILE_FIELD,
							this.StatusCode.HTTP_BAD_REQUEST,
							"ERROR"
						);
				}
			}

			if (!parsed.jobSeeker.id_copy) {
				throw new CustomError(
					"ID Copy file is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}
			if (!parsed.jobSeeker.work_permit) {
				throw new CustomError(
					"Work Permit file is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const userModel = this.Model.UserModel(trx);
			const jobSeekerModel = this.Model.jobSeekerModel(trx);

			const [existingUser] = await userModel.checkUser({
				id: user_id,
				type: USER_TYPE.JOB_SEEKER,
			});

			if (!existingUser) {
				throw new CustomError(
					this.ResMsg.HTTP_NOT_FOUND,
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}

			const updateTasks: Promise<any>[] = [];

			if (parsed.jobSeeker && Object.keys(parsed.jobSeeker).length > 0) {
				updateTasks.push(
					jobSeekerModel.updateJobSeeker(
						{
							is_completed: true,
							completed_at: new Date(),
							...parsed.jobSeeker,
						},
						{
							user_id,
						}
					)
				);
			}
			const accountNumber = String(
				parsed.bank_details.account_number
			).trim();
			const isAccountExists = await jobSeekerModel.getBankAccounts({
				user_id,
				account_number: accountNumber,
			});
			console.log({ isAccountExists });

			if (isAccountExists.length > 0) {
				throw new CustomError(
					"Same Bank account already exists for this user",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			if (
				parsed.bank_details &&
				Object.keys(parsed.bank_details).length > 0
			) {
				const existingAccounts = await jobSeekerModel.getBankAccounts({
					user_id,
				});

				if (existingAccounts.length === 0) {
					parsed.bank_details.is_primary = true;
				} else if (
					parsed.bank_details.is_primary !== undefined &&
					parsed.bank_details.is_primary !== false
				) {
					const isPrimaryAccountExists = existingAccounts.filter(
						(acc: any) => acc.is_primary
					);
					if (isPrimaryAccountExists.length > 0) {
						throw new CustomError(
							"Primary bank details already added for this user",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}
				}

				updateTasks.push(
					jobSeekerModel.addBankDetails({
						job_seeker_id: user_id,
						...parsed.bank_details,
					})
				);
			}

			await Promise.all(updateTasks);

			await this.insertNotification(trx, TypeUser.ADMIN, {
				user_id,
				sender_type: USER_TYPE.ADMIN,
				title: this.NotificationMsg.VERIFICATION_SUBMITTED.title,
				content: this.NotificationMsg.VERIFICATION_SUBMITTED.content({
					name: existingUser.name,
				}),
				related_id: user_id,
				type: NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	// make account primary
	public async markAccountAsPrimary(req: Request) {
		const { id } = req.params; // bank_details id
		const { user_id } = req.jobSeeker;

		return this.db.transaction(async (trx) => {
			const jobseekerModel = this.Model.jobSeekerModel(trx);

			const allBanks = await jobseekerModel.getBankAccounts({ user_id });

			if (!allBanks || allBanks.length === 0) {
				throw new CustomError(
					"No bank accounts found for this user",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const requestedBank = allBanks.find(
				(b: any) => b.id === Number(id)
			);
			if (!requestedBank) {
				throw new CustomError(
					"Requested bank account not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const updatePromises = allBanks.map((b: any) =>
				jobseekerModel.markAsPrimaryBank(
					{ id: b.id },
					{ is_primary: b.id === Number(id) }
				)
			);

			await Promise.all(updatePromises);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Bank account marked as primary",
			};
		});
	}

	//change password
	public async changePassword(req: Request) {
		const { user_id } = req.jobSeeker;
		const { old_password, new_password } =
			req.body as IChangePasswordPayload;

		const model = this.Model.UserModel();
		const user_details =
			await model.getSingleCommonAuthUser<IJobSeekerAuthView>({
				schema_name: "jobseeker",
				table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
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

	// Make a payout request
	public async requestForPayout(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.jobSeeker;
			const { amount, note } = req.body;

			const jobseekerModel = this.Model.jobSeekerModel(trx);
			const payoutRequestModel = this.Model.payoutRequestModel(trx);

			const jobSeeker = await jobseekerModel.getJobSeekerDetails({
				user_id,
			});

			const availableBalance = parseFloat(
				jobSeeker.available_balance as string
			);

			if (amount > availableBalance) {
				throw new CustomError(
					`Requested amount exceeds your available balance of $${availableBalance}`,
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const isPrimaryAccountExists = Array.isArray(jobSeeker.bank_details)
				? jobSeeker.bank_details.some((bd) => bd.is_primary === true)
				: false;

			if (!isPrimaryAccountExists) {
				throw new CustomError(
					"Primary bank account is not exists for this user. Please add a primary bank account for payout and then request",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const payload = {
				job_seeker_id: user_id,
				amount,
				note,
			};

			await payoutRequestModel.createPayoutRequest(payload);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}
}
