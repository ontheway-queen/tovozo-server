import AbstractRouter from "../../../abstract/abstract.router";
import HotelierJobTaskActivitiesController from "../controller/HotelierJobTaskActivities.controller";

export default class HotelierJobTaskActivitiesRouter extends AbstractRouter {
	private hotelierJobTaskActivityController =
		new HotelierJobTaskActivitiesController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/list")
			.post(this.hotelierJobTaskActivityController.createJobTaskList);

		this.router
			.route("/list/:id")
			.patch(this.hotelierJobTaskActivityController.updateJobTaskList)
			.delete(this.hotelierJobTaskActivityController.deleteJobTaskList);

		this.router
			.route("/:id")
			.patch(this.hotelierJobTaskActivityController.approveJobTaskActivity);
	}
}
