import dayjs from "dayjs";
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
		const now = dayjs();
		const sixMonthsAgo = now.subtract(5, "month").startOf("month").toDate();

		const [
			jobSeekersData,
			hoteliersData,
			jobPostsData,
			paymentStats,
			reportStats,
			latestApplications,
			paymentChart,
		] = await Promise.all([
			// Job seekers
			this.db("job_seeker as js")
				.withSchema(this.JOB_SEEKER)
				.select(
					this.db.raw("COUNT(*) AS total"),
					this.db.raw(
						"SUM(CASE WHEN account_status = 'Pending' THEN 1 ELSE 0 END) AS pending"
					),
					this.db.raw(
						"SUM(CASE WHEN account_status = 'Inactive' THEN 1 ELSE 0 END) AS inactive"
					)
				)
				.first(),

			// Hoteliers
			this.db("organization as org")
				.withSchema(this.HOTELIER)
				.select(
					this.db.raw("COUNT(*) AS total"),
					this.db.raw(
						"SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending"
					),
					this.db.raw(
						"SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive"
					)
				)
				.first(),

			// Job posts
			this.db("job_post as jp")
				.withSchema(this.DBO_SCHEMA)
				.select(
					this.db.raw("COUNT(*) AS total"),
					this.db.raw(
						"SUM(CASE WHEN status = 'Live' THEN 1 ELSE 0 END) AS active"
					),
					this.db.raw(
						"SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled"
					)
				)
				.first(),

			// Payments
			this.db("payment as p")
				.withSchema(this.DBO_SCHEMA)
				.select(
					this.db.raw("SUM(total_amount) AS total"),
					this.db.raw(
						"SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END) AS paid"
					),
					this.db.raw(
						"SUM(CASE WHEN status = 'Unpaid' THEN total_amount ELSE 0 END) AS pending"
					),
					this.db.raw(
						"COUNT(DISTINCT CASE WHEN status = 'Paid' THEN application_id ELSE NULL END) AS successful_hires"
					)
				)
				.first(),

			// Reports
			this.db("reports as r")
				.withSchema(this.DBO_SCHEMA)
				.select(
					this.db.raw(
						"SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending"
					)
				)
				.first(),

			// Latest applications
			this.db("job_applications as ja")
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
				.where("ja.status", "Pending")
				.orderBy("ja.created_at", "desc")
				.limit(5),

			// Payment chart (last 6 months)
			this.db("payment")
				.withSchema(this.DBO_SCHEMA)
				.select(
					this.db.raw(
						`TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM-DD') AS month`
					),
					this.db.raw(`SUM(total_amount) AS hotelier_paid`),
					this.db.raw(`SUM(job_seeker_pay) AS job_seeker_get`),
					this.db.raw(`SUM(platform_fee) AS admin_earned`)
				)
				.where("status", "Paid")
				.andWhere("paid_at", ">=", sixMonthsAgo)
				.groupByRaw(`DATE_TRUNC('month', paid_at)`)
				.orderByRaw(`DATE_TRUNC('month', paid_at) DESC`),
		]);

		return {
			jobSeekers: {
				total: Number(jobSeekersData.total),
				new: await this.countNewUsers(USER_TYPE.JOB_SEEKER, today),
				pending: Number(jobSeekersData.pending),
				inactive: Number(jobSeekersData.inactive),
			},
			hoteliers: {
				total: Number(hoteliersData.total),
				new: await this.countNewUsers(USER_TYPE.HOTELIER, today),
				pending: Number(hoteliersData.pending),
				inactive: Number(hoteliersData.inactive),
			},
			jobPosts: {
				total: Number(jobPostsData.total),
				active: Number(jobPostsData.active),
				cancelled: Number(jobPostsData.cancelled),
			},
			successfulHires: Number(paymentStats.successful_hires),
			payments: {
				total: Number(paymentStats.total || 0),
				paid: Number(paymentStats.paid || 0),
				pending: Number(paymentStats.pending || 0),
			},
			reports: {
				pending: Number(reportStats.pending),
			},
			latestApplications,
			rows: paymentChart,
		};
	}

	// Helper to count today's new users
	private async countNewUsers(type: string, today: Date) {
		const start = dayjs(today).startOf("day").toDate();
		const end = dayjs(today).endOf("day").toDate();

		const [result] = await this.db("user")
			.withSchema(this.DBO_SCHEMA)
			.where("type", type)
			.andWhere("created_at", ">=", start)
			.andWhere("created_at", "<=", end)
			.count("id as total");

		return Number(result.total);
	}
}
