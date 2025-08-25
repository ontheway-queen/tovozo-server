import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import CustomError from "../../../utils/lib/customError";
import { USER_TYPE } from "../../../utils/miscellaneous/constants";
import { stripe } from "../../../utils/miscellaneous/stripe";

export default class JobSeekerStripeService extends AbstractServices {
	constructor() {
		super();
	}

	public async addStripePayoutAccount(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.jobSeeker;
			const { email, country } = req.body;

			const files = (req.files as Express.Multer.File[]) || [];

			const filesBody = {} as Record<string, string>;
			if (!files.length) {
				throw new CustomError(
					`Please upload passport and visa copy to complete your profile.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			if (files.length > 3 || files.length < 2) {
				throw new CustomError(
					`Please upload passport, visa and id copy to complete your profile.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			for (const file of files) {
				switch (file.fieldname) {
					case "passport_copy": {
						filesBody.passport_copy = file.filename;
						break;
					}
					case "visa_copy": {
						filesBody.visa_copy = file.filename;
						break;
					}
					case "id_copy": {
						filesBody.id_copy = file.filename;
						break;
					}
					default:
						throw new CustomError(
							"Invalid fieldname",
							this.StatusCode.HTTP_BAD_REQUEST
						);
				}
			}

			const userModel = this.Model.UserModel(trx);
			const user = await userModel.checkUser({ id: user_id });
			const jobSeekerModel = this.Model.jobSeekerModel(trx);

			if (!user || user.length === 0) {
				throw new CustomError("User not found", this.StatusCode.HTTP_NOT_FOUND);
			}

			if (user[0].stripe_acc_id) {
				throw new CustomError(
					"Stripe account already exists for this user",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const fullName = user[0].name.trim().split(" ");
			const first_name = fullName[0];
			const last_name = fullName.slice(1).join(" ");

			const account = await stripe.accounts.create({
				type: "express",
				country,
				email,
				business_type: "individual",
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				individual: {
					first_name,
					last_name,
				},
			});

			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: `${config.BASE_URL}/job-seeker/stripe/onboard/refresh`,
				return_url: `${config.BASE_URL}/job-seeker/stripe/onboard/complete?stripe_acc_id=${account.id}`,
				type: "account_onboarding",
			});

			await jobSeekerModel.updateJobSeekerInfo(filesBody, {
				job_seeker_id: user_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
				data: { url: accountLink.url },
			};
		});
	}

	public async onboardComplete(req: Request) {
		const { user_id } = req.jobSeeker;
		const stripe_acc_id = req.query.stripe_acc_id as string;

		if (!stripe_acc_id) {
			throw new Error("Stripe account ID is required");
		}

		const account = await stripe.accounts.retrieve(stripe_acc_id);
		if (!account.payouts_enabled) {
			await stripe.accounts.del(stripe_acc_id);

			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message:
					"Stripe account not eligible. Account has been deleted. Please onboard again.",
			};
		}

		return await this.db.transaction(async (trx) => {
			const jobSeekerModel = this.Model.jobSeekerModel(trx);
			await jobSeekerModel.addStripePayoutAccount({
				user_id,
				stripe_acc_id,
			});

			await this.insertNotification(trx, USER_TYPE.ADMIN, {
				title: "Onboarding Completed",
				content: `Job Seeker has completed onboarding. Stripe Account ID: ${stripe_acc_id}. Please check the Stripe account to confirm the details.`,
				related_id: user_id,
				sender_type: USER_TYPE.JOB_SEEKER,
				type: "JOB_SEEKER_VERIFICATION",
				user_id,
				sender_id: user_id,
			});
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Onboarding completed successfully",
			};
		});
	}

	public async loginStripeAccount(req: Request) {
		const { user_id } = req.jobSeeker;
		const userModel = this.Model.UserModel();
		const jobSeekerModel = this.Model.jobSeekerModel();
		const checkUser = await userModel.checkUser({ id: user_id });
		if (checkUser.length < 1) {
			throw new CustomError("User not found!", this.StatusCode.HTTP_NOT_FOUND);
		}

		const jobSeeker = await jobSeekerModel.getJobSeekerDetails({ user_id });
		if (!jobSeeker) {
			throw new CustomError(
				"Job seeker not found",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		// if (!jobSeeker.stripe_acc_id) {
		// 	throw new Error(
		// 		"Stripe Account not found. Please complete your profile first!"
		// 	);
		// }

		const loginLink = await stripe.accounts.createLoginLink(
			jobSeeker.stripe_acc_id || "acct_1RnAa4FSzTsJiGrd"
		);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: {
				url: loginLink.url,
			},
		};
	}
}
