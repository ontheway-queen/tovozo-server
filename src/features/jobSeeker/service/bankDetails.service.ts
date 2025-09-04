import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export default class BankDetailsService extends AbstractServices {
	constructor() {
		super();
	}

	public async getBankAccounts(req: Request) {
		const { user_id } = req.jobSeeker;
		const { account_number, bank_code, account_name, limit, skip } =
			req.query;
		const model = this.Model.bankDetailsModel();

		const { data, total } = await model.getBankAccounts({
			user_id,
			account_number: account_number as string,
			bank_code: bank_code as string,
			account_name: account_name as string,
			limit: Number(limit),
			offset: Number(skip),
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Bank accounts fetched successfully.",
			total,
			data,
		};
	}

	public async addBankAccounts(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.jobSeeker;
			const { account_number, bank_code, account_name } = req.body;
			const model = this.Model.bankDetailsModel(trx);

			const { data, total } = await model.getBankAccounts({
				user_id,
				account_number: account_number as string,
				bank_code: bank_code as string,
				account_name: account_name as string,
			});

			if (total > 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: this.ResMsg.HTTP_CONFLICT,
				};
			}

			await model.addBankDetails({
				job_seeker_id: user_id,
				account_name,
				account_number,
				bank_code,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Bank account added successfully.",
			};
		});
	}

	public async removeBankAccount(req: Request) {
		const { user_id } = req.jobSeeker;
		const id = Number(req.params.id);
		const model = this.Model.bankDetailsModel();

		const { total } = await model.getBankAccounts({
			user_id,
			id,
		});

		if (total === 0) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: "Bank account not found.",
			};
		}

		await model.removeBankAccount({ id, user_id });

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Bank account delete successfully.",
		};
	}
}
