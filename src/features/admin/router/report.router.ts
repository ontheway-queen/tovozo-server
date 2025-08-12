import AbstractRouter from "../../../abstract/abstract.router";
import AdminReportController from "../controller/report.controller";

export default class AdminReportRouter extends AbstractRouter {
	private adminReportController = new AdminReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/job-seeker")
			.get(this.adminReportController.getJobSeekersReports);

		this.router
			.route("/hotelier")
			.get(this.adminReportController.getHotelierReports);

		this.router
			.route("/:id")
			.patch(this.adminReportController.reportMarkAsAcknowledge);
	}
}
