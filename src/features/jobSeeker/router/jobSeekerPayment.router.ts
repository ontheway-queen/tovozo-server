import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerPaymentController from "../controller/jobSeekerPayment.controller";

export default class JobSeekerPaymentRouter extends AbstractRouter {
	private controller = new JobSeekerPaymentController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getJobSeekerPayments);
	}
}
