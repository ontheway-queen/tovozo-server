import AbstractRouter from "../../../abstract/abstract.router";
import AdminJobPostController from "../controller/jobPost.controller";

export default class AdminJobPostRouter extends AbstractRouter {
	private controller = new AdminJobPostController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getJobPostListForAdmin);

		this.router.route("/:id").get(this.controller.getSingleJobPostForAdmin);
	}
}
