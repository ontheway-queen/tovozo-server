import AbstractRouter from "../../../abstract/abstract.router";
import AdminJobApplicationController from "../controller/jobApplication.controller";

export default class AdminJobApplicationRouter extends AbstractRouter {
	private controller = new AdminJobApplicationController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getAllAdminAssignedApplications)
			.post(this.controller.assignJobApplication);
	}
}
