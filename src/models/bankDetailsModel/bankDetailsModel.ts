import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";

class BankDetailsModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async addBankDetails(payload: {
		job_seeker_id: number;
		account_name: string;
		account_number: string;
		bank_code: string;
	}) {
		console.log({ payload });
		return await this.db("bank_details")
			.withSchema(this.JOB_SEEKER)
			.insert(payload, "id");
	}

	public async getBankAccounts(where: {
		user_id?: number;
		id?: number;
		account_number?: string;
		bank_code?: string;
		account_name?: string;
		limit?: number;
		offset?: number;
	}): Promise<{
		data: {
			id: number;
			job_seeker_id: number;
			account_name: string;
			account_number: string;
			bank_code: string;
		}[];
		total: number;
	}> {
		const baseQuery = this.db("bank_details as bd")
			.withSchema(this.JOB_SEEKER)
			.where("bd.is_deleted", false)
			.modify((qb) => {
				if (where.user_id) {
					qb.andWhere("bd.job_seeker_id", where.user_id);
				}
				if (where.id) {
					qb.andWhere("bd.id", where.id);
				}
				if (where.account_number) {
					qb.andWhere("bd.account_number", where.account_number);
				}
				if (where.bank_code) {
					qb.andWhere("bd.bank_code", where.bank_code);
				}
				if (where.account_name) {
					qb.andWhereILike(
						"bd.account_name",
						`%${where.account_name}%`
					);
				}
			});

		const result = await baseQuery
			.clone()
			.count<{ count: string }[]>("bd.id as count");

		const total = Number(result[0].count);

		const data = await baseQuery
			.clone()
			.select(
				"bd.id",
				"bd.job_seeker_id",
				"bd.account_name",
				"bd.account_number",
				"bd.bank_code"
			)
			.orderBy("bd.id", "desc")
			.modify((qb) => {
				if (where.limit) {
					qb.limit(where.limit);
				}
				if (where.offset) {
					qb.offset(where.offset);
				}
			})
			.limit(where.limit || 100)
			.offset(where.offset || 0);

		return {
			total,
			data,
		};
	}

	public async removeBankAccount(where: { id: number; user_id: number }) {
		return await this.db("bank_details")
			.withSchema(this.JOB_SEEKER)
			.update({ is_deleted: true })
			.where("id", where.id)
			.andWhere("job_seeker_id", where.user_id);
	}
}

export default BankDetailsModel;
