import AbstractRouter from "../../../abstract/abstract.router";
import HotelierNotificationController from "../controller/hotelierNotification.controller";

export default class HotelierNotificationRouter extends AbstractRouter {
	private controller = new HotelierNotificationController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getAllNotification)
			.delete(this.controller.deleteNotification)
			.patch(this.controller.readNotification);
	}
}
