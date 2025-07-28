import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	JOB_APPLICATION_STATUS,
	USER_AUTHENTICATION_VIEW,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { IChangePasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";
import { IJobSeekerAuthView } from "../../auth/utils/types/jobSeekerAuth.types";
import { stripe } from "../../../utils/miscellaneous/stripe";

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
			};

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "resume":
						parsed.jobSeekerInfo.resume = filename;
						break;
					case "photo":
						parsed.user.photo = filename;
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
				parsed.user.phone_number !== existingUser.phone_number
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

			if (
				parsed.jobSeekerInfo &&
				Object.keys(parsed.jobSeekerInfo).length > 0
			) {
				updateTasks.push(
					jobSeekerModel.updateJobSeekerInfo(parsed.jobSeekerInfo, {
						job_seeker_id: user_id,
					})
				);
			}

			if (parsed.delJobPreferences.length > 0) {
				updateTasks.push(
					jobSeekerModel.deleteJobPreferences({
						job_seeker_id: user_id,
						job_ids: parsed.delJobPreferences,
					})
				);
			}

			if (parsed.delJobLocations.length > 0) {
				updateTasks.push(
					jobSeekerModel.deleteJobLocations({
						job_seeker_id: user_id,
						location_ids: parsed.delJobLocations,
					})
				);
			}

			if (parsed.delJobShifting.length > 0) {
				updateTasks.push(
					jobSeekerModel.deleteJobShifting({
						job_seeker_id: user_id,
						name: parsed.delJobShifting,
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

			if (parsed.addJobLocations.length > 0) {
				const locationIds = await commonModel.createLocation(
					parsed.addJobLocations
				);

				const jobLocations = locationIds.map((loc: { id: number }) => ({
					job_seeker_id: user_id,
					location_id: loc.id,
				}));

				updateTasks.push(jobSeekerModel.setJobLocations(jobLocations));
			}

			if (parsed.addJobPreferences.length > 0) {
				const existingPrefs = await jobSeekerModel.getJobPreferences(
					user_id
				);

				const existingJobIds = new Set(
					existingPrefs.map((p) => p.job_id)
				);

				const newPrefs = parsed.addJobPreferences.filter(
					(id: number) => !existingJobIds.has(id)
				);

				if (newPrefs.length !== parsed.addJobPreferences.length) {
					throw new CustomError(
						"Some job preferences already exist",
						this.StatusCode.HTTP_BAD_REQUEST,
						"ERROR"
					);
				}

				const preferences = newPrefs.map((job_id: number) => ({
					job_seeker_id: user_id,
					job_id,
				}));

				updateTasks.push(jobSeekerModel.setJobPreferences(preferences));
			}

			if (parsed.addJobShifting.length > 0) {
				const existingShifts = await jobSeekerModel.getJobShifting(
					user_id
				);

				const existingShiftNames = new Set(
					existingShifts.map((s) => s.shift)
				);

				const newShifts = parsed.addJobShifting.filter(
					(shift: string) => !existingShiftNames.has(shift)
				);

				if (newShifts.length !== parsed.addJobShifting.length) {
					throw new CustomError(
						"Some job shifts already exist",
						this.StatusCode.HTTP_BAD_REQUEST,
						"ERROR"
					);
				}

				const shifts = newShifts.map((shift: string) => ({
					job_seeker_id: user_id,
					shift,
				}));

				updateTasks.push(jobSeekerModel.setJobShifting(shifts));
			}

			await Promise.all(updateTasks);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
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
}
