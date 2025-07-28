import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminStatsService from "../services/adminStats.service";

export default class AdminStatsController extends AbstractController {
	private service: AdminStatsService;

	constructor() {
		super();
		this.service = new AdminStatsService();
	}

	public generateStatistics = this.asyncWrapper.wrap(
		null,
		async (req, res) => {
			const { code, ...data } = await this.service.generateStatistic(req);
			res.status(code).json(data);
		}
	);
}
