import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";

export default class JobSeekerPayoutService extends AbstractServices {
	constructor() {
		super();
	}

	// Make a payout request
	public async requestForPayout(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.jobSeeker;
			const { amount, note } = req.body;

			const jobseekerModel = this.Model.jobSeekerModel(trx);
			const payoutModel = this.Model.payoutModel(trx);
			console.log(1);
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

			console.log(2);
			const { data } = await payoutModel.getPayoutsForJobSeeker({
				user_id,
				status: "Pending",
			});

			if (data.length > 0) {
				throw new CustomError(
					"You already have a pending payout request. Only one payout request can be made at a time.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			console.log(3);
			const primaryBankAccount = Array.isArray(jobSeeker.bank_details)
				? jobSeeker.bank_details.find((bd) => bd.is_primary === true)
				: null;

			if (!primaryBankAccount) {
				throw new CustomError(
					"Primary bank account is not exists for this user. Please add a primary bank account for payout and then request",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}
			console.log(4);
			const payload = {
				job_seeker_id: user_id,
				amount,
				job_seeker_note: note,
				bank_account_name: primaryBankAccount.account_name,
				bank_account_number: primaryBankAccount.account_number,
				bank_code: primaryBankAccount.bank_code,
			};

			await payoutModel.createPayout(payload);
			console.log(5);
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async getPayoutsForJobSeeker(req: Request) {
		const { user_id } = req.jobSeeker;
		const { search, limit, skip } = req.query;
		const payoutModel = this.Model.payoutModel();
		const { data, total } = await payoutModel.getPayoutsForJobSeeker({
			search: search as string,
			limit: Number(limit),
			skip: Number(skip),
			user_id,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			total,
			data,
		};
	}

	public async getSinglePayout(req: Request) {
		const id = Number(req.params.id);
		const payoutModel = this.Model.payoutModel();
		const data = await payoutModel.getSinglePayout({
			id,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data,
		};
	}
}
