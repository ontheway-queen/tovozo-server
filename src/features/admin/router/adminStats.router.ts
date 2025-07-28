import AbstractRouter from "../../../abstract/abstract.router";
import AdminStatsController from "../controller/adminStats.controller";

export default class AdminStatsRouter extends AbstractRouter {
	private controller: AdminStatsController;

	constructor() {
		super();
		this.controller = new AdminStatsController();
		this.callRouter();
	}

	callRouter() {
		this.router.route("/").get(this.controller.generateStatistics);
	}
}
