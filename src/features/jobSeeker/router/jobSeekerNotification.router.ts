import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerNotificationController from "../controller/jobSeekerNotification.controller";

export default class jobSeekerNotificationRouter extends AbstractRouter {
	private controller = new JobSeekerNotificationController();
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
