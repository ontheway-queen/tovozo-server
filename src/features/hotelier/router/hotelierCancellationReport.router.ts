import AbstractRouter from "../../../abstract/abstract.router";
import HotelierCancellationReportController from "../controller/hotelierCancellationReport.controller";

export default class HotelierCancellationReportRouter extends AbstractRouter {
	private controller = new HotelierCancellationReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getCancellationReports);

		this.router
			.route("/:id")
			.get(this.controller.getCancellationReport)
			.delete(this.controller.cancelJobPostReport);
	}
}
