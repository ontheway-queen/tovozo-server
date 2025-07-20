import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICreatePaymentPayload,
	IGetPaymentsForHotelier,
} from "../../utils/modelTypes/payment/paymentModelTypes";

export default class PaymentModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getLastPaymentId(): Promise<string | null> {
		const result = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.select("payment_id")
			.orderBy("id", "desc")
			.first();

		return result?.id ?? null;
	}

	public async createPayment(payload: ICreatePaymentPayload) {
		return await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	// For Hotelier
	public async getPaymentsForHotelier(params: {
		hotelier_id: number;
		skip?: number;
		limit?: number;
		search?: string;
	}): Promise<{ data: IGetPaymentsForHotelier[]; total: number }> {
		const { hotelier_id, skip = 0, limit = 10, search = "" } = params;

		const baseQuery = this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.payment_id",
				"p.application_id",
				"job_seeker.name as job_seeker_name",
				"jp.id as job_post_id",
				"jp.title as job_title",
				"p.payment_type",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(
				`
			LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
		`
			)
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.whereRaw("org.user_id = ?", [hotelier_id]);

		if (search) {
			baseQuery.andWhere("jp.title", "ilike", `%${search}%`);
		}

		const countQuery = baseQuery
			.clone()
			.clearSelect()
			.count<{ count: string }>("p.id as count")
			.first();

		const dataQuery = baseQuery.offset(skip).limit(limit);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			data,
			total: Number(countResult?.count || 0),
		};
	}

	// For Job Seeker
	public async getPaymentsForJobSeeker(
		job_seeker_id: number,
		skip: number = 0,
		limit: number = 10,
		search: string = ""
	): Promise<{ data: IGetPaymentsForHotelier[]; total: number }> {
		const baseQuery = this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.payment_id",
				"p.application_id",
				"org.name as organization_name",
				"jp.id as job_post_id",
				"jp.title as job_title",
				"p.job_seeker_pay",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(
				`
      LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
    `
			)
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.where("job_seeker.id", job_seeker_id);

		if (search) {
			baseQuery.andWhere("jp.title", "ilike", `%${search}%`);
		}

		const countQuery = baseQuery
			.clone()
			.clearSelect()
			.count<{ count: string }>("p.id as count")
			.first();

		const dataQuery = baseQuery.offset(skip).limit(limit);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			data,
			total: Number(countResult?.count || 0),
		};
	}
}
