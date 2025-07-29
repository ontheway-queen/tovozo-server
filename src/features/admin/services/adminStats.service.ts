import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import StatisticsModel from "../../../models/statistics/statistics.model";

export default class AdminStatsService extends AbstractServices {
	private model: StatisticsModel;

	constructor() {
		super();
		this.model = new StatisticsModel(this.db);
	}

	public async generateStatistic(req: Request) {
		const { from_date, to_date } = req.query;
		const data = await this.model.generateAdminStatistic({
			from: from_date as string,
			to: to_date as string,
		});
		return {
			success: false,
			message: "Admin stats getting successfully",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}
}
