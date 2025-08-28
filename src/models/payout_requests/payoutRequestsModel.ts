import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";

export default class PayoutRequestsModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createPayoutRequest(payload: {
		job_seeker_id: number;
		amount: number;
		note: string;
	}) {
		return await this.db("payout_requests")
			.withSchema(this.JOB_SEEKER)
			.insert(payload, "id");
	}

	// Get All Payout Request for admin
	public async getAllPayoutRequests({
		search,
		limit = 20,
		skip = 0,
	}: {
		search?: string;
		limit?: number;
		skip?: number;
	}) {
		const baseQuery = this.db("payout_requests as pr")
			.withSchema(this.JOB_SEEKER)
			.select(
				"pr.id",
				"pr.job_seeker_id",
				"jsu.name as job_seeker_name",
				"jsu.email as job_seeker_email",
				"pr.amount",
				"pr.status",
				"pr.requested_at",
				"pr.approved_by",
				"pr.approved_at",
				"pr.paid_at",
				"pr.transaction_reference",
				"pr.note",
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
							.orWhereILike("jsu.email", `%${search}%`);
					});
				}
			})
			.orderBy("pr.requested_at", "desc");

		const countQuery = this.db("payout_requests as pr")
			.withSchema(this.JOB_SEEKER)
			.count<{ count: string }>("pr.id as count")
			.joinRaw(`JOIN ?? as jsu ON jsu.id = pr.job_seeker_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.modify((qb) => {
				if (search) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("jsu.name", `%${search}%`)
							.orWhereILike("jsu.email", `%${search}%`);
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
}
