import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetAdminPayment,
	IGetPaymentLedger,
	IGetPaymentsForHotelier,
	IGetPaymentsForJobSeeker,
	IInitializePaymentPayload,
	IPaymentLedgerPayload,
	IPaymentUpdate,
} from "../../utils/modelTypes/payment/paymentModelTypes";
import { TypeUser } from "../../utils/modelTypes/user/userModelTypes";

export default class PaymentModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getLastPaymentId(): Promise<string | null> {
		const result = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.select("payment_no")
			.orderBy("id", "desc")
			.first();

		return result?.payment_no ?? null;
	}

	public async initializePayment(payload: IInitializePaymentPayload) {
		return await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	// Payment For Hotelier
	public async getPaymentsForHotelier(params: {
		hotelier_id: number;
		skip?: number;
		limit?: number;
		search?: string;
		status?: string;
	}): Promise<{ data: IGetPaymentsForHotelier[]; total: number }> {
		const { hotelier_id, skip = 0, limit = 10, search = "" } = params;

		const baseQuery = this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.payment_no",
				"p.application_id",
				"p.total_amount",
				"p.trx_fee",
				"jpd.id as job_post_details_id",
				"job_seeker.id as job_seeker_id",
				"job_seeker.name as job_seeker_name",
				"j.title as job_title",
				"p.payment_type",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.joinRaw(
				`
			LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
		`
			)
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.whereRaw("org.user_id = ?", [hotelier_id])
			.orderBy("p.created_at", "desc");

		if (search) {
			baseQuery.andWhere("j.title", "ilike", `%${search}%`);
		}
		if (params.status) {
			baseQuery.andWhere("p.status", params.status);
		}

		const countQuery = baseQuery
			.clone()
			.clearSelect()
			.clearOrder()
			.count<{ count: string }>("p.id as count")
			.first();

		const dataQuery = baseQuery.offset(skip).limit(limit);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			data,
			total: Number(countResult?.count || 0),
		};
	}

	public async getSinglePaymentForHotelier(
		id: number,
		hotelier_id?: number
	): Promise<IGetPaymentsForHotelier> {
		return await this.db
			.withSchema(this.DBO_SCHEMA)
			.from("payment as p")
			.select(
				"p.id",
				"p.payment_no",
				"p.application_id",
				"p.total_amount",
				"job_seeker.id as job_seeker_id",
				"job_seeker.name as job_seeker_name",
				"j.title as job_title",
				"p.payment_type",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.where("p.id", id)
			.modify((qb) => {
				if (hotelier_id) {
					qb.andWhere("org.user_id", hotelier_id);
				}
			})
			.first();
	}

	// For Hotelier
	public async verifyCheckoutSessionAndUpdatePayment(
		id: number,
		payload: any
	) {
		return await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where({ id })
			.update(payload, "id");
	}

	// Payment For Job Seeker
	public async getPaymentsForJobSeeker({
		job_seeker_id,
		skip,
		limit,
		search,
		status,
	}: {
		job_seeker_id: number;
		skip?: number;
		limit?: number;
		search?: string;
		status?: string;
	}): Promise<{ data: IGetPaymentsForJobSeeker[]; total: number }> {
		const baseQuery = this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.payment_no",
				"p.application_id",
				"org.name as organization_name",
				"j.id as job_post_id",
				"j.title as job_title",
				"p.job_seeker_pay",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(
				`
      LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id
    `
			)
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.where("job_seeker.id", job_seeker_id);

		if (search) {
			baseQuery.andWhere("j.title", "ilike", `%${search}%`);
		}
		if (status) {
			baseQuery.andWhere("p.status", status);
		}

		const countQuery = baseQuery
			.clone()
			.clearSelect()
			.count<{ count: string }>("p.id as count")
			.first();

		const dataQuery = baseQuery
			.offset(skip as number)
			.limit(limit as number);

		const [data, countResult] = await Promise.all([dataQuery, countQuery]);

		return {
			data,
			total: Number(countResult?.count || 0),
		};
	}

	public async getSinglePaymentForJobSeeker(
		id: number,
		job_seeker_id?: number
	): Promise<IGetPaymentsForJobSeeker> {
		return await this.db
			.withSchema(this.DBO_SCHEMA)
			.from("payment as p")
			.select(
				"p.id",
				"p.payment_no",
				"p.application_id",
				"org.name as organization_name",
				"jp.id as job_post_id",
				"j.title as job_title",
				"p.job_seeker_pay",
				"p.status",
				"p.paid_at",
				"p.trx_id"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.joinRaw(`LEFT JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.where("p.id", id)
			.modify((qb) => {
				if (job_seeker_id) {
					qb.andWhere("job_seeker.id", job_seeker_id);
				}
			})
			.first();
	}

	// Payment for Admin
	public async getAllPaymentsForAdmin(params: {
		limit: number;
		skip: number;
		search?: string;
		status?: string;
	}): Promise<{ data: IGetAdminPayment[]; total: number }> {
		const { limit, skip, search, status } = params;

		const data = await this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.application_id",
				"j.title as job_title",
				"job_seeker.id as job_seeker_id",
				"job_seeker.name as job_seeker_name",
				"org.id as paid_by_id",
				"org.name as paid_by",
				"p.total_amount",
				"p.job_seeker_pay",
				"p.platform_fee",
				"p.trx_fee",
				"p.status",
				"p.payment_no",
				"p.trx_id",
				"p.paid_at"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? AS org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.where((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("j.title", `%${search}%`)
							.orWhereILike("job_seeker.name", `%${search}%`);
					});
				}
				if (status) {
					qb.andWhere("p.status", status);
				}
			})
			.orderBy("p.id", "desc")
			.offset(skip)
			.limit(limit);

		const totalResult = await this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")

			.joinRaw(`LEFT JOIN ?? AS org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.where((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("j.title", `%${search}%`)
							.orWhereILike("job_seeker.name", `%${search}%`);
					});
				}
				if (status) {
					qb.andWhere("p.status", status);
				}
			})
			.count("* as count")
			.first();

		const total = Number(totalResult?.count ?? 0);
		return { data, total };
	}

	public async getSinglePaymentForAdmin(
		id: number
	): Promise<IGetAdminPayment> {
		return await this.db("payment as p")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"p.id",
				"p.application_id",
				"j.title as job_title",
				"job_seeker.id as job_seeker_id",
				"job_seeker.name as job_seeker_name",
				"job_seeker.phone_number as job_seeker_phone_number",
				"job_seeker.email as job_seeker_email",
				"org.id as paid_by_id",
				"org.name as paid_by_organization",
				"pu.name as paid_by_name",
				"pu.email as paid_by_email",
				"pu.phone_number as paid_by_phone_number",
				"p.total_amount",
				"p.job_seeker_pay",
				"p.platform_fee",
				"p.status",
				"p.payment_no",
				"p.trx_id",
				"p.trx_fee",
				"p.paid_at"
			)
			.leftJoin("job_applications as ja", "ja.id", "p.application_id")
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			.leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.joinRaw(`LEFT JOIN ?? AS org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.leftJoin("user as pu", "pu.id", "p.paid_by")
			.where("p.id", id)
			.first();
	}

	// Update payment
	public async updatePayment(id: number, payload: IPaymentUpdate) {
		return await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.update(payload)
			.where({ id });
	}

	// create payment ledger
	public async createPaymentLedger(payload: IPaymentLedgerPayload) {
		return await this.db("payment_ledger")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSinglePayment(id: number): Promise<{
		id: number;
		application_id: number;
		job_seeker_pay: number;
		platform_fee: number;
		total_amount: number;
		payment_type: string;
		status: string;
		trx_id: string;
		created_at: Date;
		paid_by: number;
		paid_at: Date;
		is_deleted: boolean;
		payment_no: string;
		trx_fee: number;
	}> {
		return await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.select("*")
			.where({ id })
			.first();
	}

	// Ledger
	public async getAllPaymentLedgerForHotelier(params: {
		user_id: number;
		limit: number;
		skip: number;
		search: string;
	}): Promise<{ data: IGetPaymentLedger[]; total: number }> {
		const { user_id, limit, skip, search } = params;

		const data = await this.db("payment_ledger")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"id",
				"trx_type",
				"amount",
				"details",
				"ledger_date",
				"voucher_no"
			)
			.where("user_id", user_id)
			.andWhere((qb) => {
				if (search) {
					qb.where("details", "ilike", `%${search}%`);
				}
			})
			.orderBy("id", "desc")
			.offset(skip)
			.limit(limit);

		const totalResult = await this.db("payment_ledger")
			.withSchema(this.DBO_SCHEMA)
			.count("* as count")
			.where("user_id", user_id)
			.andWhere((qb) => {
				if (search) {
					qb.where("details", "ilike", `%${search}%`);
				}
			})
			.first();

		const total = Number(totalResult?.count ?? 0);

		return { data, total };
	}

	public async getAllPaymentLedgerForJobSeeker(params: {
		job_seeker_id: number;
		limit: number;
		skip: number;
		search: string;
	}): Promise<{ data: IGetPaymentLedger[]; total: number }> {
		const { job_seeker_id, limit, skip, search } = params;
		const data = await this.db("payment_ledger")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"id",
				"trx_type",
				"amount",
				"details",
				"ledger_date",
				"voucher_no"
			)
			.where("user_id", job_seeker_id)
			.andWhere((qb) => {
				if (search) {
					qb.where("details", "ilike", `%${search}%`);
				}
			})
			.orderBy("id", "desc")
			.offset(skip)
			.limit(limit);
		const totalResult = await this.db("payment_ledger")
			.withSchema(this.DBO_SCHEMA)
			.count("* as count")
			.where("user_id", job_seeker_id)
			.andWhere((qb) => {
				if (search) {
					qb.where("details", "ilike", `%${search}%`);
				}
			})
			.first();
		const total = Number(totalResult?.count ?? 0);
		return { data, total };
	}

	public async getAllPaymentLedgerForAdmin(params: {
		limit: number;
		skip: number;
		search: string;
		type: TypeUser;
		from_date: string;
		to_date: string;
		user_id: number;
	}): Promise<{
		data: {
			id: number;
			trx_type: string;
			amount: string;
			details: string;
			ledger_date: string;
			voucher_no: string;
			job_title: string;
			organization_name: string;
			job_seeker_name: string;
			paid_at: string;
			balance: number;
		}[];
		total: number;
	}> {
		const { limit, skip, search, type, from_date, to_date, user_id } =
			params;

		const baseQuery = this.db("payment_ledger as pl")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"pl.id",
				"pl.trx_type",
				"pl.amount",
				"pl.details",
				"pl.ledger_date",
				"pl.voucher_no",
				"pl.entry_type",
				"pl.user_type",
				"pl.details",
				// "j.title as job_title",
				// "org.name as organization_name",
				// "job_seeker.name as job_seeker_name",
				// "p.paid_at",
				this.db.raw(
					`(SELECT
             SUM(CASE WHEN sub_ml.trx_type = ? THEN sub_ml.amount ELSE 0 END) -
            SUM(CASE WHEN sub_ml.trx_type = ? THEN sub_ml.amount ELSE 0 END)
            FROM dbo.payment_ledger AS sub_ml
            WHERE sub_ml.user_type = 'ADMIN' AND sub_ml.id <= pl.id) as balance`,
					["In", "Out"]
				)
			)
			// .leftJoin("payment as p", "p.payment_no", "pl.voucher_no")
			// .leftJoin("job_applications as ja", "ja.id", "p.application_id")
			// .leftJoin(
			// 	"job_post_details as jpd",
			// 	"jpd.id",
			// 	"ja.job_post_details_id"
			// )
			// .leftJoin("jobs as j", "j.id", "jpd.job_id")
			// .leftJoin("job_post as jp", "jp.id", "ja.job_post_id")
			// .joinRaw(
			// 	`LEFT JOIN hotelier.organization AS org ON org.id = jp.organization_id`
			// )
			// .leftJoin("user as job_seeker", "job_seeker.id", "ja.job_seeker_id")
			.modify((qb) => {
				if (type) {
					qb.where("pl.user_type", type);
				}
				if (search) {
					qb.whereILike("pl.voucher_no", `%${search}%`);
				}
				if (user_id) {
					qb.andWhere("pl.user_id", user_id);
				}
				if (from_date) {
					qb.andWhere("pl.ledger_date", ">=", from_date);
				}
				if (to_date) {
					qb.andWhere(
						"pl.ledger_date",
						"<",
						new Date(
							new Date(to_date).getTime() + 24 * 60 * 60 * 1000
						)
					);
				}
			})
			.orderBy("pl.ledger_date", "asc")
			.orderBy("pl.id", "asc")
			.offset(skip)
			.limit(limit);

		const data = await baseQuery;

		const countQuery = this.db("payment_ledger as pl")
			.withSchema(this.DBO_SCHEMA)
			.count("* as count")
			.modify((qb) => {
				if (type) {
					qb.where("pl.user_type", type);
				}
				if (search) {
					qb.whereILike("pl.voucher_no", `%${search}%`);
				}
				if (user_id) {
					qb.andWhere("pl.user_id", user_id);
				}
				if (from_date) {
					qb.andWhere("pl.ledger_date", ">=", from_date);
				}
				if (to_date) {
					qb.andWhere(
						"pl.ledger_date",
						"<",
						new Date(
							new Date(to_date).getTime() + 24 * 60 * 60 * 1000
						)
					);
				}
			})
			.first();

		const total = Number((await countQuery)?.count ?? 0);

		return { data, total };
	}
}
