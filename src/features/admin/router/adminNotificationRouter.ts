import AbstractRouter from "../../../abstract/abstract.router";
import AdminNotificationController from "../controller/adminNotificationController";

export default class AdminNotificationRouter extends AbstractRouter {
	private controller = new AdminNotificationController();
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
