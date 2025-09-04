import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetAllPayouts,
	IGetSinglePayout,
} from "../../utils/modelTypes/common/commonModelTypes";

export default class PayoutModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createPayout(payload: {
		job_seeker_id: number;
		amount: number;
		job_seeker_note: string;
		bank_account_name: string;
		bank_account_number: string;
		bank_code: string;
	}) {
		return await this.db("payout")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	// Get All Payout Request for job seeker
	public async getPayoutsForJobSeeker({
		search,
		limit = 20,
		skip = 0,
		status,
		user_id,
	}: {
		search?: string;
		limit?: number;
		skip?: number;
		status?: string;
		user_id: number;
	}): Promise<{ total: number; data: IGetAllPayouts[] }> {
		const baseQuery = this.db("payout as pr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"pr.id",
				"pr.job_seeker_id",
				"jsu.name as job_seeker_name",
				"jsu.email as job_seeker_email",
				"pr.amount",
				"pr.status",
				"pr.requested_at",
				"pr.managed_by",
				"pr.managed_at",
				"pr.transaction_reference",
				"pr.job_seeker_note",
				"pr.admin_note",
				"pr.bank_account_name",
				"pr.bank_account_number",
				"pr.bank_code",
				"pr.is_deleted"
			)
			.joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.where("pr.job_seeker_id", user_id)
			.modify((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("jsu.name", `%${search}%`)
							.orWhereILike("jsu.email", `%${search}%`)
							.orWhereILike("pr.bank_account_name", `%${search}%`)
							.orWhereILike(
								"pr.bank_account_number",
								`%${search}%`
							)
							.orWhereILike("pr.bank_code", `%${search}%`);
					});
				}

				if (status) {
					qb.andWhere("pr.status", status);
				}
			})
			.orderBy("pr.requested_at", "desc");

		const countQuery = this.db("payout as pr")
			.withSchema(this.DBO_SCHEMA)
			.count<{ count: string }>("pr.id as count")
			.joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.where("pr.job_seeker_id", user_id)
			.modify((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("jsu.name", `%${search}%`)
							.orWhereILike("jsu.email", `%${search}%`)
							.orWhereILike("pr.bank_account_name", `%${search}%`)
							.orWhereILike(
								"pr.bank_account_number",
								`%${search}%`
							)
							.orWhereILike("pr.bank_code", `%${search}%`);
					});
				}

				if (status) {
					qb.andWhere("pr.status", status);
				}
			})
			.first();

		const dataQuery = baseQuery.offset(skip).limit(limit);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			total: Number(countResult?.count || 0),
			data,
		};
	}

	public async getSinglePayout(where: {
		id: number;
	}): Promise<IGetSinglePayout> {
		return await this.db("payout as pr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"pr.id",
				"pr.job_seeker_id",
				"jsu.name as job_seeker_name",
				"jsu.email as job_seeker_email",
				"pr.amount",
				"pr.status",
				"pr.requested_at",
				"pr.managed_by as managed_by_id",
				"ua.name as managed_by_name",
				"ua.photo as managed_by_photo",
				"pr.managed_at",
				"pr.transaction_reference",
				"pr.job_seeker_note",
				"pr.admin_note",
				"pr.bank_account_name",
				"pr.bank_account_number",
				"pr.bank_code",
				"pr.is_deleted"
			)
			.joinRaw(`LEFT JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.joinRaw(`LEFT JOIN ?? as ua ON ua.id = pr.managed_by`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.where("pr.id", where.id)
			.first();
	}

	// Get All Payout Request for admin
	public async getAllPayoutForAdmin({
		search,
		limit = 20,
		skip = 0,
	}: {
		search?: string;
		limit?: number;
		skip?: number;
	}): Promise<{ total: number; data: IGetAllPayouts[] }> {
		const baseQuery = this.db("payout as pr")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"pr.id",
				"pr.job_seeker_id",
				"jsu.name as job_seeker_name",
				"jsu.email as job_seeker_email",
				"pr.amount",
				"pr.status",
				"pr.requested_at",
				"pr.managed_by",
				"pr.managed_at",
				"pr.transaction_reference",
				"pr.job_seeker_note",
				"pr.bank_account_name",
				"pr.bank_account_number",
				"pr.bank_code",
				"pr.is_deleted"
			)
			.joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.modify((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("jsu.name", `%${search}%`)
							.orWhereILike("jsu.email", `%${search}%`)
							.orWhereILike("pr.bank_account_name", `%${search}%`)
							.orWhereILike(
								"pr.bank_account_number",
								`%${search}%`
							)
							.orWhereILike("pr.bank_code", `%${search}%`);
					});
				}
			})
			.orderBy("pr.requested_at", "desc");

		const countQuery = this.db("payout as pr")
			.withSchema(this.DBO_SCHEMA)
			.count<{ count: string }>("pr.id as count")
			.joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.modify((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("jsu.name", `%${search}%`)
							.orWhereILike("jsu.email", `%${search}%`)
							.orWhereILike("pr.bank_account_name", `%${search}%`)
							.orWhereILike(
								"pr.bank_account_number",
								`%${search}%`
							)
							.orWhereILike("pr.bank_code", `%${search}%`);
					});
				}
			})
			.first();

		const dataQuery = baseQuery.offset(skip).limit(limit);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			total: Number(countResult?.count || 0),
			data,
		};
	}

	public async managePayout({
		id,
		payload,
	}: {
		id: number;
		payload: {
			stauts: string;
			admin_note: string;
			transaction_reference?: string;
			approved_at: Date;
			approved_by: number;
			voucher_no?: string;
		};
	}) {
		return await this.db("payout")
			.withSchema(this.DBO_SCHEMA)
			.update(payload)
			.where("id", id);
	}
}
