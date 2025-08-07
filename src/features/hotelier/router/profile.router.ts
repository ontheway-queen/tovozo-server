import AbstractRouter from "../../../abstract/abstract.router";
import HotelierProfileController from "../controller/profile.controller";

export default class HotelierProfileRouter extends AbstractRouter {
	private controller = new HotelierProfileController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// get profile
		this.router
			.route("/")
			.get(this.controller.getProfile)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.HOTELIER_FILES),
				this.controller.updateHotelier
			);

		// change password
		this.router
			.route("/change-password")
			.post(this.controller.changePassword);
	}
}
