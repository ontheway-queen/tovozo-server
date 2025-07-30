import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import StatisticsModel from "../../../models/statistics/statistics.model";
import dayjs from "dayjs";

export default class AdminStatsService extends AbstractServices {
	private model: StatisticsModel;

	constructor() {
		super();
		this.model = new StatisticsModel(this.db);
	}

	public async generateStatistic(req: Request) {
		const now = dayjs();
		const { from_date, to_date } = req.query;
		const { rows, ...rest } = await this.model.generateAdminStatistic({
			from: from_date as string,
			to: to_date as string,
		});

		const financialStats = [];

		for (let i = 0; i < 6; i++) {
			const targetMonth = now.subtract(i, "month").startOf("month");
			const month = targetMonth.format("MMMM");

			const match = rows.find((r) =>
				dayjs(r.month).isSame(targetMonth, "month")
			);

			financialStats.push({
				month,
				hotelier_paid: match?.hotelier_paid || 0,
				job_seeker_get: match?.job_seeker_get || 0,
				admin_earned: match?.admin_earned || 0,
			});
		}

		return {
			success: false,
			message: "Admin stats getting successfully",
			code: this.StatusCode.HTTP_OK,
			data: {
				...rest,
				financialStats,
			},
		};
	}
}
