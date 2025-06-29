import AbstractRouter from "../../../abstract/abstract.router";
import JobTaskActivitiesController from "../controller/jobTaskActivities.controller";

export default class JobTaskActivityRouter extends AbstractRouter {
	private controller = new JobTaskActivitiesController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").post(this.controller.createJobTaskActivity);
	}
}
