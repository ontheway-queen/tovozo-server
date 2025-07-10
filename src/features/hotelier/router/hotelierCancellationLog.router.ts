import AbstractRouter from "../../../abstract/abstract.router";
import HotelierCancellationReportController from "../controller/hotelierCancellationReport.controller";

export default class HotelierCancellationLogRouter extends AbstractRouter {
	private controller = new HotelierCancellationReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getCancellationLogs);

		this.router
			.route("/:id")
			.get(this.controller.getCancellationLog)
			.delete(this.controller.cancelJobPostCancellationLog);
	}
}
