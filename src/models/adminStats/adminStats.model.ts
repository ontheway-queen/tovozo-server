import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { USER_TYPE } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

interface IStatsQuery {
	from?: string; // e.g. '2025-07-01'
	to?: string; // e.g. '2025-07-27'
}

export default class AdminStatsModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async generateStatistic(query: IStatsQuery) {
		const { from, to } = query;

		const dateFilter = (qb: any, table = "created_at") => {
			if (from) qb.where(table, ">=", from);
			if (to) qb.where(table, "<=", to);
		};

		const [totalJobSeekers] = await this.db("job_seeker")
			.withSchema(this.JOB_SEEKER)
			.modify((qb) => dateFilter(qb))
			.count("user_id as total");

		const [totalHoteliers] = await this.db("organization")
			.withSchema(this.HOTELIER)
			.modify((qb) => dateFilter(qb))
			.count("user_id as total");

		const today = new Date().toISOString().split("T")[0];

		const [newJobSeekers] = await this.db("user")
			.withSchema(this.DBO_SCHEMA)
			.whereRaw(`DATE(created_at) = ?`, [today])
			.andWhere("type", USER_TYPE.JOB_SEEKER)
			.count("id as total");

		const [newHoteliers] = await this.db("user")
			.withSchema(this.DBO_SCHEMA)
			.whereRaw(`DATE(created_at) = ?`, [today])
			.andWhere("type", USER_TYPE.HOTELIER)
			.count("id as total");

		const [totalJobPosts] = await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.modify((qb) => dateFilter(qb))
			.count("id as total");

		const [activeJobPosts] = await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Live")
			.modify((qb) => dateFilter(qb))
			.count("id as total");

		const [cancelledJobPosts] = await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Cancelled")
			.modify((qb) => dateFilter(qb))
			.count("id as total");

		const [successfulHires] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Paid")
			.modify((qb) => dateFilter(qb))
			.countDistinct("application_id as total");

		const [totalPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [pendingPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Unpaid")
			.modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [paidPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Paid")
			.modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [totalReports] = await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.modify((qb) => dateFilter(qb))
			.count("id as total");

		return {
			jobSeekers: {
				total: Number(totalJobSeekers.total),
				new: Number(newJobSeekers.total),
			},
			hoteliers: {
				total: Number(totalHoteliers.total),
				new: Number(newHoteliers.total),
			},
			jobPosts: {
				total: Number(totalJobPosts.total),
				active: Number(activeJobPosts.total),
				cancelled: Number(cancelledJobPosts.total),
			},
			successfulHires: Number(successfulHires.total),
			payments: {
				total: Number(totalPayments.total || 0),
				paid: Number(paidPayments.total || 0),
				pending: Number(pendingPayments.total || 0),
			},
			reports: Number(totalReports.total),
		};
	}
}
