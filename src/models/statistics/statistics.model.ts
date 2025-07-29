import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { USER_TYPE } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

interface IStatsQuery {
	from?: string; // e.g. '2025-07-01'
	to?: string; // e.g. '2025-07-27'
}

export default class StatisticsModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async generateAdminStatistic(query: IStatsQuery) {
		const { from, to } = query;
		const today = new Date();
		const startOfLastMonth = new Date(
			today.getFullYear(),
			today.getMonth() - 1,
			1
		);
		const endOfLastMonth = new Date(
			today.getFullYear(),
			today.getMonth(),
			0
		); // last day of previous month

		const finalFrom = from || startOfLastMonth.toISOString().split("T")[0];
		const finalTo = to || endOfLastMonth.toISOString().split("T")[0];

		const dateFilter = (qb: any, table = "paid_at") => {
			if (from || startOfLastMonth.toISOString())
				qb.where(table, ">=", from || startOfLastMonth.toISOString());
			if (to || endOfLastMonth.toISOString())
				qb.where(table, "<=", to || endOfLastMonth.toISOString());
		};

		const [totalJobSeekers] = await this.db("job_seeker")
			.withSchema(this.JOB_SEEKER)
			// .modify((qb) => dateFilter(qb))
			.count("user_id as total");

		const [totalHoteliers] = await this.db("organization")
			.withSchema(this.HOTELIER)
			// .modify((qb) => dateFilter(qb))
			.count("user_id as total");

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
			// .modify((qb) => dateFilter(qb))
			.count("id as total");

		const [activeJobPosts] = await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Live")
			// .modify((qb) => dateFilter(qb))
			.count("id as total");

		const [cancelledJobPosts] = await this.db("job_post")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Cancelled")
			// .modify((qb) => dateFilter(qb))
			.count("id as total");

		const [successfulHires] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Paid")
			// .modify((qb) => dateFilter(qb))
			.countDistinct("application_id as total");

		const [totalPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			// .modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [pendingPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Unpaid")
			// .modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [paidPayments] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Paid")
			// .modify((qb) => dateFilter(qb))
			.sum("total_amount as total");

		const [pendingReports] = await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Pending")
			// .modify((qb) => dateFilter(qb))
			.count("id as total");

		const latestApplications = await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id",
				"ja.job_post_details_id",
				"j.title as job_title",
				"ja.job_seeker_id",
				"jsu.name as job_seeker_name",
				"jsu.photo as job_seeker_photo",
				"ja.status",
				"ja.created_at"
			)
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "j.id", "jpd.job_id")
			.leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
			.orderBy("created_at", "desc")
			.where("ja.status", "Pending")
			.limit(5);

		const [pendingJobSeekers] = await this.db("job_seeker")
			.withSchema(this.JOB_SEEKER)
			.where("account_status", "Pending")
			.count("user_id as total");

		console.log({ pendingJobSeekers });

		const [inactiveJobSeekers] = await this.db("job_seeker")
			.withSchema(this.JOB_SEEKER)
			.where("account_status", "Inactive")
			.count("user_id as total");

		const [pendingHoteliers] = await this.db("organization")
			.withSchema(this.HOTELIER)
			.where("status", "Pending")
			.count("user_id as total");

		const [inactiveHoteliers] = await this.db("organization")
			.withSchema(this.HOTELIER)
			.where("status", "Inactive")
			.count("user_id as total");

		const [lastMonthStats] = await this.db("payment")
			.withSchema(this.DBO_SCHEMA)
			.where("status", "Paid")
			// .modify((qb) => dateFilter(qb, "paid_at"))
			.sum({
				hotelier_paid: "total_amount",
				job_seeker_get: "job_seeker_pay",
				admin_earned: "platform_fee",
			});

		return {
			jobSeekers: {
				total: Number(totalJobSeekers.total),
				new: Number(newJobSeekers.total),
				pending: Number(pendingJobSeekers.total),
				inactive: Number(inactiveJobSeekers.total),
			},
			hoteliers: {
				total: Number(totalHoteliers.total),
				new: Number(newHoteliers.total),
				pending: Number(pendingHoteliers.total),
				inactive: Number(inactiveHoteliers.total),
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
			reports: {
				pending: Number(pendingReports.total),
			},
			latestApplications,
			lastMonthFinancials: {
				hotelier_paid: Number(lastMonthStats.hotelier_paid || 0),
				job_seeker_get: Number(lastMonthStats.job_seeker_get || 0),
				admin_earned: Number(lastMonthStats.admin_earned || 0),
			},
		};
	}
}
