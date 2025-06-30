import AbstractRouter from "../../abstract/abstract.router";
import HotelierCancellationReportRouter from "./router/hotelierCancellationReport.router";
import HotelierJobPostRouter from "./router/hotelierJobPost.router";
import HotelierJobTaskActivitiesRouter from "./router/hotelierJobTaskActivities.router";
import HotelierReportRouter from "./router/hotelierReport.router";
import HotelierProfileRouter from "./router/profile.router";

export default class HotelierRootRouter extends AbstractRouter {
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// profile router
		this.router.use("/profile", new HotelierProfileRouter().router);

		this.router.use("/job-post", new HotelierJobPostRouter().router);

		this.router.use(
			"/cancellation-reports",
			new HotelierCancellationReportRouter().router
		);

		this.router.use(
			"/job-task-activity",
			new HotelierJobTaskActivitiesRouter().router
		);

		this.router.use("/reports", new HotelierReportRouter().router);
	}
}
