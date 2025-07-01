import AbstractRouter from "../../../abstract/abstract.router";
import HotelierReportController from "../controller/HotelierReport.controller";

export default class HotelierReportRouter extends AbstractRouter {
	private hotelierReportController = new HotelierReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(this.hotelierReportController.submitReport)
			.get(this.hotelierReportController.getReportsWithInfo);

		this.router
			.route("/:id")
			.get(this.hotelierReportController.getSingleReportWithInfo);
	}
}
