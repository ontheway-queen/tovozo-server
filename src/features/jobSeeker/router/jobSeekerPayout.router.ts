import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerPayoutController from "../controller/jobSeekerPayout.controller";

export default class JobSeekerPayoutRoute extends AbstractRouter {
	private controller = new JobSeekerPayoutController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(this.controller.requestForPayout)
			.get(this.controller.getPayoutsForJobSeeker);

		this.router.route("/:id").get(this.controller.getSinglePayout);
	}
}
