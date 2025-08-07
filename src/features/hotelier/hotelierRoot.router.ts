import AbstractRouter from "../../abstract/abstract.router";
import HotelierCancellationLogRouter from "./router/hotelierCancellationLog.router";
import { HotelierChatRouter } from "./router/hotelierChat.router";
import HotelierJobPostRouter from "./router/hotelierJobPost.router";
import HotelierJobTaskActivitiesRouter from "./router/hotelierJobTaskActivities.router";
import HotelierNotificationRouter from "./router/hotelierNotification.router";
import HotelierReportRouter from "./router/hotelierReport.router";
import PaymentRouter from "./router/payment.router";
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
			"/cancellation-logs",
			new HotelierCancellationLogRouter().router
		);

		this.router.use(
			"/job-task-activity",
			new HotelierJobTaskActivitiesRouter().router
		);

		this.router.use("/reports", new HotelierReportRouter().router);

		this.router.use("/payment", new PaymentRouter().router);

		this.router.use(
			"/notification",
			new HotelierNotificationRouter().router
		);

		this.router.use("/chat", new HotelierChatRouter().router);
	}
}
