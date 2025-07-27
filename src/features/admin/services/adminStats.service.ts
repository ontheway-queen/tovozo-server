import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import AdminStatsModel from "../../../models/adminStats/adminStats.model";

export default class AdminStatsService extends AbstractServices {
	private model: AdminStatsModel;

	constructor() {
		super();
		this.model = new AdminStatsModel(this.db);
	}

	public async generateStatistic(req: Request) {
		const { from, to } = req.query;
		const data = await this.model.generateStatistic({
			from: from as string,
			to: to as string,
		});
		return {
			success: false,
			message: "Admin stats getting successfully",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}
}
